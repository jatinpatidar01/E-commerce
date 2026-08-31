"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import vendorService from "@/services/vendor.service";

export default function VendorProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const data = await vendorService.getProducts();

      const productList = data?.products || data || [];

      setProducts(
        Array.isArray(productList) ? productList : []
      );
    } catch (error) {
      console.error("Failed to load products:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadProducts();
  }, []);

  // =========================
  // STATUS CLASS
  // =========================

  function getStatusClass(status) {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

  // =========================
  // LOADING STATE
  // =========================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-4 border-gray-300 rounded-full border-t-black animate-spin"></div>

          <p className="mt-4 text-gray-500">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR STATE
  // =========================

  if (error) {
    return (
      <div className="p-6">
        <div className="p-8 text-center border border-red-200 bg-red-50 rounded-xl">
          <h2 className="text-lg font-semibold text-red-700">
            Failed to load products
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadProducts}
            className="px-5 py-2 mt-5 text-white transition bg-black rounded-lg hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="p-6">
      {/* =========================
          HEADER
      ========================= */}

      <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">
            My Products
          </h1>

          <p className="mt-1 text-gray-500">
            Manage your store products.
          </p>
        </div>

        <Link
          href="/vendor/products/create"
          className="px-5 py-3 text-center text-white transition bg-black rounded-lg hover:bg-gray-800"
        >
          + Add Product
        </Link>
      </div>

      {/* =========================
          EMPTY STATE
      ========================= */}

      {products.length === 0 ? (
        <div className="p-10 text-center bg-white border rounded-xl">
          <h2 className="text-lg font-semibold">
            No products yet
          </h2>

          <p className="mt-2 text-gray-500">
            Add your first product to start selling.
          </p>

          <Link
            href="/vendor/products/create"
            className="inline-block px-5 py-3 mt-5 text-white transition bg-black rounded-lg hover:bg-gray-800"
          >
            Add Product
          </Link>
        </div>
      ) : (
        /* =========================
           PRODUCTS TABLE
        ========================= */

        <div className="overflow-hidden bg-white border rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-sm font-semibold">
                    Product
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold">
                    Category
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold">
                    Price
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold">
                    Stock
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold">
                    Status
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold">
                    Active
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    {/* PRODUCT */}

                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name || "Unnamed Product"}
                        </p>

                        <p className="max-w-xs text-sm text-gray-500 truncate">
                          {product.description ||
                            "No description"}
                        </p>
                      </div>
                    </td>

                    {/* CATEGORY */}

                    <td className="px-5 py-4 text-sm">
                      {product.category_name ||
                        product.category?.name ||
                        product.category_id ||
                        "N/A"}
                    </td>

                    {/* PRICE */}

                    <td className="px-5 py-4 text-sm font-medium">
                      ₹
                      {Number(
                        product.price || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    {/* STOCK */}

                    <td className="px-5 py-4 text-sm">
                      {product.stock ?? 0}
                    </td>

                    {/* APPROVAL STATUS */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusClass(
                          product.approval_status
                        )}`}
                      >
                        {product.approval_status ||
                          "pending"}
                      </span>
                    </td>

                    {/* ACTIVE STATUS */}

                    <td className="px-5 py-4">
                      <span
                        className={
                          product.is_active
                            ? "text-sm font-medium text-green-600"
                            : "text-sm font-medium text-gray-500"
                        }
                      >
                        {product.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-4">
                      <Link
                        href={`/vendor/products/${product.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        View / Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}