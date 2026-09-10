"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BarChart3,
  CalendarDays,
  Coffee,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    name: "Menu",
    href: "/admin/menu",
    icon: Coffee,
  },
  {
    name: "Schedule",
    href: "/admin/schedule",
    icon: CalendarDays,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-[#ecd6d6] bg-white">
      <div className="border-b border-[#ecd6d6] px-6 py-7">
        <p className="text-xs uppercase tracking-[0.25em] text-[#b76e79]">
          Dulce Cafecito
        </p>

        <h1 className="mt-2 text-xl font-semibold text-[#4a2d29]">
          Admin
        </h1>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-[#f9e5e8] text-[#8e4d56]"
                  : "text-[#76534e] hover:bg-[#fff7f6] hover:text-[#8e4d56]"
              }`}
            >
              <Icon size={19} strokeWidth={1.8} />

              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#ecd6d6] p-5">
        <div className="rounded-2xl bg-[#fff7f6] p-4">
          <p className="text-xs text-[#94716b]">
            Business Management
          </p>

          <p className="mt-1 text-sm font-medium text-[#4a2d29]">
            Dulce Cafecito
          </p>
        </div>
      </div>
    </aside>
  );
}