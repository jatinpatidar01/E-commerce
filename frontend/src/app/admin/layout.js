"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, logout } from "@/services/auth.service";

export default function AdminLayout({ children }) {
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
    { href: "/admin", label: "📊 Dashboard" },
    { href: "/admin/products", label: "✅ Product Approvals" },
    { href: "/admin/vendors", label: "🏪 Vendors" },
    { href: "/admin/customers", label: "👥 Customers" },
    { href: "/admin/orders", label: "📑 Orders" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-4 border-slate-300 rounded-full border-t-amber-500 animate-spin"></div>
          <p className="mt-3 text-xs text-slate-500 font-medium">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  // Access Denied guard for non-admins
  if (user && user.role !== "superadmin" && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto text-3xl font-black">
            🛡️
          </div>
          <h2 className="text-xl font-black text-slate-900">Administrator Access Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            You are currently signed in as <strong>{user.name} ({user.email})</strong> with role <strong>{user.role}</strong>. You do not have permissions to access the Admin Control Center.
          </p>
          <div className="pt-2 space-y-2">
            <Link
              href="/customer"
              className="block w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              🛍️ Return to Customer Store
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden w-64 bg-slate-900 text-white md:flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-slate-800">
            <Link href="/admin" className="text-xl font-black text-white flex items-center gap-2">
              <span className="text-amber-400">🛡️</span> Admin Panel
            </Link>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Superadmin Control Center
            </p>
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
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/customer"
            className="block text-center text-xs font-semibold text-slate-300 hover:text-white py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            🛍️ Open Customer Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b sticky top-0 z-20 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Marketplace Administration
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                </span>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-semibold text-slate-900">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-amber-600 font-bold uppercase">
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