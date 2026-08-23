import { requireAdmin } from "@/lib/supabase/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row">
      <AdminNav />
      <div className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
