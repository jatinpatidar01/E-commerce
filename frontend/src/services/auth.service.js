import { api } from "../lib/api";
import { persistAuth, clearStoredAuth } from "../lib/auth";

export async function login(email, password) {
  const cleanedEmail = String(email || "").trim();
  const cleanedPassword = String(password || "").trim();

  if (!cleanedEmail || !cleanedPassword) {
    throw new Error("Email and password are required");
  }

  const payload = await api.post("/auth/login", {
    email: cleanedEmail,
    password: cleanedPassword,
  });

  const authData =
    payload?.data ||
    payload?.result ||
    payload ||
    {};

  const savedAuth = persistAuth(authData);

  const normalizedRole =
    authData.role ||
    authData.user?.role ||
    authData.profile?.role ||
    authData.data?.user?.role ||
    authData.userRole ||
    savedAuth?.role ||
    "customer";

  return {
    ...payload,

    user:
      authData.user ||
      authData.profile ||
      authData.data?.user ||
      null,

    role: normalizedRole,

    accessToken:
      savedAuth?.accessToken ||
      authData.accessToken ||
      authData.access_token ||
      authData.token?.accessToken ||
      authData.token?.access_token ||
      null,

    refreshToken:
      savedAuth?.refreshToken ||
      authData.refreshToken ||
      authData.refresh_token ||
      authData.token?.refreshToken ||
      authData.token?.refresh_token ||
      null,
  };
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
  }
  clearStoredAuth();
}
export async function register(name, email, password) {
  const cleanedName = String(name || "").trim();
  const cleanedEmail = String(email || "").trim();
  const cleanedPassword = String(password || "").trim();

  if (!cleanedName || !cleanedEmail || !cleanedPassword) {
    throw new Error("Name, email and password are required");
  }
  console.log("Registering user with:", { name: cleanedName, email: cleanedEmail, password: cleanedPassword });
  const payload = await api.post("/auth/register", {
    name: cleanedName,
    email: cleanedEmail,
    password: cleanedPassword,
  });

  return payload;
}
export function getRoleFromToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const role = localStorage.getItem("role");

  return role ? String(role).toLowerCase() : null;
}