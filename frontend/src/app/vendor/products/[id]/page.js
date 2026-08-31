"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import vendorService from "@/services/vendor.service";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;

  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    price: "",
    stock: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [categoriesData, productData] = await Promise.all([
          vendorService.getCategories(),
          vendorService.getProduct(productId),
        ]);

        const categoryList = Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData?.categories || [];
        setCategories(categoryList);

        const prod = productData?.product || productData;
        if (prod) {
          setProduct(prod);
          setFormData({
            name: prod.name || "",
            description: prod.description || "",
            category_id: prod.category_id ? String(prod.category_id) : "",
            price: prod.price !== undefined ? String(prod.price) : "",
            stock: prod.stock !== undefined ? String(prod.stock) : "",
            is_active: prod.is_active ?? true,
          });
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load product details."
        );
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadData();
    }
  }, [productId]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!formData.name.trim()) {
        setError("Product name is required.");
        return;
      }

      if (!formData.category_id) {
        setError("Please select a category.");
        return;
      }

      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category_id: Number(formData.category_id),
        price: Number(formData.price),
        stock: Number(formData.stock),
      };

      await vendorService.updateProduct(productId, updateData);

      setSuccess("Product updated successfully!");
      setTimeout(() => {
        router.push("/vendor/products");
      }, 1000);
    } catch (err) {
      console.error("Failed to update product:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      setDeleting(true);
      setError("");
      await vendorService.deleteProduct(productId);
      router.push("/vendor/products");
    } catch (err) {
      console.error("Failed to delete product:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete product."
      );
    } finally {
      setDeleting(false);
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
            Approved (Live on Platform)
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
            Rejected (Hidden)
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
            Pending Admin Approval
          </span>
        );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-4 border-gray-300 rounded-full border-t-black animate-spin"></div>
          <p className="mt-4 text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl p-6 mx-auto">
      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="mt-1 text-gray-500">
            Product ID: #{productId}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
          >
            {deleting ? "Deleting..." : "Delete Product"}
          </button>
          <Link
            href="/vendor/products"
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition"
          >
            Back to Products
          </Link>
        </div>
      </div>

      {/* APPROVAL STATUS CARD */}
      {product && (
        <div className="p-5 mb-6 bg-white border rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Product Status
            </p>
            <div className="mt-2 flex items-center gap-3">
              {getStatusBadge(product.approval_status)}
              <span className="text-sm text-gray-500">
                {product.is_active ? "• Active" : "• Inactive"}
              </span>
            </div>
          </div>
          {product.approval_status === "pending" && (
            <p className="text-xs text-gray-500 max-w-xs text-right">
              Admin will review this product before it becomes visible in the public store.
            </p>
          )}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="p-4 mb-5 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
          {Array.isArray(error) ? error.join(", ") : error}
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="p-4 mb-5 text-sm text-green-700 border border-green-200 rounded-lg bg-green-50">
          {success}
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-6 bg-white border rounded-xl shadow-sm"
      >
        {/* NAME */}
        <div>
          <label className="block mb-2 text-sm font-medium">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Product name"
            className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block mb-2 text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Product description"
            rows={4}
            className="w-full px-4 py-3 border rounded-lg outline-none resize-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* CATEGORY */}
        <div>
          <label className="block mb-2 text-sm font-medium">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-black"
            required
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* PRICE */}
        <div>
          <label className="block mb-2 text-sm font-medium">
            Price (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        {/* STOCK */}
        <div>
          <label className="block mb-2 text-sm font-medium">
            Stock Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 pt-4 border-t">
          <Link
            href="/vendor/products"
            className="flex-1 px-5 py-3 text-center border rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-5 py-3 text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
