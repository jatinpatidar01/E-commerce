'use client';

export default function Filters({ filters, onChange }) {
  const update = (changes) => {
    onChange({ ...filters, ...changes });
  };

  const toggleBrand = (brand) => {
    update({
      brands: {
        ...filters.brands,
        [brand]: !filters.brands[brand],
      },
    });
  };

  const resetBrands = () => {
    const brands = Object.keys(filters.brands).reduce((result, brand) => {
      result[brand] = true;
      return result;
    }, {});

    update({ brands });
  };

  return (
    <aside className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-6">
      <div>
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-gray-900 text-sm">Price Range</h3>
          <button
            type="button"
            onClick={() => update({ minPrice: 20, maxPrice: 1130 })}
            className="text-xs text-gray-400 hover:text-indigo-600"
          >
            Reset
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-3">
          The average price is $300
        </p>

        <div className="h-12 flex items-end gap-1 px-2 mb-2">
          {[20, 35, 60, 45, 90, 100, 75, 40, 60, 30, 20].map(
            (height, index) => (
              <div
                key={index}
                style={{ height: `${height}%` }}
                className="flex-1 bg-indigo-100 rounded-t-sm"
              />
            )
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(event) =>
              update({ minPrice: Number(event.target.value) })
            }
            className="w-full border rounded-lg px-2 py-1 text-xs"
            aria-label="Minimum price"
          />
          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(event) =>
              update({ maxPrice: Number(event.target.value) })
            }
            className="w-full border rounded-lg px-2 py-1 text-xs"
            aria-label="Maximum price"
          />
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm mb-2">Star Rating</h3>

        <div className="flex items-center gap-2">
          <div className="text-amber-400 text-sm" aria-label="4 stars">
            ★★★★<span className="text-gray-300">★</span>
          </div>

          <select
            value={filters.minRating}
            onChange={(event) =>
              update({ minRating: Number(event.target.value) })
            }
            className="text-xs border rounded-lg px-2 py-1"
            aria-label="Minimum rating"
          >
            <option value="0">All ratings</option>
            <option value="4">4 Stars & up</option>
            <option value="4.5">4.5 Stars & up</option>
          </select>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-900 text-sm">Brand</h3>
          <button
            type="button"
            onClick={resetBrands}
            className="text-xs text-gray-400 hover:text-indigo-600"
          >
            Reset
          </button>
        </div>

        <div className="space-y-2.5">
          {Object.keys(filters.brands).map((brand) => (
            <label
              key={brand}
              className="flex items-center justify-between text-xs text-gray-700 cursor-pointer select-none"
            >
              <span>{brand}</span>

              <input
                type="checkbox"
                checked={filters.brands[brand]}
                onChange={() => toggleBrand(brand)}
                className="w-4 h-4 rounded cursor-pointer accent-[#5c4ce1]"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm mb-3">
          Delivery Options
        </h3>

        <div className="bg-gray-100 p-1 rounded-xl flex">
          {['standard', 'pickup'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update({ deliveryType: type })}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                filters.deliveryType === type
                  ? 'bg-[#5c4ce1] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {type === 'standard' ? 'Standard' : 'Pick Up'}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
