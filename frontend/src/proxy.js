import { NextResponse } from "next/server";

const ROLE_HOME = {
  customer: "/customer",
  vendor: "/vendor",
  admin: "/admin",
  superadmin: "/admin",
};

const PROTECTED_AREAS = [
  { prefix: "/customer", roles: ["customer"] },
  { prefix: "/vendor", roles: ["vendor"] },
  { prefix: "/admin", roles: ["admin", "superadmin"] },
];

function getSetCookieHeaders(headers) {
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();

  const setCookie = headers.get("set-cookie");
  return setCookie ? [setCookie] : [];
}

function mergeCookies(cookieHeader, setCookieHeaders) {
  const cookies = new Map();

  for (const part of (cookieHeader || "").split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name) cookies.set(name, value.join("="));
  }

  for (const setCookie of setCookieHeaders) {
    const [nameValue] = setCookie.split(";");
    const [name, ...value] = nameValue.trim().split("=");
    if (name) cookies.set(name, value.join("="));
  }

  return Array.from(cookies, ([name, value]) => `${name}=${value}`).join("; ");
}

async function fetchCurrentUser(apiUrl, cookieHeader) {
  const response = await fetch(`${apiUrl}/auth/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (!response.ok) return { response, user: null };

  const body = await response.json();
  return { response, user: body?.user || body };
}

async function getAuthenticatedUser(request) {
  const apiUrl = (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  const cookieHeader = request.headers.get("cookie") || "";

  if (!apiUrl || (!cookieHeader.includes("refresh_token=") && !cookieHeader.includes("access_token="))) {
    return { user: null, refreshedCookies: [] };
  }

  try {
    const current = await fetchCurrentUser(apiUrl, cookieHeader);
    if (current.user) return { user: current.user, refreshedCookies: [] };

    if (current.response.status !== 401) {
      return { user: null, refreshedCookies: [] };
    }

    // Retain the existing NestJS refresh flow when the access token expires.
    const refresh = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    if (!refresh.ok) return { user: null, refreshedCookies: [] };

    const refreshedCookies = getSetCookieHeaders(refresh.headers);
    const refreshedUser = await fetchCurrentUser(
      apiUrl,
      mergeCookies(cookieHeader, refreshedCookies),
    );

    return { user: refreshedUser.user, refreshedCookies };
  } catch {
    // Fail closed if the authentication service cannot be reached.
    return { user: null, refreshedCookies: [] };
  }
}

function applyRefreshedCookies(response, cookies) {
  for (const cookie of cookies) response.headers.append("set-cookie", cookie);
  return response;
}

export async function proxy(request) {
  const pathname = request.nextUrl.pathname;
  const area = PROTECTED_AREAS.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!area) return NextResponse.next();

  const { user, refreshedCookies } = await getAuthenticatedUser(request);
  const role = String(user?.role || "").trim().toLowerCase();

  if (!user || !ROLE_HOME[role]) {
    return applyRefreshedCookies(
      NextResponse.redirect(new URL("/login", request.url)),
      refreshedCookies,
    );
  }

  if (!area.roles.includes(role)) {
    return applyRefreshedCookies(
      NextResponse.redirect(new URL(ROLE_HOME[role], request.url)),
      refreshedCookies,
    );
  }

  return applyRefreshedCookies(NextResponse.next(), refreshedCookies);
}

// Next.js 16 accepts either a named `proxy` export or a default export.
// Export both to make the convention explicit for Turbopack.
export default proxy;

export const config = {
  matcher: ["/customer/:path*", "/vendor/:path*", "/admin/:path*"],
};
