import Image from "next/image";
import Link from "next/link";
import { projects } from "@/data/projects";

const TRUST_ITEMS = [
  {
    title: "Lead times",
    description: "Confirmed with your quote based on project size, finish, and delivery location.",
  },
  {
    title: "Nationwide",
    description: "We ship across the United States. Delivery options and pricing with your quote.",
  },
  {
    title: "Fire-rated ACM",
    description: "Meets building codes for exterior applications.",
  },
  {
    title: "Installation",
    description: "Experienced installation teams. Quality workmanship for ACM and metal wall panel systems.",
  },
];

const CAPABILITIES = [
  { title: "ACM Panels", description: "Fire-rated aluminum composite material. Cut-to-length 12 in–300 in. Configure and quote online." },
  { title: "Metal wall systems", description: "Professional installation of metal wall panel and cladding systems. Experienced teams, quality workmanship." },
  { title: "Nationwide", description: "Shipping across the United States. Delivery options and pricing with your quote." },
  { title: "Installation", description: "Experienced installation teams for ACM and metal wall panel systems. Quality workmanship and project management." },
];

const PRODUCT_HIGHLIGHTS = [
  {
    title: "ACM Panels",
    description: "Fire-rated aluminum composite material. Cut-to-length 12 in–300 in. Configure online and receive a quote.",
    href: "/products/acm-panels",
    cta: "Configure & get estimate",
  },
  {
    title: "Metal Wall Systems",
    description: "Professional installation of metal wall panel and cladding systems. Our teams deliver quality workmanship. Submit drawings and comments for a consultation.",
    href: "/products/pac-clad-panels",
    cta: "View brochure & request consultation",
  },
  {
    title: "Installation",
    description: "Experienced teams for ACM and metal wall panel systems. Quality workmanship, project management, and technical support.",
    href: "/products/pac-clad-panels/consultation",
    cta: "Request consultation",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <Image
          src="/images/hero.jpg"
          alt="Modern architectural facade with ACM panels"
          fill
          priority
          className="object-cover"
          unoptimized
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/30"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,rgba(0,0,0,0.25)_100%)]"
          aria-hidden
        />
        <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
          <div className="max-w-3xl text-white">
            <h1 className="animate-hero-fade-in text-[2.75rem] font-semibold tracking-[-0.03em] md:text-[4.25rem] lg:text-[5rem]">
              Metal Wall Systems & Cladding
            </h1>
            <p className="mt-6 animate-hero-fade-in text-lg text-white/90 md:text-xl [animation-delay:0.15s]">
              Fire-rated ACM panels and metal wall panel installation. Configure online or submit drawings for consultation. Nationwide.
            </p>
            <div className="mt-8 flex animate-hero-fade-in flex-wrap justify-center gap-4 [animation-delay:0.3s]">
              <Link
                href="/products/acm-panels"
                className="rounded-lg bg-white px-6 py-3.5 text-sm font-medium text-gray-900 transition hover:bg-white/95 focus:outline-none focus:ring-2 focus:ring-white/80 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                ACM Panels
              </Link>
              <Link
                href="/products/pac-clad-panels"
                className="rounded-lg border border-white/70 bg-white/10 px-6 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                Metal Wall Systems
              </Link>
              <Link
                href="/projects"
                className="rounded-lg border border-white/60 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section
        className="border-y border-gray-200 bg-white"
        aria-label="Capabilities"
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className="text-center sm:text-left">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product highlights */}
      <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 lg:py-32">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Products & services
        </h2>
        <p className="mt-2 text-[15px] text-gray-500">
          Fire-rated ACM panels and metal wall panel installation. Configure online or submit drawings for consultation.
        </p>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_HIGHLIGHTS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-2xl border border-gray-200/60 bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-gray-300/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              <h3 className="text-[17px] font-medium text-gray-900 group-hover:text-gray-800">
                {card.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
                {card.description}
              </p>
              <span className="mt-4 inline-block text-[13px] font-medium text-gray-900 group-hover:underline">
                {card.cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section
        className="bg-[#0f0f10] py-28 lg:py-32"
        aria-labelledby="capabilities-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="capabilities-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Capabilities
          </h2>
          <p className="mt-2 text-[15px] text-gray-400">
            Capabilities and service scope.
          </p>
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/[0.08] px-8 py-10 transition-colors duration-300 hover:border-white/15 hover:bg-white/[0.02]"
              >
                <h3 className="text-[15px] font-medium text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Work */}
      <section
        className="border-t border-gray-200/50 bg-gray-50/40 py-28 lg:py-32"
        aria-labelledby="our-work-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="our-work-heading" className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Our Work
          </h2>
          <p className="mt-2 text-[15px] text-gray-500">
            Metal wall panels and ACM panels in commercial and architectural applications.
          </p>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.slug}
                href="/projects"
                className="group block overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-gray-300/80 hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#1a1a1b]">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    style={{ backgroundImage: `url(/images/projects/${project.slug}.jpg)` }}
                    aria-hidden
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                    aria-hidden
                  />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/projects"
              className="inline-block text-[14px] font-medium text-gray-900 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset rounded"
            >
              View our work →
            </Link>
          </div>
        </div>
      </section>

      {/* Consultation */}
      <section className="border-t border-gray-200/50 py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Request a consultation
          </h2>
          <p className="mt-4 text-[15px] text-gray-500">
            Submit drawings or specifications for ACM panels or metal wall systems. Our team will review and respond.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/consultation"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-8 py-3.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              General consultation
            </Link>
            <Link
              href="/products/pac-clad-panels/consultation"
              className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Metal wall consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Quote CTA */}
      <section className="border-t border-gray-200/50 bg-gray-50/50 py-24 lg:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Get a quote
          </h2>
          <p className="mt-4 text-[15px] text-gray-500">
            Configure ACM panels for an instant estimate, or submit drawings for a metal wall installation consultation.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/products/acm-panels"
              className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              ACM panel estimate
            </Link>
            <Link
              href="/products/pac-clad-panels/consultation"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-8 py-3.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Metal wall consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
