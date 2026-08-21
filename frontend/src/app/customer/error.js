'use client';

export default function CustomerError({ reset }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-bold text-gray-900">
        Something went wrong
      </h2>
      <p className="text-sm text-gray-500 mt-2">
        We could not load this customer page.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-5 px-5 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
      >
        Try again
      </button>
    </div>
  );
}
