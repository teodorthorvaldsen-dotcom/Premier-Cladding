import { TechnicalResourcesSection } from "@/components/TechnicalResourcesSection";

export default function AcmTechnicalResourcesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <section aria-labelledby="acm-tech-heading" className="mx-auto max-w-3xl">
        <h1 id="acm-tech-heading" className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          ACM Technical Resources
        </h1>
        <p className="mt-2 text-[15px] text-gray-500">
          Product finishes, technical documentation, and specifications for ACM panels.
        </p>
      </section>

      <div className="mx-auto max-w-5xl">
        <TechnicalResourcesSection withTopBorder={false} includeHeading={false} />
      </div>
    </div>
  );
}

