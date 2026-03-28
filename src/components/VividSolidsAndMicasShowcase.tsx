import Image from "next/image";

const CHART_PATH = "/images/acm/alfrex-vivid-solids-2-coat-micas.png";

export function VividSolidsAndMicasShowcase() {
  return (
    <section
      className="mt-16 border-t border-gray-200/80 pt-16"
      aria-labelledby="vivid-solids-heading"
    >
      <div className="space-y-14">
        <div>
          <div className="border-b border-gray-100 pb-6">
            <h2
              id="vivid-solids-heading"
              className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl"
            >
              Vivid Solids<span className="text-base font-normal text-gray-400">*</span>
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] text-gray-500">
              High-chroma solids with matching{" "}
              <span className="whitespace-nowrap">0.040″</span> flat sheet in inventory. Contact Alfrex for full
              vivid-system warranty terms.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-800 px-3 py-1 text-[12px] font-medium text-white">
              20 Year Limited Finish Warranty
            </span>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[12px] font-medium text-gray-800">
              AAMA 2605
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-[12px] font-medium text-emerald-900">
              Matching flat sheet in inventory
            </span>
          </div>
        </div>

        <div aria-labelledby="two-coat-micas-subheading">
          <div className="border-b border-gray-100 pb-6">
            <h3
              id="two-coat-micas-subheading"
              className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl"
            >
              2 Coat Micas
            </h3>
            <p className="mt-2 max-w-2xl text-[15px] text-gray-500">
              Directional mica finishes — align protective film arrows consistently across the façade. Standard
              stocking with matching flat sheet per Alfrex.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-900 px-3 py-1 text-[12px] font-medium text-white">
              30 Year Limited Finish Warranty
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
              alt="Alfrex Vivid Solids: Signal Blue through RON Red. 2 Coat Micas: Anodic Clear Mica through New Age Dark Bronze Mica, with JY codes."
              width={1200}
              height={900}
              className="h-auto w-full object-contain"
              sizes="(max-width: 1152px) 100vw, 1152px"
              priority={false}
            />
          </div>
          <figcaption className="border-t border-gray-100 px-4 py-3 text-center text-[12px] leading-relaxed text-gray-500 sm:px-6">
            <span className="text-gray-600">*</span> Vivid Solids may combine PVDF, FEVE, or HDP resin systems by
            color; verify coating stack and warranty wording on your submittal package.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
