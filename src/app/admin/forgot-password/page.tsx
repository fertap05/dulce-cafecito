"use client";

import Link from "next/link";
import { useState } from "react";

import type { FormEvent } from "react";

import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");
  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    if (!navigator.onLine) {
      setErrorMessage(
        "No internet connection. Check your connection and try again."
      );
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const redirectTo =
        `${window.location.origin}/admin/update-password`;

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo,
          }
        );

      if (error) {
        console.error(
          "Password recovery failed:",
          error
        );

        setErrorMessage(
          "We couldn't send the reset email. Please try again."
        );

        setLoading(false);
        return;
      }

      setSuccessMessage(
        "Check your email for a password reset link."
      );
    } catch (error) {
      console.error(
        "Password recovery failed:",
        error
      );

      setErrorMessage(
        "We could not connect to the server. Please try again."
      );
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff8f4] px-6 text-[#4a2d29]">
      <section className="w-full max-w-md rounded-3xl border border-[#ecd6d6] bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.25em] text-[#b76e79]">
          Dulce Cafecito
        </p>

        <h1 className="mt-3 text-3xl font-semibold">
          Reset Password
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#76534e]">
          Enter your admin email and we'll send
          you a link to create a new password.
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
              disabled={loading}
              className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56] disabled:opacity-60"
            />
          </div>

          {errorMessage && (
            <div className="rounded-2xl bg-[#f9e5e8] p-4 text-sm text-[#8e4d56]">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-2xl bg-[#edf5ea] p-4 text-sm text-[#426b42]">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#8e4d56] px-6 py-4 font-medium text-white transition hover:bg-[#763d46] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/admin/login"
            className="text-sm font-medium text-[#8e4d56] hover:underline"
          >
            ← Back to sign in
          </Link>
        </div>
      </section>
    </main>
  );
}