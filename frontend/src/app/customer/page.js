"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./components/productCard";
import productService from "@/services/product.service";

export default function CustomerHomePage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [search, setSearch] = useState("");

  // Load Initial Products (Page 1) when Category or Filters Change
  const loadInitialProducts = useCallback(async () => {
    try {
      setInitialLoading(true);
      setError("");
      setPage(1);

      const params = {
        page: 1,
        limit: 9,
        category: categoryParam || undefined,
        search: search || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
      };

      const res = await productService.getPublicProducts(params);

      const fetchedProducts = res?.products || [];
      setProducts(fetchedProducts);
      setPagination(
        res?.pagination || {
          page: 1,
          limit: 9,
          total: fetchedProducts.length,
          totalPages: 1,
          hasMore: false,
        }
      );
    } catch (err) {
      console.error("Failed to load products:", err);
      setError(err?.message || "Failed to load products. Please try again.");
    } finally {
      setInitialLoading(false);
    }
  }, [categoryParam, search, minPrice, maxPrice]);

  useEffect(() => {
    loadInitialProducts();
  }, [loadInitialProducts]);

  // Load More Products ("See More")
  const handleSeeMore = async () => {
    if (loadingMore || !pagination.hasMore) return;

    const nextPage = page + 1;

    try {
      setLoadingMore(true);

      const params = {
        page: nextPage,
        limit: 9,
        category: categoryParam || undefined,
        search: search || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
      };

      const res = await productService.getPublicProducts(params);

      const newProducts = res?.products || [];

      // Append new 9 products to existing list
      setProducts((prev) => [...prev, ...newProducts]);
      setPage(nextPage);
      setPagination(
        res?.pagination || {
          ...pagination,
          page: nextPage,
          hasMore: false,
        }
      );
    } catch (err) {
      console.error("Failed to load more products:", err);
      setError(err?.message || "Failed to load more products.");
    } finally {
      setLoadingMore(false);
    }
  };

  const currentCategoryTitle =
    categoryParam && categoryParam !== "All Categories"
      ? categoryParam
      : "All Products";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentCategoryTitle}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {pagination.total > 0
              ? `Showing ${products.length} of ${pagination.total} approved items`
              : "Discover quality items from approved vendors"}
          </p>
        </div>

        {/* SEARCH INPUT */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 text-sm border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#5c4ce1] w-64 shadow-sm"
          />
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      )}

      {/* INITIAL LOADING STATE */}
      {initialLoading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 mx-auto border-4 border-gray-200 rounded-full border-t-[#5c4ce1] animate-spin"></div>
          <p className="mt-4 text-sm text-gray-500">Loading catalog...</p>
        </div>
      ) : products.length === 0 ? (
        /* EMPTY STATE */
        <div className="py-16 text-center bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <div className="text-4xl mb-3">🛍️</div>
          <h2 className="text-lg font-bold text-gray-900">No products found</h2>
          <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
            {categoryParam
              ? `There are currently no approved products in the "${categoryParam}" category.`
              : "There are currently no approved products available."}
          </p>
        </div>
      ) : (
        /* PRODUCT GRID */
        <div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* "SEE MORE PRODUCTS" BUTTON / PAGINATION */}
          <div className="mt-12 text-center pb-8">
            {pagination.hasMore ? (
              <button
                type="button"
                onClick={handleSeeMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#5c4ce1] hover:bg-[#4a3bc7] text-white font-semibold text-sm rounded-full shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Loading More Products...
                  </>
                ) : (
                  <>
                    See More Products ({products.length} of {pagination.total}) &darr;
                  </>
                )}
              </button>
            ) : (
              products.length > 0 && (
                <p className="text-xs font-medium text-gray-400">
                  🎉 You have viewed all {products.length} products.
                </p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}