import Link from "next/link";
import { MaterialCompositionDiagram } from "@/components/MaterialCompositionDiagram";

export default function OurAcmSystemPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <section aria-labelledby="acm-system-heading" className="mx-auto max-w-3xl">
        <h1 id="acm-system-heading" className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Our ACM System
        </h1>
        <p className="mt-2 text-[15px] text-gray-500">
          A practical overview of our ACM panel offering, typical build details, and how we support your project from
          takeoff to delivery.
        </p>
      </section>

      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        <section className="rounded-2xl border border-gray-200/80 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">One-of-a-kind riveting system</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-gray-700">
            Our ACM panel equipment uses a self‑pierce riveting approach engineered for consistent, repeatable
            fastening—creating a clean, seamless appearance with minimal surface disruption. This one‑of‑a‑kind
            building system improves efficiency from fabrication through installation, helping projects move faster
            while maintaining a refined finish.
          </p>
          <div className="mt-6">
            <a
              href="/documents/ECAPS-12-1134-Henrob-SPR-Report.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl bg-gray-900 px-6 py-3.5 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              View joint development report (PDF)
            </a>
            <p className="mt-2 text-xs text-gray-500">
              Report #12-1134: Henrob self‑pierce riveting for ACM panel + aluminum extrusion configuration.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-200">
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/acm-riveting-system.png"
              aria-label="ACM panel riveting system equipment"
            >
              <source src="/videos/riveting-system.mp4" type="video/mp4" />
              <source src="/videos/riveting-system.mov" type="video/quicktime" />
            </video>
          </div>
        </section>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        <section className="rounded-2xl border border-gray-200/80 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">System overview</h2>
          <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-gray-700">
            <li>• Fire-rated ACM panels for exterior facades and rainscreen systems</li>
            <li>• Cut-to-length and shop-ready fabrication support</li>
            <li>• Clear measurements and repeatable build specs from the configurator</li>
            <li>• Nationwide shipping and responsive quoting</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/products/acm-panels"
              className="inline-flex items-center rounded-xl bg-gray-900 px-5 py-3 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Open ACM Panel Configurator
            </Link>
            <Link
              href="/products/acm-panels/technical-resources"
              className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-[15px] font-medium text-gray-900 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              View technical resources
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200/80 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">Material composition</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-gray-700">
            FR ACM uses a mineral-filled core with aluminum skins for durability and code compliance. Your final quote
            confirms material, thickness, finish, and lead times for your project.
          </p>
          <div className="mt-6 flex justify-center">
            <MaterialCompositionDiagram />
          </div>
        </section>
      </div>

      <section className="mx-auto mt-12 max-w-5xl rounded-2xl border border-gray-200/80 bg-gray-50/50 p-8">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">Need detailing help?</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-gray-700">
          Upload drawings and we’ll help confirm specs, returns, and any special conditions before you place an order.
        </p>
        <div className="mt-6">
          <Link
            href="/consultation"
            className="inline-flex items-center rounded-xl bg-gray-900 px-6 py-3.5 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Upload plans for consultation
          </Link>
        </div>
      </section>
    </div>
  );
}

