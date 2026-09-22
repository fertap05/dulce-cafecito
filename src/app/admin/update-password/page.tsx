"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import type { FormEvent } from "react";

import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [password, setPassword] =
    useState("");
  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [ready, setReady] =
    useState(false);
  const [checking, setChecking] =
    useState(true);
  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    const supabase = createClient();

    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          mounted &&
          session &&
          (
            event === "PASSWORD_RECOVERY" ||
            event === "SIGNED_IN" ||
            event === "INITIAL_SESSION"
          )
        ) {
          setReady(true);
          setChecking(false);
        }
      }
    );

    async function prepareRecovery() {
      try {
        const {
          data: { session },
        } =
          await supabase.auth.getSession();

        if (session) {
          if (mounted) {
            setReady(true);
            setChecking(false);
          }

          return;
        }

        const params =
          new URLSearchParams(
            window.location.search
          );

        const code =
          params.get("code");

        if (code) {
          const { error } =
            await supabase.auth
              .exchangeCodeForSession(
                code
              );

          if (!error) {
            window.history.replaceState(
              {},
              "",
              "/admin/update-password"
            );

            if (mounted) {
              setReady(true);
              setChecking(false);
            }

            return;
          }

          console.error(
            "Recovery code exchange failed:",
            error
          );
        }

        if (mounted) {
          setReady(false);
          setChecking(false);
        }
      } catch (error) {
        console.error(
          "Password recovery setup failed:",
          error
        );

        if (mounted) {
          setReady(false);
          setChecking(false);
        }
      }
    }

    prepareRecovery();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (password.length < 8) {
      setErrorMessage(
        "Your password must be at least 8 characters long."
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setErrorMessage(
        "The passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const supabase =
        createClient();

      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        console.error(
          "Password update failed:",
          error
        );

        setErrorMessage(
          "We couldn't update your password. Please request a new reset link and try again."
        );

        setLoading(false);
        return;
      }

      await supabase.auth.signOut();

      setSuccessMessage(
        "Your password has been created successfully. You can now sign in."
      );

      setPassword("");
      setConfirmPassword("");
      setReady(false);
    } catch (error) {
      console.error(
        "Password update failed:",
        error
      );

      setErrorMessage(
        "We could not connect to the server. Please try again."
      );
    }

    setLoading(false);
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff8f4] px-6 text-[#4a2d29]">
        <p>
          Checking password reset link...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff8f4] px-6 text-[#4a2d29]">
      <section className="w-full max-w-md rounded-3xl border border-[#ecd6d6] bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.25em] text-[#b76e79]">
          Dulce Cafecito
        </p>

        <h1 className="mt-3 text-3xl font-semibold">
          Create New Password
        </h1>

        {successMessage ? (
          <>
            <div className="mt-6 rounded-2xl bg-[#edf5ea] p-4 text-sm text-[#426b42]">
              {successMessage}
            </div>

            <Link
              href="/admin/login"
              className="mt-6 block w-full rounded-full bg-[#8e4d56] px-6 py-4 text-center font-medium text-white transition hover:bg-[#763d46]"
            >
              Go to Sign In
            </Link>
          </>
        ) : ready ? (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium"
              >
                New Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                required
                minLength={8}
                autoComplete="new-password"
                disabled={loading}
                className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56] disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                required
                minLength={8}
                autoComplete="new-password"
                disabled={loading}
                className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56] disabled:opacity-60"
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
              className="w-full rounded-full bg-[#8e4d56] px-6 py-4 font-medium text-white transition hover:bg-[#763d46] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : "Create Password"}
            </button>
          </form>
        ) : (
          <>
            <div className="mt-6 rounded-2xl bg-[#f9e5e8] p-4 text-sm text-[#8e4d56]">
              This password reset link is
              invalid or has expired.
            </div>

            <Link
              href="/admin/forgot-password"
              className="mt-6 block text-center text-sm font-medium text-[#8e4d56] hover:underline"
            >
              Request a new reset link
            </Link>
          </>
        )}
      </section>
    </main>
  );
}