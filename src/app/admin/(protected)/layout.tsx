import { redirect } from "next/navigation";

import type { ReactNode } from "react";

import AdminShell from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: admin, error } =
    await supabase
      .from("admin_users")
      .select(
        `
          role,
          display_name,
          is_active
        `
      )
      .eq("user_id", user.id)
      .maybeSingle();

  if (
    error ||
    !admin ||
    !admin.is_active
  ) {
    redirect("/admin/login");
  }

  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}