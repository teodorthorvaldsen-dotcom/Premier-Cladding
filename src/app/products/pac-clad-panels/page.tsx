import Link from "next/link";

const BROCHURE_URL =
  "https://ccmwebprodfiles.blob.core.windows.net/ccm-web-prod-petersen-lo/104/PAC%20Wall%20Panel%20Brochure%208-25.pdf";

export default function MetalWallPanelSystemsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      {/* HERO */}
      <section className="pt-14 pb-10 sm:pt-20 sm:pb-12 lg:pt-24 lg:pb-16">
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.5rem]">
            Metal Wall Panel Systems
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-gray-600">
            Professional installation of metal wall panel systems for commercial and institutional projects. Our experienced teams deliver quality workmanship and attention to detail. Submit your drawings with comments for a consultation.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/products/pac-clad-panels/consultation"
              className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
            >
              Submit Drawings for Consultation
            </Link>
            <a
              href={BROCHURE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
            >
              Download Brochure (PDF)
            </a>
          </div>
        </div>
      </section>

      {/* TECHNICAL INFORMATION */}
      <section className="border-t border-gray-200 py-8 sm:py-10">
        <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">
          Technical information
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          System overview, profiles, specifications, finishes, and installation details are available in the product brochure.
        </p>
        <a
          href={BROCHURE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center text-sm font-medium text-gray-900 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 rounded"
        >
          View brochure (PDF)
          <span className="ml-1.5" aria-hidden>→</span>
        </a>
      </section>

      {/* CTA */}
      <section className="mb-20 rounded-xl border border-gray-200 bg-gray-50/80 px-6 py-10 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
            Request an installation consultation
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Submit your drawings and comments. Our installation team will review and respond with a professional consultation.
          </p>
          <Link
            href="/products/pac-clad-panels/consultation"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
          >
            Submit Drawings for Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}
