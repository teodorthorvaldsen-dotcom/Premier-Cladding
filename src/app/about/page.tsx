import Image from "next/image";
import { AboutNarrative } from "@/components/AboutNarrative";
import { OUR_WORK_IMAGES } from "@/data/ourWorkImages";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <section
        id="about"
        className="scroll-mt-28"
        aria-labelledby="about-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h1
            id="about-heading"
            className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl"
          >
            About Premier Cladding
          </h1>
          <p className="mt-2 text-[15px] text-gray-500">
            Fabrication, supply, and support for fire-rated ACM panels nationwide.
          </p>
          <div className="mt-10">
            <AboutNarrative />
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          <section className="rounded-2xl border border-gray-200/80 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h2 className="text-lg font-semibold tracking-tight text-gray-900">One-of-a-kind riveting system</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-700">
              Our ACM panel equipment uses a self‑pierce riveting approach engineered for consistent, repeatable
              fastening—producing a clean, seamless appearance with minimal surface disruption. The result is a
              one‑of‑a‑kind building system that elevates fit and finish while improving efficiency from fabrication to
              installation.
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
              <Image
                src="/images/acm-riveting-system.png"
                alt="ACM panel fabrication equipment"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 520px"
                quality={100}
                unoptimized
              />
            </div>
          </section>
        </div>

        <div
          id="our-work"
          className="mt-16 scroll-mt-28"
          aria-label="Project and installation photography"
        >
          <p className="mx-auto max-w-3xl text-[15px] leading-relaxed text-gray-700">
            A selection of project and installation photography from our work.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
            {OUR_WORK_IMAGES.map((src) => (
              <div
                key={src}
                className="relative aspect-[4/3] min-h-[280px] overflow-hidden rounded-xl bg-gray-200 sm:min-h-[320px]"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px"
                  quality={100}
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <section className="rounded-2xl border border-gray-200/80 bg-gray-50/50 p-8">
            <h2 className="text-[15px] font-medium text-gray-900">
              Why Premier Cladding
            </h2>
            <ul className="mt-6 space-y-4">
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-900" aria-hidden />
                <span className="text-[15px] leading-relaxed text-gray-700">
                  Fire-rated ACM that meets building codes for exterior facades and rain screens
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-900" aria-hidden />
                <span className="text-[15px] leading-relaxed text-gray-700">
                  Availability and lead times confirmed with your final quote based on project size,
                  finish selection, and delivery location
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-900" aria-hidden />
                <span className="text-[15px] leading-relaxed text-gray-700">
                  Cut-to-length and fabrication support so you get exactly what you need
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-900" aria-hidden />
                <span className="text-[15px] leading-relaxed text-gray-700">
                  Simple configuration and quote process with responsive follow-up
                </span>
              </li>
            </ul>
          </section>
        </div>
      </section>
    </div>
  );
}