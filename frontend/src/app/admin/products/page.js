"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import adminService from "@/services/admin.service";

export default function AdminProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState(initialStatus);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminService.getProducts({
        status: activeTab,
        search,
      });
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleTabChange = (status) => {
    setActiveTab(status);
    router.push(`/admin/products${status !== "all" ? `?status=${status}` : ""}`);
  };

  const handleApproval = async (productId, status) => {
    try {
      setActionLoading(`approval-${productId}`);
      await adminService.updateProductApproval(productId, status);
      await loadProducts();
    } catch (err) {
      alert(err?.message || `Failed to update approval status.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (productId, currentActive) => {
    try {
      setActionLoading(`toggle-${productId}`);
      await adminService.toggleProductStatus(productId, !currentActive);
      await loadProducts();
    } catch (err) {
      alert(err?.message || "Failed to update product active state.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;

    try {
      setActionLoading(`delete-${productId}`);
      await adminService.deleteProduct(productId);
      await loadProducts();
    } catch (err) {
      alert(err?.message || "Failed to delete product.");
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { id: "all", label: "All Products" },
    { id: "pending", label: "⏳ Pending Approvals" },
    { id: "approved", label: "✅ Approved & Live" },
    { id: "rejected", label: "❌ Rejected" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Product Approvals & Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review vendor submissions, approve new listings, and manage marketplace products
          </p>
        </div>

        <input
          type="text"
          placeholder="Search products or vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 text-sm border rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 shadow-xs"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTabChange(t.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Product Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 mx-auto border-4 border-slate-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="mt-4 text-sm text-slate-500">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-4xl">📦</span>
          <h3 className="font-bold text-slate-800 text-sm mt-3">
            No products found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            There are no products matching this filter.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Approval Status</th>
                  <th className="px-6 py-4">Live Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const statusColors = {
                    approved: "bg-emerald-100 text-emerald-800",
                    pending: "bg-amber-100 text-amber-800",
                    rejected: "bg-red-100 text-red-800",
                  };

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        {p.description && (
                          <p className="text-xs text-slate-400 truncate max-w-xs">
                            {p.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
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
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${
                            statusColors[p.approval_status] || "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {p.approval_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p.id, p.is_active)}
                          disabled={actionLoading === `toggle-${p.id}`}
                          className={`px-2.5 py-0.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                            p.is_active
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {p.is_active ? "● Active" : "○ Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {p.approval_status !== "approved" && (
                          <button
                            type="button"
                            onClick={() => handleApproval(p.id, "approved")}
                            disabled={actionLoading === `approval-${p.id}`}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 shadow-xs"
                          >
                            Approve
                          </button>
                        )}

                        {p.approval_status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() => handleApproval(p.id, "rejected")}
                            disabled={actionLoading === `approval-${p.id}`}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 shadow-xs"
                          >
                            Reject
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={actionLoading === `delete-${p.id}`}
                          className="px-2 py-1 text-slate-400 hover:text-red-600 text-xs transition"
                          title="Delete Product"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}