"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import orderService from "@/services/order.service";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, refreshCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "cod",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrders, setPlacedOrders] = useState([]);

  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Your cart is empty. Please add items before checking out.");
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.street || !formData.city || !formData.pincode) {
      setError("Please fill in all required shipping address fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const fullAddress = `${formData.fullName}, Phone: ${formData.phone}, ${formData.street}, ${formData.city}, ${formData.state} - ${formData.pincode} (Payment: ${formData.paymentMethod.toUpperCase()})`;

      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shipping_address: fullAddress,
      };

      const result = await orderService.checkout(payload);

      setPlacedOrders(result?.orders || []);
      setOrderPlaced(true);
      await refreshCart();
    } catch (err) {
      console.error("Checkout failed:", err);
      setError(err?.message || "Failed to place order. Please make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 text-center bg-white border border-gray-100 rounded-3xl shadow-sm">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
          ✓
        </div>
        <h1 className="text-2xl font-black text-gray-900">
          Order Placed Successfully!
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Thank you for your purchase. We have received your order and notified the vendors.
        </p>

        <div className="my-6 p-4 bg-gray-50 rounded-2xl text-left border text-xs space-y-2">
          <p className="font-bold text-gray-700">Order Summary:</p>
          <p className="text-gray-600">Total Items: {placedOrders.length || items.length}</p>
          <p className="text-gray-600 font-bold">Total Amount Paid: ₹{totalAmount.toLocaleString("en-IN")}</p>
          <p className="text-gray-600">Payment: {formData.paymentMethod.toUpperCase()}</p>
          <p className="text-gray-600">Delivery Address: {formData.street}, {formData.city}</p>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/customer/orders"
            className="px-6 py-3 bg-[#5c4ce1] hover:bg-[#4a3bc7] text-white text-sm font-bold rounded-full transition shadow-md"
          >
            View Order History &rarr;
          </Link>
          <Link
            href="/customer"
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold rounded-full transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 my-6">
      <Link
        href="/customer/cart"
        className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 mb-6 transition"
      >
        &larr; Back to Shopping Cart
      </Link>

      <h1 className="text-2xl font-black text-gray-900 mb-6">
        Secure Checkout
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* SHIPPING & PAYMENT FORM */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. SHIPPING ADDRESS */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>📍</span> 1. Shipping Address
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5c4ce1] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5c4ce1] outline-none"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Street / House / Apartment *</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5c4ce1] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5c4ce1] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Karnataka"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5c4ce1] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="560001"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5c4ce1] outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. PAYMENT METHOD */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>💳</span> 2. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition ${
                  formData.paymentMethod === "cod"
                    ? "border-[#5c4ce1] bg-indigo-50/40"
                    : "border-gray-100 hover:border-gray-200 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === "cod"}
                  onChange={handleChange}
                  className="accent-[#5c4ce1]"
                />
                <div>
                  <p className="text-xs font-bold text-gray-900">Cash on Delivery</p>
                  <p className="text-[10px] text-gray-400">Pay upon delivery</p>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition ${
                  formData.paymentMethod === "upi"
                    ? "border-[#5c4ce1] bg-indigo-50/40"
                    : "border-gray-100 hover:border-gray-200 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={formData.paymentMethod === "upi"}
                  onChange={handleChange}
                  className="accent-[#5c4ce1]"
                />
                <div>
                  <p className="text-xs font-bold text-gray-900">UPI / QR Code</p>
                  <p className="text-[10px] text-gray-400">GPay, PhonePe, Paytm</p>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition ${
                  formData.paymentMethod === "card"
                    ? "border-[#5c4ce1] bg-indigo-50/40"
                    : "border-gray-100 hover:border-gray-200 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === "card"}
                  onChange={handleChange}
                  className="accent-[#5c4ce1]"
                />
                <div>
                  <p className="text-xs font-bold text-gray-900">Credit / Debit Card</p>
                  <p className="text-[10px] text-gray-400">Visa, Mastercard, RuPay</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs sticky top-24 space-y-5">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-4">
            Items in Order ({items.length})
          </h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <div className="truncate pr-2">
                  <p className="font-bold text-gray-800 truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-400">Qty: {item.quantity} · by {item.vendorName || "Vendor"}</p>
                </div>
                <span className="font-bold text-gray-900 shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-base font-black text-gray-900">
              <span>Total Payable</span>
              <span className="text-xl text-[#5c4ce1]">₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="w-full py-4 bg-black hover:bg-gray-800 text-white text-center text-sm font-black rounded-2xl transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Placing Order..." : `🛍️ Confirm & Place Order (₹${totalAmount.toLocaleString("en-IN")})`}
          </button>

          <p className="text-[10px] text-gray-400 text-center">
            🔒 By placing your order, you agree to the Terms of Service & Multi-Vendor Policy.
          </p>
        </div>
      </form>
    </div>
  );
}
