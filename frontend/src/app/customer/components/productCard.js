"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((current) => !current);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (adding || added) return;

    setAdding(true);

    try {
      const result = await addToCart(product.id, 1);

      if (result?.requiresLogin) {
        alert(result.message || "Please login to add items to cart.");
        return;
      }

      if (!result?.success) {
        alert(result?.message || "Failed to add item to cart.");
        return;
      }

      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 1800);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert(err?.message || "Failed to add item to cart.");
    } finally {
      setAdding(false);
    }
  };

  const priceNum = Number(product.price || 0);

  return (
    <article className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between relative group min-h-[350px] hover:shadow-md transition">
      <button
        type="button"
        onClick={handleWishlist}
        aria-label={
          wishlisted ? "Remove from wishlist" : "Add to wishlist"
        }
        className={`absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
          wishlisted
            ? "bg-red-50 text-red-600"
            : "bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50"
        }`}
      >
        {wishlisted ? "♥" : "♡"}
      </button>

      <Link
        href={`/customer/products/${product.id}`}
        className="flex-1 flex flex-col"
      >
        <div className="h-44 flex items-center justify-center my-2 overflow-hidden rounded-xl bg-gray-50/50 p-2">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="max-h-36 max-w-full object-contain group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <span className="text-3xl">📦</span>

              <span className="text-[11px] mt-1 text-gray-400 font-medium">
                {product.category_name || "Product"}
              </span>
            </div>
          )}
        </div>

        <div className="text-center space-y-2 flex-1 flex flex-col justify-between">
          <div>
            {product.category_name && (
              <span className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-full mb-1">
                {product.category_name}
              </span>
            )}

            <h4 className="text-sm font-bold text-gray-800 line-clamp-2 min-h-8 group-hover:text-indigo-600 transition">
              {product.name}
            </h4>

            {product.vendor_name && (
              <p className="text-[11px] text-gray-400">
                by {product.vendor_name}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-sm font-bold text-gray-900">
              ₹{priceNum.toLocaleString("en-IN")}
            </span>

            {product.stock !== undefined && (
              <span
                className={`text-[10px] font-medium ${
                  product.stock > 0
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={adding || product.stock <= 0}
        className={`w-full mt-3 py-2 px-3 text-xs font-bold rounded-xl transition shadow-sm cursor-pointer ${
          added
            ? "bg-emerald-600 text-white"
            : "bg-black hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        }`}
      >
        {adding ? (
          "Adding..."
        ) : added ? (
          "✓ Added to Cart!"
        ) : product.stock <= 0 ? (
          "Out of Stock"
        ) : (
          `🛍️ ₹${priceNum.toLocaleString("en-IN")} · Add to Cart`
        )}
      </button>
    </article>
  );
}