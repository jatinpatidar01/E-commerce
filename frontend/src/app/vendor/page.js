"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import vendorService from "@/services/vendor.service";

export default function VendorDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    approvedProducts: 0,
    pendingProducts: 0,
    rejectedProducts: 0,
  });
  const [vendor, setVendor] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError("");

        const [dashboardRes, productsRes] = await Promise.all([
          vendorService.getDashboard(),
          vendorService.getProducts(),
        ]);
        
        if (dashboardRes?.statistics) {
          setStats(dashboardRes.statistics);
        }
        if (dashboardRes?.vendor) {
          setVendor(dashboardRes.vendor);
        }

        const prods = Array.isArray(productsRes) ? productsRes : (productsRes?.products || []);
        setRecentProducts(prods.slice(0, 5));
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError(err?.message || "Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {vendor?.business_name ? `${vendor.business_name} Dashboard` : "Vendor Dashboard"}
          </h1>
          <p className="mt-1 text-gray-500">
            Manage your store catalog, check approval states, and track inventory.
          </p>
        </div>

        <Link
          href="/vendor/products/create"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition shadow-sm"
        >
          + Add New Product
        </Link>
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-gray-300 rounded-full border-t-black animate-spin"></div>
        </div>
      ) : (
        <>
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-5 bg-white border rounded-xl shadow-sm">
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.totalProducts ?? 0}
              </p>
            </div>

            <div className="p-5 bg-white border border-green-200 rounded-xl shadow-sm bg-green-50/20">
              <p className="text-sm font-medium text-green-700">Approved & Live</p>
              <p className="mt-2 text-3xl font-bold text-green-700">
                {stats.approvedProducts ?? 0}
              </p>
            </div>

            <div className="p-5 bg-white border border-yellow-200 rounded-xl shadow-sm bg-yellow-50/20">
              <p className="text-sm font-medium text-yellow-700">Pending Review</p>
              <p className="mt-2 text-3xl font-bold text-yellow-700">
                { stats.pendingProducts ?? 0}
              </p>
            </div>

            <div className="p-5 bg-white border border-red-200 rounded-xl shadow-sm bg-red-50/20">
              <p className="text-sm font-medium text-red-700">Rejected</p>
              <p className="mt-2 text-3xl font-bold text-red-700">
                {stats.rejectedProducts ?? 0}
              </p>
            </div>
          </div>

          {/* RECENT PRODUCTS */}
          <div className="p-6 bg-white border rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Products</h2>
              <Link
                href="/vendor/products"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                View all &rarr;
              </Link>
            </div>

            {recentProducts.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No products added yet.{" "}
                <Link
                  href="/vendor/products/create"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Create your first product
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Approval</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {recentProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {product.category_name || "—"}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          ₹{Number(product.price || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {product.stock}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${
                              product.approval_status === "approved"
                                ? "bg-green-100 text-green-700"
                                : product.approval_status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {product.approval_status || "pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/vendor/products/${product.id}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}