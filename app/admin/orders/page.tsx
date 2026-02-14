import { db } from "@/lib/db";
import { OrderReviewCard } from "@/components/admin/order-review-card";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    where: { status: "PENDING_VERIFICATION" },
    include: { user: true, course: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pending Slip Review</h1>
      {orders.length === 0 && <p className="text-sm text-zinc-300">No pending orders.</p>}
      {orders.map((order) => (
        <OrderReviewCard
          key={order.id}
          orderId={order.id}
          courseTitle={order.course.titleTh}
          userEmail={order.user.email}
          slipImageUrl={order.slipImageUrl}
        />
      ))}
    </div>
  );
}
