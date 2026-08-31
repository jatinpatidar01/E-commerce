"use client";

import { useEffect, useState } from "react";
import orderService from "@/services/order.service";

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadAdminOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await orderService.getAdminOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load admin orders:", err);
      setError(err?.message || "Failed to load all orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert(err?.message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === "all" || o.status === filter;
    const matchesSearch =
      !search.trim() ||
      o.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
      o.vendor_name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalGMV = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* HEADER & METRICS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Platform Orders & GMV
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Global view of all transactions across all customers and vendors
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-purple-50 border border-purple-100 px-4 py-2 rounded-2xl flex items-center gap-3">
            <span className="text-xs text-purple-600 font-medium">Platform GMV:</span>
            <span className="text-lg font-black text-purple-900">
              ₹{totalGMV.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-2xl flex items-center gap-3">
            <span className="text-xs text-blue-600 font-medium">Total Orders:</span>
            <span className="text-lg font-black text-blue-900">
              {orders.length}
            </span>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* FILTER TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {["all", ...STATUS_OPTIONS].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition cursor-pointer ${
                filter === tab
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* SEARCH */}
        <div className="w-full sm:w-64">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer / product..."
            className="w-full px-3.5 py-1.5 text-xs bg-gray-50 border rounded-full focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-2xl border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {/* ORDERS TABLE */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 mx-auto border-4 border-gray-200 rounded-full border-t-purple-600 animate-spin"></div>
          <p className="mt-3 text-xs text-gray-400">Loading marketplace orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-white border border-gray-100 rounded-3xl p-8">
          <span className="text-4xl">📦</span>
          <h3 className="text-base font-bold text-gray-800 mt-2">No Orders Found</h3>
          <p className="text-xs text-gray-400 mt-1">
            No marketplace orders matched the current filter.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50/75 text-[11px] font-bold uppercase text-gray-400 border-b">
                <tr>
                  <th className="px-6 py-4">Order ID & Date</th>
                  <th className="px-6 py-4">Product & Quantity</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status & Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredOrders.map((order) => {
                  const dateStr = new Date(order.created_at).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">#{order.id}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{dateStr}</p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{order.product_name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Qty: {order.quantity} × ₹{Number(order.unit_price || 0).toLocaleString("en-IN")}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-block bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                          {order.vendor_name || `Vendor #${order.vendor_id}`}
                        </span>
                      </td>

                      <td className="px-6 py-4 max-w-[200px]">
                        <p className="font-bold text-gray-800">{order.customer_name || "Customer"}</p>
                        <p className="text-[10px] text-gray-400 truncate">{order.customer_email}</p>
                      </td>

                      <td className="px-6 py-4 font-black text-gray-900">
                        ₹{Number(order.total_amount || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-bold rounded-xl px-3 py-1.5 border outline-none cursor-pointer transition ${
                            order.status === "delivered"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : order.status === "shipped"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : order.status === "confirmed"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : order.status === "cancelled"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st}>
                              {st.toUpperCase()}
                            </option>
                          ))}
                        </select>
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