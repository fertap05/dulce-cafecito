"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { CustomerSummary } from "@/app/admin/(protected)/customers/page";

type CustomersTableProps = {
  customers: CustomerSummary[];
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(new Date(date));
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `(${digits.slice(
      0,
      3
    )}) ${digits.slice(
      3,
      6
    )}-${digits.slice(6)}`;
  }

  return phone;
}

export default function CustomersTable({
  customers,
}: CustomersTableProps) {
  const [search, setSearch] =
    useState("");

  const filteredCustomers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter(
      (customer) =>
        customer.name
          .toLowerCase()
          .includes(query) ||
        customer.email
          .toLowerCase()
          .includes(query) ||
        customer.phone
          .toLowerCase()
          .includes(query)
    );
  }, [customers, search]);

  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ecd6d6] px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold">
            Customer Directory
          </h2>

          <p className="mt-1 text-sm text-[#94716b]">
            {filteredCustomers.length}{" "}
            {filteredCustomers.length === 1
              ? "customer"
              : "customers"}
          </p>
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search name, email, or phone..."
          autoComplete="off"
          className="w-full max-w-sm rounded-full border border-[#ecd6d6] bg-[#fffafa] px-5 py-3 text-sm outline-none focus:border-[#b76e79]"
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="p-12 text-center">
          <p className="font-medium">
            No customers found.
          </p>

          <p className="mt-1 text-sm text-[#94716b]">
            Customer information will appear
            after orders are placed.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden grid-cols-[1.4fr_1.4fr_1fr_100px_120px_130px] gap-4 border-b border-[#ecd6d6] bg-[#fff8f7] px-6 py-4 text-sm font-medium text-[#76534e] lg:grid">
            <span>Customer</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Orders</span>
            <span>Value</span>
            <span>Last Order</span>
          </div>

          {filteredCustomers.map(
            (customer) => (
              <Link
                key={customer.key}
                href={`/admin/customers/${encodeURIComponent(
                  customer.key
                )}`}
                className="grid gap-4 border-b border-[#f0dddd] px-6 py-5 transition hover:bg-[#fff8f7] last:border-b-0 lg:grid-cols-[1.4fr_1.4fr_1fr_100px_120px_130px]"
              >
                <div>
                  <p className="font-semibold">
                    {customer.name}
                  </p>

                  {customer.orderCount > 1 && (
                    <span className="mt-2 inline-flex rounded-full bg-[#edf6ed] px-3 py-1 text-xs font-medium text-[#426b42]">
                      Repeat Customer
                    </span>
                  )}
                </div>

                <div className="text-sm">
                  <span className="mb-1 block text-xs text-[#94716b] lg:hidden">
                    Email
                  </span>

                  {customer.email}
                </div>

                <div className="text-sm">
                  <span className="mb-1 block text-xs text-[#94716b] lg:hidden">
                    Phone
                  </span>

                  {formatPhone(
                    customer.phone
                  )}
                </div>

                <div>
                  <span className="mb-1 block text-xs text-[#94716b] lg:hidden">
                    Orders
                  </span>

                  <span className="font-semibold">
                    {customer.orderCount}
                  </span>
                </div>

                <div>
                  <span className="mb-1 block text-xs text-[#94716b] lg:hidden">
                    Value
                  </span>

                  <span className="font-semibold text-[#8e4d56]">
                    $
                    {(
                      customer.totalSpentCents /
                      100
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="text-sm">
                  <span className="mb-1 block text-xs text-[#94716b] lg:hidden">
                    Last Order
                  </span>

                  {formatDate(
                    customer.lastOrderAt
                  )}
                </div>
              </Link>
            )
          )}
        </>
      )}
    </div>
  );
}