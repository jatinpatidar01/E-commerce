"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import productService from "@/services/product.service";
import { useCart } from "@/context/CartContext";

export default function CustomerProductDetailPage() {
  const params = useParams();
  const productId = params?.id;
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const data = await productService.getProduct(productId);
        const prod = data?.product || data;
        setProduct(prod);
      } catch (err) {
        console.error("Failed to load product detail:", err);
        setError(err?.message || "Product not found or unavailable.");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product || adding) return;

    setAdding(true);
    try {
      await addToCart(product.id, quantity, product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 mx-auto border-4 border-gray-200 rounded-full border-t-[#5c4ce1] animate-spin"></div>
        <p className="mt-4 text-sm text-gray-500">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 text-center bg-white border rounded-2xl">
        <h2 className="text-xl font-bold text-gray-900">Product Unavailable</h2>
        <p className="mt-2 text-sm text-gray-500">
          {error || "The requested product is not available."}
        </p>
        <Link
          href="/customer"
          className="inline-block mt-6 px-6 py-2.5 bg-[#5c4ce1] text-white text-sm font-semibold rounded-full"
        >
          &larr; Back to Shop
        </Link>
      </div>
    );
  }

  const priceNum = Number(product.price || 0);

  return (
    <div className="max-w-5xl mx-auto p-6 my-6">
      <Link
        href="/customer"
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition"
      >
        &larr; Back to All Products
      </Link>

      <div className="bg-white border rounded-2xl p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* IMAGE */}
        <div className="flex items-center justify-center bg-gray-50 rounded-2xl p-6 min-h-[320px]">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="max-h-80 max-w-full object-contain"
            />
          ) : (
            <div className="text-center">
              <span className="text-6xl">📦</span>
              <p className="text-xs text-gray-400 mt-2 font-medium">
                {product.category_name || "Product Item"}
              </p>
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="flex flex-col justify-between">
          <div>
            {product.category_name && (
              <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                {product.category_name}
              </span>
            )}

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            {product.vendor_name && (
              <p className="text-xs text-gray-500 mb-4">
                Sold by <span className="font-semibold text-gray-800">{product.vendor_name}</span>
              </p>
            )}

            <div className="my-4">
              <span className="text-3xl font-extrabold text-gray-900">
                ₹{priceNum.toLocaleString("en-IN")}
              </span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {product.description || "No description provided for this product."}
            </p>

            <div className="flex items-center gap-2 mb-6">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  product.stock > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
              <span className="text-sm font-medium text-gray-700">
                {product.stock > 0
                  ? `In Stock (${product.stock} units available)`
                  : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="pt-6 border-t space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-sm font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-sm font-bold cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding || product.stock <= 0}
                className={`flex-1 py-3 px-6 text-sm font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer ${
                  added
                    ? "bg-emerald-600 text-white"
                    : "bg-black hover:bg-gray-800 text-white"
                }`}
              >
                {adding
                  ? "Adding to Cart..."
                  : added
                  ? "✓ Added to Cart!"
                  : `🛍️ Add ${quantity > 1 ? `${quantity} items` : ""} to Cart`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
