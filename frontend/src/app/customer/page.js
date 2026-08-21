"use client";

import { useEffect, useState } from "react";
import ProductCard from "./components/productCard";
import Filters from "./components/filters";

import orderService from "@/services/order.service";

export default function CustomerHomePage() {
  const [products, setProducts] = useState([]);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    category: "Sport",

    brands: {
      Adidas: true,
      Columbia: true,
      Demix: true,
      "New Balance": true,
      Nike: true,
      Xiaomi: true,
      Asics: false,
    },

    minPrice: 20,
    maxPrice: 1130,

    minRating: 0,

    deliveryType: "standard",
  });

  useEffect(() => {
    console.log(`Fetching products for page ${page} with limit 9`);
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await orderService.getOrders(page);
      console.log("Fetched products:", data.products);
        setProducts(data.products || []);
        setPagination(
          data.pagination || {
            page,
            limit: 9,
            total: 0,
            totalPages: 0,
          }
        );
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  const handleFilterChange = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-4">

        {/* Filters */}
        <Filters
          filters={filters}
          onChange={handleFilterChange}
        />

        {/* Products */}
        <section className="lg:col-span-3">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Products
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Browse our latest products
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
              <p className="text-gray-500">
                Loading products...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-100 bg-white p-10 text-center">
              <h2 className="font-bold text-red-600">
                Failed to load products
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {error}
              </p>
            </div>
          )}

          {/* No products */}
          {!loading && !error && products.length === 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
              <h2 className="font-bold text-gray-900">
                No products found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                There are currently no products available.
              </p>
            </div>
          )}

          {/* Product Grid */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">

                  <button
                    onClick={() =>
                      setPage((previousPage) => previousPage - 1)
                    }
                    disabled={page === 1}
                    className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-700">
                    Page {pagination.page} of{" "}
                    {pagination.totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setPage((previousPage) => previousPage + 1)
                    }
                    disabled={
                      page === pagination.totalPages
                    }
                    className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>

                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}