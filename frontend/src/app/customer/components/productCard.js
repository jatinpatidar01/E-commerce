'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(product.isWishlisted);

  const handleWishlist = () => {
    setWishlisted((current) => !current);
     
  };

  const handleAddToCart = () => {
    // TODO: Call cart API here.
    // POST /cart/items
    console.log('Add to cart:', product.id);
  };

  return (
    <article className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between relative group min-h-[350px]">
      <button
        type="button"
        onClick={handleWishlist}
        aria-label={
          wishlisted ? 'Remove from wishlist' : 'Add to wishlist'
        }
        className={`absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition ${
          wishlisted
            ? 'bg-indigo-50 text-indigo-600'
            : 'bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
        }`}
      >
        {wishlisted ? '♥' : '♡'}
      </button>

      <Link href={`/customer/products/${product.id}`}>
        <div className="h-44 flex items-center justify-center my-2 overflow-hidden rounded-xl">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="max-h-36 max-w-full object-contain group-hover:scale-105 transition"
          />
        </div>

        <div className="text-center space-y-2">
          {product.badge && (
            <span className="inline-block bg-amber-300 text-gray-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              {product.badge}
            </span>
          )}

          <h4 className="text-xs font-bold text-gray-800 line-clamp-2 min-h-8">
            {product.name}
          </h4>

          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-semibold text-amber-500">
              ★ {product.rating}
            </span>

            {product.oldPrice && (
              <span className="text-[11px] text-gray-400 line-through">
                ${product.oldPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleAddToCart}
        className="w-full mt-3 py-1.5 px-3 border border-indigo-600 text-indigo-600 text-xs font-bold rounded-full hover:bg-indigo-50 transition"
      >
        🛍️ ${product.price.toFixed(2)}
      </button>
    </article>
  );
}
