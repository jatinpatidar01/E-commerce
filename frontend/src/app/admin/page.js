"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import adminService from "@/services/admin.service";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentPending, setRecentPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminService.getDashboard();
      setStats(res?.statistics || null);
      setRecentPending(res?.recentPendingProducts || []);
    } catch (err) {
      setError(err?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproval = async (productId, status) => {
    try {
      setActionLoading(productId);
      await adminService.updateProductApproval(productId, status);
      await loadData();
    } catch (err) {
      alert(err?.message || `Failed to ${status} product.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 mx-auto border-4 border-slate-200 rounded-full border-t-blue-600 animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500">Loading admin metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Marketplace Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time multi-vendor statistics and pending product approvals
          </p>
        </div>

        <Link
          href="/admin/products?status=pending"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm self-start sm:self-auto"
        >
          🔍 Review Pending Products
          {stats?.pendingProducts > 0 && (
            <span className="px-2 py-0.5 bg-amber-400 text-slate-900 text-xs font-black rounded-full">
              {stats.pendingProducts}
            </span>
          )}
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Products
            </span>
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">
            {stats?.totalProducts || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">In marketplace catalog</p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Pending Approvals
            </span>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-3xl font-black text-amber-900 mt-3">
            {stats?.pendingProducts || 0}
          </p>
          <p className="text-xs text-amber-700 mt-1 font-medium">Require admin review</p>
        </div>

        {/* Approved Products */}
        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Approved & Live
            </span>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-3xl font-black text-emerald-900 mt-3">
            {stats?.approvedProducts || 0}
          </p>
          <p className="text-xs text-emerald-700 mt-1 font-medium">Visible to customers</p>
        </div>

        {/* Total Vendors */}
        <div className="bg-purple-50 p-5 rounded-2xl border border-purple-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              Registered Vendors
            </span>
            <span className="text-2xl">🏪</span>
          </div>
          <p className="text-3xl font-black text-purple-900 mt-3">
            {stats?.totalVendors || 0}
          </p>
          <p className="text-xs text-purple-700 mt-1 font-medium">Active storefronts</p>
        </div>
      </div>

      {/* PENDING APPROVALS QUEUE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Pending Approvals Queue
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Products submitted by vendors waiting for your decision
            </p>
          </div>

          <Link
            href="/admin/products"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            View All Products &rarr;
          </Link>
        </div>

        {recentPending.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl">🎉</span>
            <h3 className="font-bold text-slate-800 text-sm mt-3">
              All caught up!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              There are no pending product approvals right now.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPending.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {p.name}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {p.vendor_name || `Vendor #${p.vendor_id}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-medium">
                        {p.category_name || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ₹{Number(p.price || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-xs">{p.stock} units</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleApproval(p.id, "approved")}
                        disabled={actionLoading === p.id}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 shadow-xs"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproval(p.id, "rejected")}
                        disabled={actionLoading === p.id}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 shadow-xs"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}