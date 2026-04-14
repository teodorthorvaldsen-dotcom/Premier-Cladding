import Link from "next/link";
import {
  alfrexCertificationSubgroups,
  alfrexFrAcmSpecificationPdf,
  type AlfrexPdfItem,
} from "@/data/alfrexPdfResources";

const cardClassName =
  "group flex min-h-0 min-w-0 w-full flex-col rounded-2xl border border-gray-200/80 bg-white p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:border-gray-300/80 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2";

function PdfCard({ item }: { item: AlfrexPdfItem }) {
  return (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={cardClassName}>
      <span className="text-[14px] font-medium leading-snug text-gray-900 group-hover:text-gray-800">{item.title}</span>
      <span className="mt-2 text-[15px] text-gray-500 group-hover:text-gray-700">View PDF →</span>
    </a>
  );
}

export default function AcmCertificationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <section aria-labelledby="acm-certs-heading" className="mx-auto max-w-3xl">
        <h1 id="acm-certs-heading" className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          ACM Certifications
        </h1>
        <p className="mt-2 text-[15px] text-gray-500">
          Certifications and test reports commonly used in submittals and specifications.
        </p>
      </section>

      <div className="mx-auto mt-10 max-w-5xl space-y-10">
        {alfrexCertificationSubgroups.map((sub) => (
          <section key={sub.label} aria-label={sub.label}>
            <h2 className="text-[15px] font-semibold uppercase tracking-wide text-gray-700">{sub.label}</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sub.items.map((item) => (
                <PdfCard key={item.href} item={item} />
              ))}
            </div>
          </section>
        ))}

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
          <a
            href={alfrexFrAcmSpecificationPdf}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl bg-gray-900 px-6 py-3.5 text-[15px] font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            View the official Alfrex FR ACM specification (PDF)
          </a>
          <Link
            href="/consultation"
            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-[15px] font-medium text-gray-900 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Need help specifying? Upload plans for consultation.
          </Link>
        </div>
      </div>
    </div>
  );
}

