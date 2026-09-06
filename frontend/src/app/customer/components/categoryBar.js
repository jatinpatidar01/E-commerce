'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import vendorService from '@/services/vendor.service';

export default function CategoryBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get('category_id');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const data = await vendorService.getCategories();
        const catList = Array.isArray(data) ? data : data?.categories || [];
        setCategories(catList);
      } catch (err) {
        console.error('Failed to load categories in CategoryBar:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  const handleCategorySelect = (category) => {
    if (!category) {
      router.push('/customer');
    } else {
      router.push(
        `/customer?category_id=${category.id}&category=${encodeURIComponent(category.name)}`,
      );
    }
  };

  return (
    <div className="px-6 py-3 border-b border-gray-100 bg-white overflow-x-auto flex items-center gap-2 scrollbar-none">
      <button
        type="button"
        onClick={() => handleCategorySelect(null)}
        className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
          !activeCategoryId
            ? 'bg-[#5c4ce1] text-white shadow-sm'
            : 'bg-gray-100/90 text-gray-600 hover:bg-gray-200'
        }`}
      >
        All Categories
      </button>

      {categories.map((cat) => {
        const isActive = String(cat.id) === activeCategoryId;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategorySelect(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              isActive
                ? 'bg-[#5c4ce1] text-white shadow-sm'
                : 'bg-gray-100/90 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
