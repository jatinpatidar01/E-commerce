export const AUTH_STORAGE_KEYS = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  role: "role",
  user: "user",
};

export function getStoredAuth() {
  if (typeof window === "undefined") {
    return {
      accessToken: null,
      refreshToken: null,
      role: null,
      user: null,
    };
  }

  return {
    accessToken: localStorage.getItem(AUTH_STORAGE_KEYS.accessToken) || readCookie(AUTH_STORAGE_KEYS.accessToken),
    refreshToken: localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken) || readCookie(AUTH_STORAGE_KEYS.refreshToken),
    role: localStorage.getItem(AUTH_STORAGE_KEYS.role) || readCookie(AUTH_STORAGE_KEYS.role),
    user: safeParseJSON(localStorage.getItem(AUTH_STORAGE_KEYS.user)) || safeParseJSON(readCookie(AUTH_STORAGE_KEYS.user)),
  };
}

export function persistAuth(data = {}) {
  if (typeof window === "undefined") return null;

  const accessToken =
    data.accessToken ||
    data.access_token ||
    data.token?.accessToken ||
    data.token?.access_token ||
    null;

  const refreshToken =
    data.refreshToken ||
    data.refresh_token ||
    data.token?.refreshToken ||
    data.token?.refresh_token ||
    null;

  const role = normalizeRole(
    data.role || data.user?.role || data.userRole || getStoredAuth().role
  );

  const user = data.user || data.profile || data.data?.user || null;

  if (accessToken) {
    localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, accessToken);
    writeCookie(AUTH_STORAGE_KEYS.accessToken, accessToken, 7);
  }

  if (refreshToken) {
    localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, refreshToken);
    writeCookie(AUTH_STORAGE_KEYS.refreshToken, refreshToken, 30);
  }

  if (role) {
    localStorage.setItem(AUTH_STORAGE_KEYS.role, role);
    writeCookie(AUTH_STORAGE_KEYS.role, role, 7);
  }

  if (user) {
    const serializedUser = JSON.stringify(user);
    localStorage.setItem(AUTH_STORAGE_KEYS.user, serializedUser);
    writeCookie(AUTH_STORAGE_KEYS.user, serializedUser, 7);
  }

  return getStoredAuth();
}

export function clearStoredAuth() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.role);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);

  document.cookie = `${AUTH_STORAGE_KEYS.accessToken}=; Max-Age=0; path=/`;
  document.cookie = `${AUTH_STORAGE_KEYS.refreshToken}=; Max-Age=0; path=/`;
  document.cookie = `${AUTH_STORAGE_KEYS.role}=; Max-Age=0; path=/`;
  document.cookie = `${AUTH_STORAGE_KEYS.user}=; Max-Age=0; path=/`;
}

export function getStoredRole() {
  const role = getStoredAuth().role;
  return role ? normalizeRole(role) : null;
}

export function isAuthenticated() {
  return Boolean(getStoredAuth().accessToken);
}

function normalizeRole(value) {
  if (!value) return null;
  return String(value).trim().toLowerCase();
}

function safeParseJSON(value) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function writeCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
