import Image from "next/image";

const CHART_PATH = "/images/acm/alfrex-metallics-metal-series.png";

export function MetallicsAndMetalSeriesShowcase() {
  return (
    <section
      className="mt-16 border-t border-gray-200/80 pt-16"
      aria-labelledby="three-coat-metallics-heading"
    >
      <div className="space-y-14">
        <div>
          <div className="border-b border-gray-100 pb-6">
            <h2
              id="three-coat-metallics-heading"
              className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl"
            >
              3 Coat Metallics
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] text-gray-500">
              Directional metallic finishes — keep batch and film-arrow alignment consistent across each elevation.
              Matching <span className="whitespace-nowrap">0.040″</span> flat sheet in inventory per Alfrex.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-900 px-3 py-1 text-[12px] font-medium text-white">
              30 Year Finish Warranty
            </span>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[12px] font-medium text-gray-800">
              AAMA 2605
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-[12px] font-medium text-emerald-900">
              Matching flat sheet in inventory
            </span>
          </div>
        </div>

        <div aria-labelledby="metal-series-subheading">
          <div className="border-b border-gray-100 pb-6">
            <h3
              id="metal-series-subheading"
              className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl"
            >
              Metal Series
            </h3>
            <p className="mt-2 max-w-2xl text-[15px] text-gray-500">
              Printed metal-appearance finishes (faux zinc family and corten-style tile). Directional brushed
              character — align panels per manufacturer guidance.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-800 px-3 py-1 text-[12px] font-medium text-white">
              20 Year Finish Warranty
            </span>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[12px] font-medium text-gray-800">
              AAMA 2605
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-[12px] font-medium text-emerald-900">
              Matching flat sheet in inventory
            </span>
          </div>
        </div>

        <figure className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="relative w-full">
            <Image
              src={CHART_PATH}
              alt="Alfrex 3 Coat Metallics: Bright Silver through Graphite Metallic. Metal Series: Faux Zinc Lite through Tile Corten, with JY codes."
              width={1200}
              height={900}
              className="h-auto w-full object-contain"
              sizes="(max-width: 1152px) 100vw, 1152px"
              priority={false}
            />
          </div>
          <figcaption className="border-t border-gray-100 px-4 py-3 text-center text-[12px] text-gray-500 sm:px-6">
            Product finishes from Alfrex FR MCM literature. Verify codes on submittals (e.g. Metal Series{" "}
            <span className="whitespace-nowrap">JY-M110</span>, <span className="whitespace-nowrap">JY-M120</span>,{" "}
            <span className="whitespace-nowrap">JY-M130</span>, <span className="whitespace-nowrap">JY-M140</span>
            ).
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
