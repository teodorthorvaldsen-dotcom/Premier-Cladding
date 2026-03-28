import Image from "next/image";

const CHART_PATH = "/images/acm/alfrex-metal-wood-series.png";

export function MetalAndWoodSeriesShowcase() {
  return (
    <section
      className="mt-16 border-t border-gray-200/80 pt-16"
      aria-labelledby="metal-wood-showcase-heading"
    >
      <div className="space-y-12">
        <h2
          id="metal-wood-showcase-heading"
          className="sr-only"
        >
          Metal Series and Wood Series finishes
        </h2>

        <div>
          <div className="border-b border-gray-100 pb-6">
            <h3 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Metal Series
            </h3>
            <p className="mt-2 max-w-2xl text-[15px] text-gray-500">
              Brushed faux-zinc appearance and tile corten print. Directional finishes — align product per Alfrex.
              Matching <span className="whitespace-nowrap">0.040″</span> flat sheet in inventory.
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

        <div aria-labelledby="wood-series-showcase-subheading">
          <div className="border-b border-gray-100 pb-6">
            <h3
              id="wood-series-showcase-subheading"
              className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl"
            >
              Wood Series
            </h3>
            <p className="mt-2 max-w-2xl text-[15px] text-gray-500">
              Directional wood-grain prints: Teak, Golden Oak, and Dark Walnut. Order material for one elevation in
              a single batch where possible.
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
              alt="Alfrex Metal Series: Faux Zinc Lite JY-M130 through Tile Corten JY-M140. Wood Series: Teak JY-W120, Golden Oak JY-W140, Dark Walnut JY-W150."
              width={1200}
              height={800}
              className="h-auto w-full object-contain"
              sizes="(max-width: 1152px) 100vw, 1152px"
              priority={false}
            />
          </div>
          <figcaption className="border-t border-gray-100 px-4 py-3 text-center text-[12px] leading-relaxed text-gray-500 sm:px-6">
            Metal Series codes: <span className="whitespace-nowrap">JY-M110</span>,{" "}
            <span className="whitespace-nowrap">JY-M120</span>, <span className="whitespace-nowrap">JY-M130</span>,{" "}
            <span className="whitespace-nowrap">JY-M140</span>. Wood Series:{" "}
            <span className="whitespace-nowrap">JY-W120</span>, <span className="whitespace-nowrap">JY-W140</span>,{" "}
            <span className="whitespace-nowrap">JY-W150</span> (Alfrex FR MCM).
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
