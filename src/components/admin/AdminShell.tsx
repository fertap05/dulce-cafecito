import type { ReactNode } from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";

type AdminShellProps = {
  children: ReactNode;
};

export default function AdminShell({
  children,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#fff8f4] text-[#4a2d29]">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-8 py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}