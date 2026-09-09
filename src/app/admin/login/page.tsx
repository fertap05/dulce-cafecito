"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { FormEvent } from "react";

import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");
  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setLoading(true);

    const supabase = createClient();

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setErrorMessage(
        "Invalid email or password."
      );

      setLoading(false);
      return;
    }

    router.push("/admin/orders");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff8f4] px-6 text-[#4a2d29]">
      <section className="w-full max-w-md rounded-3xl border border-[#ecd6d6] bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.25em] text-[#b76e79]">
          Dulce Cafecito
        </p>

        <h1 className="mt-3 text-3xl font-semibold">
          Admin Sign In
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#76534e]">
          Sign in to manage orders and business
          operations.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              autoComplete="email"
              className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
            />
          </div>

          {errorMessage && (
            <div className="rounded-2xl bg-[#f9e5e8] p-4 text-sm text-[#8e4d56]">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#8e4d56] px-6 py-4 font-medium text-white transition hover:bg-[#763d46] disabled:opacity-50"
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}