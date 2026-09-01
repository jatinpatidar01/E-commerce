"use client";

import { useEffect, useState } from "react";
import adminService from "@/services/admin.service";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function loadVendors() {
      try {
        const data = await adminService.getVendors();
        setVendors(Array.isArray(data) ? data : data?.vendors || []);
      } catch (err) {
        setError(err?.message || "Failed to load vendors.");
      } finally {
        setLoading(false);
      }
    }

    loadVendors();
  }, []);

  async function handleDelete(vendor) {
    if (!window.confirm(`Delete ${vendor.business_name || vendor.name}'s vendor account? Products will no longer be associated with this vendor.`)) return;

    try {
      setDeletingId(vendor.user_id);
      setError("");
      await adminService.deleteVendor(vendor.user_id);
      setVendors((current) => current.filter(({ user_id }) => user_id !== vendor.user_id));
    } catch (err) {
      setError(err?.message || "Failed to delete vendor.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vendors</h1>
        <p className="mt-1 text-sm text-slate-500">View and manage vendor accounts and their catalogues.</p>
      </div>
      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <p className="p-6 text-sm text-slate-500">Loading vendors...</p> : vendors.length === 0 ? <p className="p-6 text-sm text-slate-500">No vendor accounts found.</p> : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Vendor</th><th className="px-5 py-3">Products</th><th className="px-5 py-3">Approved</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3 text-right">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {vendors.map((vendor) => <tr key={vendor.user_id}>
                <td className="px-5 py-4"><p className="font-semibold text-slate-900">{vendor.business_name}</p><p className="text-xs text-slate-500">{vendor.name} · {vendor.email}</p></td>
                <td className="px-5 py-4">{vendor.products_count}</td>
                <td className="px-5 py-4">{vendor.approved_products}</td>
                <td className="px-5 py-4">{new Date(vendor.created_at).toLocaleDateString("en-IN")}</td>
                <td className="px-5 py-4 text-right"><button type="button" onClick={() => handleDelete(vendor)} disabled={deletingId === vendor.user_id} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50">{deletingId === vendor.user_id ? "Deleting..." : "Delete"}</button></td>
              </tr>)}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
