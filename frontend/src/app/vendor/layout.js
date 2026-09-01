"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, logout } from "@/services/auth.service";

export default function VendorLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        const u = await getCurrentUser();
        if (!u || !u.id) {
          router.push("/login");
          return;
        }
        setUser(u);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      router.push("/login");
    }
  };

  const navLinks = [
    { href: "/vendor", label: "📊 Dashboard" },
    { href: "/vendor/products", label: "📦 My Products" },
    { href: "/vendor/products/create", label: "➕ Add Product" },
    { href: "/vendor/orders", label: "📑 Orders" },
    { href: "/vendor/profile", label: "⚙️ Profile" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-4 border-gray-200 rounded-full border-t-[#5c4ce1] animate-spin"></div>
          <p className="mt-3 text-xs text-gray-500 font-medium">Loading vendor portal...</p>
        </div>
      </div>
    );
  }

  // Access Denied guard for customers
  if (user && user.role === "customer") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-3xl font-black">
            🏪
          </div>
          <h2 className="text-xl font-black text-gray-900">Vendor Account Required</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            You are currently logged in as a <strong>Customer ({user.email})</strong>. The Vendor Portal is reserved exclusively for registered vendors.
          </p>
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden w-64 bg-white border-r md:flex flex-col justify-between">
        <div>
          <div className="p-6 border-b">
            <Link href="/vendor" className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-[#5c4ce1]">🏪</span> Vendor Portal
            </Link>
          </div>

          <nav className="p-4 space-y-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-[#5c4ce1] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b sticky top-0 z-20 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Vendor Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#5c4ce1]/10 text-[#5c4ce1] flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : "V"}
                </span>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-semibold text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-gray-400 capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
