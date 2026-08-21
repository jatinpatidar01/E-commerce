export default function ProductCard({
  product,
  onAddToCart,
  onWishlistToggle,
}) {
  const {
    image,
    category,
    name,
    rating,
    reviews,
    price,
    originalPrice,
    discount,
    inStock,
    wishlist,
  } = product;

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  const formattedOriginalPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(originalPrice);

  return (
    <div className="group w-full max-w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      
      {/* Product Image */}
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
        />

        {/* Wishlist */}
        <button
          type="button"
          onClick={() => onWishlistToggle?.(product)}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border text-lg shadow-sm transition ${
            wishlist
              ? "border-red-200 bg-red-50 text-red-500"
              : "border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:text-red-500"
          }`}
          aria-label="Wishlist"
        >
          {wishlist ? "♥" : "♡"}
        </button>
      </div>

      {/* Product Details */}
      <div className="space-y-3 p-4">

        {/* Category */}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {category}
        </p>

        {/* Product Name */}
        <h3 className="text-xl font-bold text-slate-900">
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="text-amber-400">★</span>

          <span className="font-semibold text-slate-900">
            {rating}
          </span>

          <span>
            ({reviews} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-2xl font-bold text-slate-900">
            {formattedPrice}
          </span>

          {originalPrice && (
            <span className="text-base text-slate-400 line-through">
              {formattedOriginalPrice}
            </span>
          )}

          {discount > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-600">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Stock + Cart */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-sm font-medium ${
              inStock
                ? "text-emerald-600"
                : "text-rose-500"
            }`}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </span>

          <button
            type="button"
            disabled={!inStock}
            onClick={() => onAddToCart?.(product)}
            className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition ${
              inStock
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "cursor-not-allowed bg-slate-400"
            }`}
          >
            {inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}