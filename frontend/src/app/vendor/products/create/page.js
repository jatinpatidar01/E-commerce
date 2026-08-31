"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import vendorService from "@/services/vendor.service";

export default function CreateProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    price: "",
    stock: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoryLoading(true);

        const data = await vendorService.getCategories();

        const categoryList = Array.isArray(data) ? data : (data?.categories || []);
        setCategories(categoryList);

        if (categoryList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            category_id: prev.category_id || String(categoryList[0].id),
          }));
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError("Failed to load categories from server.");
      } finally {
        setCategoryLoading(false);
      }
    }

    loadCategories();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
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

      if (!formData.price || Number(formData.price) < 0) {
        setError("Please enter a valid price.");
        return;
      }

      if (formData.stock === "" || Number(formData.stock) < 0) {
        setError("Please enter a valid stock quantity.");
        return;
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category_id: Number(formData.category_id),
        price: Number(formData.price),
        stock: Number(formData.stock),
      };

      await vendorService.createProduct(productData);

      setSuccess(
        "Product created successfully! Status is set to 'pending' awaiting Admin approval."
      );

      setTimeout(() => {
        router.push("/vendor/products");
      }, 1200);
    } catch (err) {
      console.error("Failed to create product:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create product."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl p-6 mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Add Product</h1>
          <p className="mt-1 text-gray-500">
            Create a new product for your store. It will be submitted for admin approval.
          </p>
        </div>

        <Link
          href="/vendor/products"
          className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition"
        >
          Back
        </Link>
      </div>

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
            placeholder="e.g. Nike Air Max 270"
            className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block mb-2 text-sm font-medium">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter detailed product description..."
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
            disabled={categoryLoading}
            className="w-full px-4 py-3 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-black"
            required
          >
            <option value="">
              {categoryLoading ? "Loading categories..." : "Select category"}
            </option>
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
            placeholder="e.g. 2499.00"
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
            placeholder="e.g. 50"
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
            disabled={loading}
            className="flex-1 px-5 py-3 text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {loading ? "Submitting..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}