export default function Loading() {
  return (
    <div className="p-6">
      <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-80 bg-white rounded-2xl border border-gray-100 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
