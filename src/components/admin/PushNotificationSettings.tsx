"use client";

import {
  useEffect,
  useState,
} from "react";

function urlBase64ToUint8Array(
  base64String: string
) {
  const padding =
    "=".repeat(
      (4 -
        (base64String.length %
          4)) %
        4
    );

  const base64 =
    (
      base64String +
      padding
    )
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  return Uint8Array.from(
    [...rawData].map(
      (character) =>
        character.charCodeAt(0)
    )
  );
}

export default function PushNotificationSettings() {
  const [
    supported,
    setSupported,
  ] = useState(true);

  const [
    enabled,
    setEnabled,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState<
    | "enable"
    | "disable"
    | "test"
    | null
  >(null);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  useEffect(() => {
    async function checkStatus() {
      const browserSupported =
        "serviceWorker" in
          navigator &&
        "PushManager" in
          window &&
        "Notification" in
          window;

      if (!browserSupported) {
        setSupported(false);
        return;
      }

      try {
        await navigator
          .serviceWorker
          .register("/sw.js");

        const registration =
          await navigator
            .serviceWorker
            .ready;

        const subscription =
          await registration
            .pushManager
            .getSubscription();

        setEnabled(
          Boolean(subscription)
        );
      } catch (error) {
        console.error(
          "Could not check push status:",
          error
        );

        setSupported(false);
      }
    }

    checkStatus();
  }, []);

  async function enableNotifications() {
    setLoading("enable");
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const publicKey =
        process.env
          .NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error(
          "VAPID public key is not configured."
        );
      }

      const permission =
        await Notification
          .requestPermission();

      if (
        permission !==
        "granted"
      ) {
        throw new Error(
          "Notification permission was not granted."
        );
      }

      await navigator
        .serviceWorker
        .register("/sw.js");

      const registration =
        await navigator
          .serviceWorker
          .ready;

      let subscription =
        await registration
          .pushManager
          .getSubscription();

      if (!subscription) {
        subscription =
          await registration
            .pushManager
            .subscribe({
              userVisibleOnly:
                true,

              applicationServerKey:
                urlBase64ToUint8Array(
                  publicKey
                ),
            });
      }

      const subscriptionJson =
        subscription.toJSON();

      const response =
        await fetch(
          "/api/admin/push-subscriptions",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                subscriptionJson
              ),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Could not save notification subscription."
        );
      }

      setEnabled(true);

      setSuccessMessage(
        "Push notifications are enabled on this device."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not enable notifications."
      );
    } finally {
      setLoading(null);
    }
  }

  async function testNotification() {
    setLoading("test");
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const registration =
        await navigator
          .serviceWorker
          .ready;

      const subscription =
        await registration
          .pushManager
          .getSubscription();

      if (!subscription) {
        setEnabled(false);

        throw new Error(
          "This device is not subscribed to push notifications."
        );
      }

      const response =
        await fetch(
          "/api/admin/push-subscriptions/test",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                endpoint:
                  subscription.endpoint,
              }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Could not send test notification."
        );
      }

      setSuccessMessage(
        "Test notification sent."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not send test notification."
      );
    } finally {
      setLoading(null);
    }
  }

  async function disableNotifications() {
    setLoading("disable");
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const registration =
        await navigator
          .serviceWorker
          .ready;

      const subscription =
        await registration
          .pushManager
          .getSubscription();

      if (!subscription) {
        setEnabled(false);

        setSuccessMessage(
          "Notifications are already disabled."
        );

        return;
      }

      const response =
        await fetch(
          "/api/admin/push-subscriptions",
          {
            method:
              "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                endpoint:
                  subscription.endpoint,
              }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Could not remove notification subscription."
        );
      }

      await subscription
        .unsubscribe();

      setEnabled(false);

      setSuccessMessage(
        "Push notifications are disabled on this device."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not disable notifications."
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white">
      <div className="border-b border-[#ecd6d6] px-6 py-5">
        <h2 className="text-xl font-semibold">
          Device Notifications
        </h2>

        <p className="mt-1 text-sm text-[#94716b]">
          Receive a browser notification
          when a new order is placed,
          even when the admin page is not
          open.
        </p>
      </div>

      <div className="p-6">
        {!supported ? (
          <div className="rounded-2xl bg-[#f9e5e8] p-4 text-sm text-[#8e4d56]">
            Push notifications are not
            supported in this browser or
            environment.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="font-medium">
                  This Device
                </p>

                <p className="mt-1 text-sm text-[#94716b]">
                  {enabled
                    ? "Notifications are enabled."
                    : "Notifications are currently disabled."}
                </p>
              </div>

              {!enabled ? (
                <button
                  type="button"
                  disabled={
                    loading !== null
                  }
                  onClick={
                    enableNotifications
                  }
                  className="rounded-full bg-[#8e4d56] px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
                >
                  {loading ===
                  "enable"
                    ? "Enabling..."
                    : "Enable Notifications"}
                </button>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={
                      loading !==
                      null
                    }
                    onClick={
                      testNotification
                    }
                    className="rounded-full border border-[#8e4d56] px-5 py-3 text-sm font-medium text-[#8e4d56] transition hover:bg-[#fff1f2] disabled:opacity-50"
                  >
                    {loading ===
                    "test"
                      ? "Sending..."
                      : "Send Test Notification"}
                  </button>

                  <button
                    type="button"
                    disabled={
                      loading !==
                      null
                    }
                    onClick={
                      disableNotifications
                    }
                    className="rounded-full bg-[#8e4d56] px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {loading ===
                    "disable"
                      ? "Disabling..."
                      : "Disable Notifications"}
                  </button>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="mt-5 rounded-2xl bg-[#f9e5e8] p-4 text-sm text-[#8e4d56]">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mt-5 rounded-2xl bg-[#edf6ed] p-4 text-sm text-[#426b42]">
                {successMessage}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}