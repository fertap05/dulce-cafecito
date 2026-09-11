import CustomersTable from "@/components/admin/CustomersTable";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OrderRecord = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_cents: number;
  order_status: string;
  created_at: string;
};

export type CustomerSummary = {
  key: string;
  name: string;
  email: string;
  phone: string;
  orderCount: number;
  totalSpentCents: number;
  lastOrderAt: string;
};

function customerKey(order: OrderRecord) {
  const email = order.customer_email
    ?.trim()
    .toLowerCase();

  const phone = order.customer_phone
    ?.replace(/\D/g, "");

  if (email) {
    return `email:${email}`;
  }

  if (phone) {
    return `phone:${phone}`;
  }

  return `name:${order.customer_name
    .trim()
    .toLowerCase()}`;
}

export default async function CustomersPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      customer_name,
      customer_email,
      customer_phone,
      total_cents,
      order_status,
      created_at
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Could not load customers:",
      error
    );

    return (
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#b76e79]">
          Dulce Cafecito Admin
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          Customers
        </h1>

        <div className="mt-8 rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-[#8e4d56]">
            Could not load customers.
          </p>
        </div>
      </div>
    );
  }

  const orders = (data ?? []) as OrderRecord[];

  const customerMap = new Map<
    string,
    CustomerSummary
  >();

  for (const order of orders) {
    const key = customerKey(order);

    const existing = customerMap.get(key);

    const countsTowardSpending =
      order.order_status !== "cancelled";

    if (!existing) {
      customerMap.set(key, {
        key,
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        orderCount: 1,
        totalSpentCents:
          countsTowardSpending
            ? order.total_cents
            : 0,
        lastOrderAt: order.created_at,
      });

      continue;
    }

    existing.orderCount += 1;

    if (countsTowardSpending) {
      existing.totalSpentCents +=
        order.total_cents;
    }

    if (
      new Date(order.created_at).getTime() >
      new Date(existing.lastOrderAt).getTime()
    ) {
      existing.lastOrderAt =
        order.created_at;

      existing.name =
        order.customer_name;

      existing.email =
        order.customer_email;

      existing.phone =
        order.customer_phone;
    }
  }

  const customers = Array.from(
    customerMap.values()
  ).sort(
    (a, b) =>
      new Date(b.lastOrderAt).getTime() -
      new Date(a.lastOrderAt).getTime()
  );

  const totalCustomerValue =
    customers.reduce(
      (sum, customer) =>
        sum + customer.totalSpentCents,
      0
    );

  const repeatCustomers =
    customers.filter(
      (customer) =>
        customer.orderCount > 1
    ).length;

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-[#b76e79]">
          Dulce Cafecito Admin
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          Customers
        </h1>

        <p className="mt-2 text-[#76534e]">
          View customer activity and order
          history.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm text-[#76534e]">
            Customers
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {customers.length}
          </p>
        </div>

        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm text-[#76534e]">
            Repeat Customers
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {repeatCustomers}
          </p>
        </div>

        <div className="rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-sm text-[#76534e]">
            Customer Order Value
          </p>

          <p className="mt-2 text-3xl font-semibold">
            $
            {(
              totalCustomerValue / 100
            ).toFixed(2)}
          </p>
        </div>
      </div>

      <CustomersTable
        customers={customers}
      />
    </div>
  );
}