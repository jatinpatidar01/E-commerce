'use client';

import { useState } from 'react';

const CATEGORIES = [
  'All Categories',
  'Deals',
  'Crypto',
  'Fashion',
  'Health & Wellness',
  'Art',
  'Home',
  'Sport',
  'Music',
  'Gaming',
];

export default function categoryBar() {
  const [activeCategory, setActiveCategory] = useState('Sport');

  return (
    <div className="px-6 py-3 border-b border-gray-100 bg-white overflow-x-auto flex items-center gap-2">
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category;

        return (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              isActive
                ? 'bg-[#5c4ce1] text-white shadow-sm'
                : 'bg-gray-100/90 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
