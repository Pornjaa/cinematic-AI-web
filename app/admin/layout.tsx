import { requireRole } from "@/lib/rbac";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADMIN");

  return (
    <div className="grid gap-6 md:grid-cols-[240px,1fr]">
      <AdminSidebar />
      <section>{children}</section>
    </div>
  );
}
