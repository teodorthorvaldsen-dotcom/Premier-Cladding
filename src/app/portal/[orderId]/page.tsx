type PageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { orderId } = await params;

  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto rounded-2xl border p-6">
        <h1 className="text-2xl font-semibold mb-4">Order Details</h1>
        <p className="text-sm text-gray-600">Order ID: {orderId}</p>
      </div>
    </div>
  );
}
