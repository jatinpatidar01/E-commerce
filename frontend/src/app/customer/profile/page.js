"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import customerService from "@/services/customer.service";
import { logout } from "@/services/auth.service";

export default function CustomerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    inProgressOrders: 0,
    totalSpent: 0,
    cartItemsCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await customerService.getProfile();
      if (data?.user) {
        setProfile(data.user);
        setStats(data.stats || {});
        setRecentOrders(data.recentOrders || []);
        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      console.error("Failed to load customer profile:", err);
      setError(err?.message || "Failed to load profile. Please make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (formData.newPassword) {
      if (formData.newPassword.length < 3) {
        setError("Password must be at least 3 characters.");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };
      if (formData.newPassword) {
        payload.newPassword = formData.newPassword;
      }

      const updated = await customerService.updateProfile(payload);
      if (updated?.user) {
        setProfile(updated.user);
      }
      setSuccess("Profile updated successfully!");
      setFormData((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-24 text-center">
        <div className="w-10 h-10 mx-auto border-4 border-gray-200 rounded-full border-t-[#5c4ce1] animate-spin"></div>
        <p className="mt-4 text-sm text-gray-500 font-medium">Loading your profile...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white border border-gray-100 rounded-3xl shadow-sm">
        <span className="text-5xl">🔒</span>
        <h2 className="text-xl font-bold text-gray-900 mt-4">Login Required</h2>
        <p className="text-xs text-gray-500 mt-2">
          {error}
        </p>
        <Link
          href="/login"
          className="inline-block mt-6 px-8 py-3 bg-[#5c4ce1] text-white text-xs font-bold rounded-full shadow-md transition"
        >
          Go to Login &rarr;
        </Link>
      </div>
    );
  }

  const initial = profile?.name ? profile.name.charAt(0).toUpperCase() : "U";
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "Member";

  return (
    <div className="max-w-5xl mx-auto p-6 my-6 space-y-8">
      {/* 1. HERO PROFILE CARD */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5 z-10">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center font-black text-3xl shadow-inner">
            {initial}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{profile?.name}</h1>
              <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize">
                {profile?.role || "Customer"}
              </span>
            </div>
            <p className="text-sm text-indigo-200 mt-0.5">{profile?.email}</p>
            <p className="text-xs text-indigo-300 mt-1">
              Member since {joinedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 w-full md:w-auto">
          <Link
            href="/customer/orders"
            className="flex-1 md:flex-none text-center px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl backdrop-blur-md transition"
          >
            📦 My Orders
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 md:flex-none px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* 2. STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
          <span className="text-2xl">🛍️</span>
          <p className="text-xl font-black text-gray-900 mt-2">{stats.totalOrders}</p>
          <p className="text-xs text-gray-400 font-medium">Total Orders Placed</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
          <span className="text-2xl">🚚</span>
          <p className="text-xl font-black text-indigo-600 mt-2">{stats.inProgressOrders}</p>
          <p className="text-xs text-gray-400 font-medium">Active Deliveries</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
          <span className="text-2xl">💰</span>
          <p className="text-xl font-black text-emerald-600 mt-2">
            ₹{stats.totalSpent.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-400 font-medium">Total Lifetime Spend</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
          <span className="text-2xl">🛒</span>
          <p className="text-xl font-black text-purple-600 mt-2">{stats.cartItemsCount}</p>
          <p className="text-xs text-gray-400 font-medium">Items in Cart</p>
        </div>
      </div>

      {/* 3. MAIN GRID: SETTINGS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* EDIT PROFILE FORM */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Update your personal account details and password
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5c4ce1] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@gmail.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5c4ce1] outline-none"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-800 mb-3">Change Password (Optional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5c4ce1] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5c4ce1] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-[#5c4ce1] hover:bg-[#4a3bc7] text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving Changes..." : "Save Profile Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* RECENT ORDERS & SHORTCUTS */}
        <div className="space-y-6">
          {/* RECENT ORDERS */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-bold text-gray-900">Recent Orders</h2>
              <Link href="/customer/orders" className="text-xs text-[#5c4ce1] font-bold hover:underline">
                View All &rarr;
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">No recent orders placed.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((ord) => (
                  <div key={ord.id} className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between gap-3 text-xs">
                    <div className="truncate">
                      <p className="font-bold text-gray-800 truncate">{ord.product_name}</p>
                      <p className="text-[10px] text-gray-400 capitalize">Status: {ord.status}</p>
                    </div>
                    <span className="font-black text-gray-900 shrink-0">
                      ₹{Number(ord.total_amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QUICK LINKS */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-gray-900 border-b pb-3">Quick Navigation</h2>
            <Link
              href="/customer"
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-xs font-bold text-gray-700 transition"
            >
              <span>🛍️ Storefront Catalog</span>
              <span>&rarr;</span>
            </Link>
            <Link
              href="/customer/cart"
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-xs font-bold text-gray-700 transition"
            >
              <span>🛒 View Shopping Cart</span>
              <span>&rarr;</span>
            </Link>
            <Link
              href="/customer/orders"
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-xs font-bold text-gray-700 transition"
            >
              <span>📦 Order History & Tracking</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
