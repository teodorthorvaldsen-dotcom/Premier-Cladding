import Image from "next/image";
import Link from "next/link";

const BUSINESS_EMAIL = "allcladdingsolutions@gmail.com";
const BUSINESS_PHONE = "+1 (706) 464-7953";
const BUSINESS_PHONE_TEL = "+17064647953";

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
    description: "We recommend installers that can bid your project.",
  },
];

const CAPABILITIES = [
  { title: "ACM Panels", description: "Fire-rated aluminum composite material. Consultation and quotes nationwide." },
  { title: "Custom Shop Drawings", description: "Inquire about purchasing shop drawings prepared by our team." },
  { title: "Nationwide", description: "Shipping across the United States. Delivery options and pricing with your quote." },
  { title: "Installation", description: "We recommend installers that can bid your project." },
];

const PRODUCT_HIGHLIGHTS = [
  {
    title: "ACM Panels",
    description: "Fire-rated aluminum composite material. Configure online and receive a quote.",
    href: "/products/acm-panels",
    cta: "Configure & get estimate",
  },
  {
    title: "Custom Shop Drawings",
    description: "Inquire about purchasing shop drawings prepared by our team.",
    href: "/custom-shop-drawings",
    cta: "Inquire about shop drawings",
  },
  {
    title: "Installation",
    description: "We recommend installers that can bid your project.",
    href: "/consultation",
    cta: "Recommend installers",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[22rem] h-[85svh] max-h-[960px] w-full overflow-hidden md:h-[85vh] md:max-h-none">
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
              ACM Panels &amp; Cladding
            </h1>
            <p className="mt-6 animate-hero-fade-in text-lg text-white/90 md:text-xl [animation-delay:0.15s]">
              Fire-rated ACM panels. Submit drawings for consultation and quoting. Nationwide.
            </p>
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
                <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
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
          Products &amp; services
        </h2>
        <p className="mt-2 text-[15px] text-gray-500">
          Fire-rated ACM panels. Submit drawings for consultation or discuss your project with our team.
        </p>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_HIGHLIGHTS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-2xl border border-gray-200/60 bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-gray-300/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-800">
                {card.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-500">
                {card.description}
              </p>
              <span className="mt-4 inline-block text-[15px] font-medium text-gray-900 group-hover:underline">
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
                <p className="mt-2 text-[15px] leading-relaxed text-gray-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="questions-contact"
        className="border-t border-gray-200 bg-white"
        aria-labelledby="questions-contact-heading"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <h2
            id="questions-contact-heading"
            className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl"
          >
            Questions? Contact us here
          </h2>
          <p className="mt-6 text-[15px] text-gray-700">
            <a
              href={`mailto:${BUSINESS_EMAIL}`}
              className="font-medium text-gray-900 underline decoration-gray-300 underline-offset-2 hover:text-gray-700"
            >
              {BUSINESS_EMAIL}
            </a>
          </p>
          <p className="mt-2 text-[15px] text-gray-700">
            <a
              href={`tel:${BUSINESS_PHONE_TEL}`}
              className="font-medium text-gray-900 underline decoration-gray-300 underline-offset-2 hover:text-gray-700"
            >
              {BUSINESS_PHONE}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
