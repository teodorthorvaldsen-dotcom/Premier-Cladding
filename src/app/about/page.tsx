import Image from "next/image";
import { AboutNarrative } from "@/components/AboutNarrative";
import { OUR_WORK_IMAGES } from "@/data/ourWorkImages";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <section id="our-work" className="scroll-mt-28">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            About All Cladding Solutions
          </h1>
        </div>

        <h2
          id="our-work-heading"
          className="mt-10 text-[13px] font-medium uppercase tracking-wider text-gray-500"
        >
          Our Work
        </h2>

        <div className="mx-auto max-w-3xl">
          <p className="mt-2 text-[15px] text-gray-500">
            Fabrication, supply, and support for fire-rated ACM panels nationwide.
          </p>
          <div className="mt-10">
            <AboutNarrative />
          </div>
          <p className="mt-10 text-[15px] leading-relaxed text-gray-700">
            A selection of project and installation photography from our work.
          </p>
        </div>

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

        <div className="mx-auto mt-16 max-w-3xl">
          <section className="rounded-2xl border border-gray-200/80 bg-gray-50/50 p-8">
            <h2 className="text-[15px] font-medium text-gray-900">
              Why All Cladding Solutions
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
