"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, sendOtp } from "../../services/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    otp: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [otpNotice, setOtpNotice] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Step 3 & 4: Click "Verify" -> Frontend calls POST /auth/otp
  const handleSendOtp = async () => {
    setError("");
    setOtpNotice("");

    const email = formData.email.trim();
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    // Basic email validation
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsOtpLoading(true);

    try {
      const res = await sendOtp(email);
      setOtpSent(true);
      setOtpNotice(res?.message || "OTP has been sent to your email. Please check your inbox (and spam).");
    } catch (err) {
      console.error("Failed to send OTP:", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send OTP. Please check your email and try again."
      );
      setOtpSent(false);
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Step 12 & 13: Submit registration with OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!otpSent) {
      setError("Please click 'Verify' to receive an OTP before creating an account.");
      return;
    }

    if (!formData.otp.trim()) {
      setError("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setIsLoading(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.otp
      );

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (registerError) {
      console.error("Registration failed:", registerError);
      setError(
        registerError?.response?.data?.message ||
        registerError?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        {/* Heading */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-black">
            🛍️
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Create Account
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Register as a Customer or Vendor
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
            ✓ {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              required
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
            />
          </div>

          {/* Email + Verify Button */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@gmail.com"
                required
                disabled={otpSent}
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition disabled:bg-slate-100 disabled:text-slate-500"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpSent || isOtpLoading}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                {isOtpLoading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                    Sending...
                  </span>
                ) : otpSent ? (
                  "✓ Sent"
                ) : (
                  "Verify"
                )}
              </button>
            </div>

            {otpNotice && (
              <p className="text-xs text-emerald-600 font-medium mt-1.5">
                ✉️ {otpNotice}
              </p>
            )}
          </div>

          {/* Step 9: OTP Input Field (Shows after Verify is clicked) */}
          {otpSent && (
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-1 animate-fadeIn">
              <label className="block text-xs font-bold text-blue-900">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="e.g. 123456"
                maxLength={6}
                required
                className="w-full px-4 py-2.5 text-center tracking-widest font-mono text-base font-bold border border-blue-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-200"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isOtpLoading}
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Account Type / Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition cursor-pointer"
            >
              <option value="customer">Customer (Shop & Purchase)</option>
              <option value="vendor">Vendor (Sell Products)</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
            />
          </div>

          {/* Step 10: Create Account Button */}
          <button
            type="submit"
            disabled={!otpSent || !formData.otp || isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer mt-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-blue-600 hover:underline"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}