import Link from "next/link";

export default function StockMaterialPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
        Stock Material
      </h1>
      <p className="mt-6 text-[15px] leading-relaxed text-gray-600">Coming soon.</p>
      <Link
        href="/"
        className="mt-10 inline-block rounded-xl bg-gray-900 px-6 py-3.5 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
      >
        Return to home
      </Link>
    </div>
  );
}
