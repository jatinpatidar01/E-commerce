                                                                                                                                     import Link from 'next/link';

export default function ProductsPage() {
  return (
    <section className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">
            Browse the complete product catalogue.
          </p>
        </div>

        <Link
          href="/customer"
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          Back to Home
        </Link>
      </div>

      {/* TODO:
          GET /products
          Add pagination, search, sorting and filters when API is connected.
      */}
    </section>
  );
}
