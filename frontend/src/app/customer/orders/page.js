"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import orderService from "@/services/order.service";

const STATUS_BADGES = {
  pending: { label: "Pending Confirmation", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "Confirmed", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  shipped: { label: "Shipped", bg: "bg-purple-50 text-purple-700 border-purple-200" },
  delivered: { label: "Delivered", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", bg: "bg-red-50 text-red-700 border-red-200" },
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setError("");
        const data = await orderService.getCustomerOrders();
        setOrders(Array.isArray(data) ? data : (data?.orders || []));
      } catch (err) {
        console.error("Failed to load orders:", err);
        setError(err?.message || "Failed to load order history.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-24 text-center">
        <div className="w-10 h-10 mx-auto border-4 border-gray-200 rounded-full border-t-[#5c4ce1] animate-spin"></div>
        <p className="mt-4 text-sm text-gray-500 font-medium">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 my-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            My Order History
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track and manage your past purchases
          </p>
        </div>

        <Link
          href="/customer"
          className="px-4 py-2 bg-[#5c4ce1] hover:bg-[#4a3bc7] text-white text-xs font-bold rounded-full transition shadow-xs"
        >
          &larr; Continue Shopping
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="py-20 text-center bg-white border border-gray-100 rounded-3xl p-10 shadow-xs max-w-lg mx-auto">
          <span className="text-5xl">📦</span>
          <h2 className="text-lg font-bold text-gray-900 mt-3">
            No Orders Yet
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            You haven't placed any orders yet. Discover items from our marketplace!
          </p>
          <Link
            href="/customer"
            className="inline-block mt-6 px-6 py-2.5 bg-[#5c4ce1] text-white text-xs font-bold rounded-full shadow-md transition"
          >
            Start Shopping &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = STATUS_BADGES[order.status] || {
              label: order.status,
              bg: "bg-gray-50 text-gray-700 border-gray-200",
            };
            const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={order.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-sm transition"
              >
                {/* Left: Product & Vendor Snapshot */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    📦
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-gray-400">
                        Order #{order.id}
                      </span>
                      <span className="text-[10px] text-gray-300">•</span>
                      <span className="text-[11px] text-gray-400">
                        {orderDate}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {order.product_name || "Product"}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>Qty: <strong className="text-gray-800">{order.quantity}</strong></span>
                      <span>Unit Price: <strong className="text-gray-800">₹{Number(order.unit_price || 0).toLocaleString("en-IN")}</strong></span>
                      {order.vendor_name && (
                        <span>Sold by: <strong className="text-gray-800">{order.vendor_name}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Total Amount & Status Badge */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total Paid</p>
                    <p className="text-base font-black text-gray-900">
                      ₹{Number(order.total_amount || 0).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <span
                    className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${statusConfig.bg}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}