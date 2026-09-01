"use client";

import { useEffect, useState } from "react";
import adminService from "@/services/admin.service";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await adminService.getCustomers();
        setCustomers(Array.isArray(data) ? data : data?.customers || []);
      } catch (err) {
        setError(err?.message || "Failed to load customers.");
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  async function handleDelete(customer) {
    if (!window.confirm(`Delete ${customer.name}'s account? This cannot be undone.`)) return;

    try {
      setDeletingId(customer.id);
      setError("");
      await adminService.deleteCustomer(customer.id);
      setCustomers((current) => current.filter(({ id }) => id !== customer.id));
    } catch (err) {
      setError(err?.message || "Failed to delete customer.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <p className="mt-1 text-sm text-slate-500">View and manage customer accounts.</p>
      </div>
      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <p className="p-6 text-sm text-slate-500">Loading customers...</p> : customers.length === 0 ? <p className="p-6 text-sm text-slate-500">No customer accounts found.</p> : (
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Orders</th><th className="px-5 py-3">Total Spent</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3 text-right">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((customer) => <tr key={customer.id}>
                <td className="px-5 py-4"><p className="font-semibold text-slate-900">{customer.name}</p><p className="text-xs text-slate-500">{customer.email}</p></td>
                <td className="px-5 py-4">{customer.orders_count}</td>
                <td className="px-5 py-4">₹{Number(customer.total_spent || 0).toLocaleString("en-IN")}</td>
                <td className="px-5 py-4">{new Date(customer.created_at).toLocaleDateString("en-IN")}</td>
                <td className="px-5 py-4 text-right"><button type="button" onClick={() => handleDelete(customer)} disabled={deletingId === customer.id} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50">{deletingId === customer.id ? "Deleting..." : "Delete"}</button></td>
              </tr>)}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
