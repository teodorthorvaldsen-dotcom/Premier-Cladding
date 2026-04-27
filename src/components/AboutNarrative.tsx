/**
 * Company narrative: Who we are, capabilities, service area.
 */
export function AboutNarrative() {
  return (
    <>
      <section>
        <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">
          Who We Are
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
          Premier Cladding is a Columbus, Georgia–based company specializing in the fabrication and supply of high-quality custom Aluminum Composite Material (ACM) panels. With our own dedicated workshop, we oversee every step of the production process — from precision cutting and fabrication to careful packaging and shipping, ensuring accuracy, consistency, and durability in every panel we produce.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
          Our team is built of contractors, architects, engineers, and installation teams to deliver tailored cladding solutions designed to meet the exact specifications of each project. Whether it&apos;s a modern commercial façade, retail exterior, or specialty architectural feature, our panels are built with precision craftsmanship and attention to detail.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
          At Premier Cladding, we understand that timelines matter. That&apos;s why we focus on efficient production, dependable communication, and reliable nationwide shipping directly to your job site. Our goal is simple: provide premium custom ACM panels that elevate your project while making the process seamless from order to delivery.
        </p>
        <p className="mt-6 text-[15px] font-semibold tracking-wide text-gray-900">
          Precision Built. Professionally Delivered.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">
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
        <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-500">
          Service Area
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
          We ship nationwide across the United States. Availability and lead times are confirmed with your final quote based on project size, finish selection, and delivery location.
        </p>
      </section>
    </>
  );
}
