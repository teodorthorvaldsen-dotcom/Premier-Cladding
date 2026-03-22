import Image from "next/image";
import { OUR_WORK_IMAGES } from "@/data/ourWorkImages";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          About All Cladding Solutions
        </h1>

        <section className="mt-10">
          <h2 className="text-[13px] font-medium uppercase tracking-wider text-gray-500">
            Who We Are
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
            All Cladding Solutions is a Columbus, Georgia–based company specializing in the fabrication and supply of high-quality custom Aluminum Composite Material (ACM) panels. With our own dedicated workshop, we oversee every step of the production process — from precision cutting and fabrication to careful packaging and shipping, ensuring accuracy, consistency, and durability in every panel we produce.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
            Our team is built of contractors, architects, engineers, and installation teams to deliver tailored cladding solutions designed to meet the exact specifications of each project. Whether it&apos;s a modern commercial façade, retail exterior, or specialty architectural feature, our panels are built with precision craftsmanship and attention to detail.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
            At All Cladding Solutions, we understand that timelines matter. That&apos;s why we focus on efficient production, dependable communication, and reliable nationwide shipping directly to your job site. Our goal is simple: provide premium custom ACM panels that elevate your project while making the process seamless from order to delivery.
          </p>
          <p className="mt-6 text-[15px] font-semibold tracking-wide text-gray-900">
            Precision Built. Professionally Delivered.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-[13px] font-medium uppercase tracking-wider text-gray-500">
            Capabilities
          </h2>
          <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-gray-700">
            <li>• Fire-rated ACM panels (Alfrex FR 4mm and 6mm)</li>
            <li>• Cut-to-length from 12 in to 300 in</li>
            <li>• Wide color range: solids, micas, metallics, wood, metal, specialty</li>
            <li>• Standard and custom widths</li>
            <li>• Fabrication support and technical guidance</li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-[13px] font-medium uppercase tracking-wider text-gray-500">
            Service Area
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
            We ship nationwide across the United States. Availability and lead times are confirmed with your final quote based on project size, finish selection, and delivery location.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-[13px] font-medium uppercase tracking-wider text-gray-500">
            Quality & Process
          </h2>
          <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-gray-700">
            <li>• Fire-rated panels meet building code requirements for exterior applications</li>
            <li>• Kynar PVDF finish for durability and color retention</li>
            <li>• Transparent pricing and responsive quote process</li>
            <li>• Orders confirmed before fabrication begins</li>
          </ul>
        </section>
      </div>

      <section
        id="our-work"
        className="mt-16 scroll-mt-28"
        aria-labelledby="our-work-heading"
      >
        <h2
          id="our-work-heading"
          className="text-[13px] font-medium uppercase tracking-wider text-gray-500"
        >
          Our Work
        </h2>
        <p className="mx-auto mt-2 max-w-3xl text-[15px] leading-relaxed text-gray-700">
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
      </section>

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
                Availability and lead times confirmed with your final quote based on project size, finish selection, and delivery location
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
    </div>
  );
}
