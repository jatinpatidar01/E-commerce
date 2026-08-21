"use client";

import { useEffect, useState } from "react";
import orderService from "@/services/order.service";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await orderService.getOrders(page);

        setOrders(data.orders);
        setPagination(data.pagination);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page]);

  if (loading) {
    return (
      <section className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          My Orders
        </h1>

        <p className="mt-4 text-gray-500">
          Loading orders...
        </p>
      </section>
    );
  }

  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">
        My Orders
      </h1>

      <p className="mt-2 text-gray-500">
        Customer orders will be loaded from the backend.
      </p>

      {error && (
        <p className="mt-4 text-red-500">
          {error}
        </p>
      )}

      {/* Orders */}
      <div className="mt-6 grid gap-4">
        {orders.length === 0 ? (
          <p className="text-gray-500">
            No orders found.
          </p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <h2 className="font-semibold">
                Order #{order.id}
              </h2>

              <p className="mt-2 text-gray-600">
                Status: {order.status}
              </p>

              <p className="text-gray-600">
                Total: ₹{order.total_amount}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((prev) => prev - 1)}
            disabled={page === 1}
            className="rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page === pagination.totalPages}
            className="rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}