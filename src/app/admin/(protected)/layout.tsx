import { redirect } from "next/navigation";

import type { ReactNode } from "react";

import AdminLiveUpdates from "@/components/admin/AdminLiveUpdates";
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

  // Get the newest order number.
  // AdminLiveUpdates uses this to detect
  // when a new order has arrived.
  const {
    data: latestOrder,
    error: latestOrderError,
  } = await supabase
    .from("orders")
    .select("order_number")
    .order("order_number", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (latestOrderError) {
    console.error(
      "Could not load latest order number:",
      latestOrderError
    );
  }

  const latestOrderNumber =
    latestOrder?.order_number ?? null;

  return (
    <AdminShell>
      {children}

      <AdminLiveUpdates
        latestOrderNumber={latestOrderNumber}
      />
    </AdminShell>
  );
}