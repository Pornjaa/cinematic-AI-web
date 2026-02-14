import { db } from "@/lib/db";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "Admin",
  description: "Admin dashboard",
  path: "/admin",
  noindex: true
});

export default async function AdminDashboardPage() {
  const [users, courses, orders] = await Promise.all([
    db.user.count(),
    db.course.count(),
    db.order.count({ where: { status: "PENDING_VERIFICATION" } })
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl cinematic-card p-5">Users: {users}</div>
        <div className="rounded-3xl cinematic-card p-5">Courses: {courses}</div>
        <div className="rounded-3xl cinematic-card p-5">Pending slips: {orders}</div>
      </div>
    </div>
  );
}
