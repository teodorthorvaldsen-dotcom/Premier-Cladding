import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PortalLogoutButton } from "@/components/PortalLogoutButton";
import { getSessionUser } from "@/lib/auth";
import { getDemoOrderById, type OrderRecord } from "@/lib/demoData";

function canAccessOrder(user: { role: string; customerId?: string }, order: OrderRecord) {
  if (user.role === "employee") return true;
  return order.customerId === user.customerId;
}

type PageProps = { params: { orderId: string } };

export default async function PortalOrderDetailPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const { orderId: rawId } = params;
  const orderId = decodeURIComponent(rawId);
  const order = getDemoOrderById(orderId);

  if (!order || !canAccessOrder(user, order)) {
    notFound();
  }

  const cad = order.cadMeasurements;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/portal"
          className="text-sm font-medium text-gray-700 underline-offset-4 hover:text-gray-900 hover:underline"
        >
          ← Back to orders
        </Link>
        <PortalLogoutButton />
      </div>

      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">{order.projectName}</h1>
            <p className="mt-1 text-sm text-gray-600">
              Order <span className="font-medium text-gray-900">{order.id}</span> · {order.status}
            </p>
            <p className="text-sm text-gray-500">Submitted {order.createdAt}</p>
          </div>
          <div className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800">
            {order.material} · {order.color}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Name</dt>
              <dd className="mt-0.5 font-medium text-gray-900">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Email</dt>
              <dd className="mt-0.5">
                <a className="text-gray-900 underline-offset-2 hover:underline" href={`mailto:${order.customerEmail}`}>
                  {order.customerEmail}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Phone</dt>
              <dd className="mt-0.5 text-gray-900">{order.customerPhone}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Ship to</dt>
              <dd className="mt-0.5 text-gray-900">
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 ? (
                  <>
                    <br />
                    {order.shippingAddress.line2}
                  </>
                ) : null}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Order specifications</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-4">
              <dt className="text-xs uppercase tracking-wide text-gray-500">Width</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {order.measurements.width} {order.measurements.unit}
              </dd>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <dt className="text-xs uppercase tracking-wide text-gray-500">Height</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {order.measurements.height} {order.measurements.unit}
              </dd>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <dt className="text-xs uppercase tracking-wide text-gray-500">Depth</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {order.measurements.depth != null
                  ? `${order.measurements.depth} ${order.measurements.unit}`
                  : "—"}
              </dd>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <dt className="text-xs uppercase tracking-wide text-gray-500">Core / thickness</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">{cad.thicknessMm} mm ACM</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Panel preview</h2>
        <p className="mt-1 text-sm text-gray-600">
          Snapshot from the configurator 3D preview (demo assets). Live orders would store the same style of image as
          cart checkout.
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={order.previewImageSrc}
            alt={`Panel preview for ${order.projectName}`}
            className="h-auto w-full max-h-[420px] object-contain"
            width={640}
            height={400}
          />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">CAD measurements</h2>
        <p className="mt-1 text-sm text-gray-600">
          Nominal and flat-pattern dimensions for fabrication ({cad.dxfUnits}). Aligns with unfolded tray geometry used
          for DXF export in the configurator.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Nominal panel</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-800">
              <li>
                <span className="text-gray-500">W × H: </span>
                {cad.nominal.widthIn} × {cad.nominal.heightIn} {cad.nominal.unit}
              </li>
              {cad.nominal.depthIn != null ? (
                <li>
                  <span className="text-gray-500">Return depth: </span>
                  {cad.nominal.depthIn} {cad.nominal.unit}
                </li>
              ) : null}
              <li>
                <span className="text-gray-500">Thickness: </span>
                {cad.thicknessMm} mm
              </li>
            </ul>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Flat pattern bounding box</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-800">
              <li>
                <span className="text-gray-500">Overall width: </span>
                {cad.flatPattern.boundingWidthIn} in
              </li>
              <li>
                <span className="text-gray-500">Overall length: </span>
                {cad.flatPattern.boundingLengthIn} in
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Segment / feature</th>
                <th className="px-4 py-3 font-medium">Length (in)</th>
                <th className="px-4 py-3 font-medium">Angle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cad.flatPattern.segments.map((row, i) => (
                <tr key={`${row.label}-${i}`} className="bg-white">
                  <td className="px-4 py-3 text-gray-900">{row.label}</td>
                  <td className="px-4 py-3 tabular-nums text-gray-800">{row.lengthIn}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.angleDeg != null ? `${row.angleDeg}°` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cad.flatPattern.notes?.length ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-600">
            {cad.flatPattern.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
