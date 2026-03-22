import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, projects } from "@/data/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <article>
      {/* Hero image placeholder */}
      <div
        className="aspect-[21/9] w-full bg-gray-200/60"
        aria-hidden
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <Link
          href="/about#our-work"
          className="text-[13px] font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-inset rounded"
        >
          ← Back to About
        </Link>

        <header className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            {project.title}
          </h1>
          <p className="mt-1 text-[15px] text-gray-500">
            {project.location}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2" role="list">
            {project.tags.map((tag) => (
              <li key={tag}>
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-600">
                  {tag}
                </span>
              </li>
            ))}
          </ul>
        </header>

        {/* Overview */}
        <section className="mt-12" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="text-[13px] font-medium uppercase tracking-wider text-gray-500">
            Overview
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-3">
            <div>
              <dt className="text-[13px] text-gray-500">Location</dt>
              <dd className="mt-0.5 text-[15px] font-medium text-gray-900">{project.location}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-gray-500">Year</dt>
              <dd className="mt-0.5 text-[15px] font-medium text-gray-900">{project.year}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-gray-500">Scope</dt>
              <dd className="mt-0.5 text-[15px] font-medium text-gray-900">{project.scope}</dd>
            </div>
          </dl>
        </section>

        {/* Materials used */}
        <section className="mt-12" aria-labelledby="materials-heading">
          <h2 id="materials-heading" className="text-[13px] font-medium uppercase tracking-wider text-gray-500">
            Materials Used
          </h2>
          <ul className="mt-4 space-y-2">
            {project.materials.map((material) => (
              <li key={material} className="text-[15px] text-gray-900">
                {material}
              </li>
            ))}
          </ul>
        </section>

        {/* Gallery placeholders */}
        <section className="mt-16" aria-labelledby="gallery-heading">
          <h2 id="gallery-heading" className="text-[13px] font-medium uppercase tracking-wider text-gray-500">
            Gallery
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: project.galleryCount }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-xl bg-gray-200/60"
                aria-hidden
              />
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
