"use client";

import Image from "next/image";

const PAGES = [
  {
    src: "/images/acm/alfrex-2-coat-solids.png",
    alt: "Alfrex standard finishes: 2 coat solids color chart with JY codes from Classic White through Midnight Black, 30 year warranty and AAMA 2605.",
    caption: "2 coat solids — 30 year finish warranty, AAMA 2605, matching 0.040″ flat sheet.",
  },
  {
    src: "/images/acm/alfrex-vivid-solids-2-coat-micas.png",
    alt: "Alfrex vivid solids and 2 coat micas: Signal Blue through RON Red, and twelve micas from Anodic Clear through New Age Dark Bronze.",
    caption: "Vivid solids* (20 year limited) and 2 coat micas (30 year) — AAMA 2605, matching flat sheet.",
  },
  {
    src: "/images/acm/alfrex-metallics-metal-wood.png",
    alt: "Alfrex 3 coat metallics, metal series faux zinc and corten, and wood series teak, golden oak, and dark walnut.",
    caption: "3 coat metallics, metal series, and wood series — warranty and flat sheet notes per series on chart.",
  },
  {
    src: "/images/acm/alfrex-zinc-specialty-custom.png",
    alt: "Natural zinc series, specialty hairline and mirror finishes, and custom color matching information with sample fans.",
    caption: "Natural zinc* and specialty* finishes; custom colors via sample, paint code, or Pantone reference.",
  },
] as const;

export function AcmFinishCatalogShowcase() {
  return (
    <section
      className="mt-20 border-t border-gray-200/80 pt-16"
      aria-labelledby="acm-finish-catalog-heading"
    >
      <h2
        id="acm-finish-catalog-heading"
        className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl"
      >
        Standard finish charts
      </h2>
      <p className="mt-2 max-w-3xl text-[15px] text-gray-500">
        Reference pages from the Alfrex FR standard finishes lineup, aligned with the interactive selector above. Asterisked
        series may have limited warranty or stocking terms — see chart footnotes and your quote for project-specific
        confirmation.
      </p>
      <div className="mt-10 space-y-12">
        {PAGES.map((page) => (
          <figure key={page.src} className="mx-auto max-w-4xl">
            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-50/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <Image
                src={page.src}
                alt={page.alt}
                width={1200}
                height={900}
                className="h-auto w-full object-contain"
                sizes="(max-width: 896px) 100vw, 896px"
                priority={false}
              />
            </div>
            <figcaption className="mt-3 text-center text-[13px] text-gray-600">{page.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
