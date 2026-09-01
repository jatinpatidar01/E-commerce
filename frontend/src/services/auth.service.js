import api from "@/lib/api";

function normalizeAuthResponse(payload) {
  const user = payload?.user || payload;

  return {
    ...payload,
    user,
    role: user?.role,
  };
}

export async function login(email, password) {
  const cleanedEmail = String(email || "").trim();
  const cleanedPassword = String(password || "");

  if (!cleanedEmail || !cleanedPassword) {
    throw new Error("Email and password are required");
  }

  const payload = await api.post("/auth/login", {
    email: cleanedEmail,
    password: cleanedPassword,
  });

  return normalizeAuthResponse(payload);
}

export async function sendOtp(email) {
  const cleanedEmail = String(email || "").trim().toLowerCase();

  if (!cleanedEmail) {
    throw new Error("Email is required");
  }

  return api.post("/auth/otp", {
    email: cleanedEmail,
  });
}

export async function register(
  name,
  email,
  password,
  role = "customer",
  otp = ""
) {
  const cleanedName = String(name || "").trim();
  const cleanedEmail = String(email || "").trim().toLowerCase();
  const cleanedPassword = String(password || "");
  const cleanedRole = String(role || "customer").trim().toLowerCase();
  const cleanedOtp = String(otp || "").trim();

  if (!cleanedName || !cleanedEmail || !cleanedPassword) {
    throw new Error("Name, email and password are required");
  }

  if (!cleanedOtp) {
    throw new Error("OTP verification code is required");
  }

  const allowedRoles = ["customer", "vendor"];

  if (!allowedRoles.includes(cleanedRole)) {
    throw new Error("Invalid role");
  }

  return api.post("/auth/register", {
    name: cleanedName,
    email: cleanedEmail,
    password: cleanedPassword,
    role: cleanedRole,
    otp: cleanedOtp,
  });
}

export async function getCurrentUser() {
  try {
    const payload = await api.get("/auth/me");
    return payload?.user || payload;
  } catch {
    return null;
  }
}

export async function logout() {
  return api.post("/auth/logout");
}
