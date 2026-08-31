"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart, loading } = useCart();

  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;
  const totalItems = cart?.totalItems || 0;

  return (
    <div className="max-w-6xl mx-auto p-6 my-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Shopping Cart
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalItems > 0
              ? `You have ${totalItems} item${totalItems > 1 ? "s" : ""} in your bag`
              : "Your shopping bag is empty"}
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3.5 py-1.5 rounded-full transition cursor-pointer"
          >
            🗑️ Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        /* EMPTY CART STATE */
        <div className="py-20 text-center bg-white border border-gray-100 rounded-3xl p-10 shadow-xs max-w-xl mx-auto">
          <span className="text-6xl">🛍️</span>
          <h2 className="text-xl font-bold text-gray-900 mt-4">
            Your Cart is Empty
          </h2>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Looks like you haven't added any products to your cart yet. Discover items from approved vendors!
          </p>
          <Link
            href="/customer"
            className="inline-block mt-6 px-8 py-3.5 bg-[#5c4ce1] hover:bg-[#4a3bc7] text-white text-sm font-bold rounded-full shadow-md transition transform active:scale-95"
          >
            Browse Products &rarr;
          </Link>
        </div>
      ) : (
        /* CART GRID */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ITEMS LIST */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Product Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    📦
                  </div>

                  <div className="min-w-0">
                    {item.categoryName && (
                      <span className="text-[10px] font-bold text-[#5c4ce1] uppercase tracking-wider">
                        {item.categoryName}
                      </span>
                    )}

                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {item.name}
                    </h3>

                    {item.vendorName && (
                      <p className="text-xs text-gray-400">
                        by {item.vendorName}
                      </p>
                    )}

                    <p className="text-sm font-black text-gray-900 mt-1">
                      ₹{Number(item.price || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="flex items-center border rounded-xl overflow-hidden bg-gray-50">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1.5 hover:bg-gray-200 text-sm font-bold text-gray-700 transition cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-xs font-bold text-gray-900 bg-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1.5 hover:bg-gray-200 text-sm font-bold text-gray-700 transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <p className="text-sm font-black text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-red-500 hover:text-red-700 mt-1 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <Link
              href="/customer"
              className="inline-flex items-center text-xs font-bold text-[#5c4ce1] hover:underline pt-2"
            >
              &larr; Continue Shopping
            </Link>
          </div>

          {/* ORDER SUMMARY */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs sticky top-24 space-y-5">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal ({totalItems})</span>
                <span className="font-semibold text-gray-900">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Standard Delivery</span>
                <span className="font-semibold text-emerald-600">
                  FREE
                </span>
              </div>

              <div className="border-t pt-3 flex justify-between text-base font-black text-gray-900">
                <span>Total Amount</span>
                <span className="text-xl text-[#5c4ce1]">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <Link
              href="/customer/checkout"
              className="block w-full py-3.5 bg-black hover:bg-gray-800 text-white text-center text-sm font-bold rounded-2xl transition shadow-md transform active:scale-98"
            >
              Proceed to Checkout &rarr;
            </Link>

            <p className="text-[11px] text-gray-400 text-center">
              🔒 Safe & Secure Checkout with historical order protection
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
