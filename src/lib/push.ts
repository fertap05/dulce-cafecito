import "server-only";

import webpush from "web-push";

import { createAdminClient } from "@/lib/supabase/admin";

type NewOrderPushProps = {
  orderNumber: number;
  customerName: string;
  pickupTime: string;
  totalCents: number;
};

type StoredSubscription = {
  id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
};

function configureWebPush() {
  const subject =
    process.env.VAPID_SUBJECT;

  const publicKey =
    process.env
      .NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const privateKey =
    process.env.VAPID_PRIVATE_KEY;

  if (
    !subject ||
    !publicKey ||
    !privateKey
  ) {
    throw new Error(
      "VAPID configuration is incomplete."
    );
  }

  webpush.setVapidDetails(
    subject,
    publicKey,
    privateKey
  );
}

function formatPickupTime(
  time: string
) {
  const [hourString, minute] =
    time.split(":");

  const hour =
    Number(hourString);

  const period =
    hour >= 12 ? "PM" : "AM";

  const displayHour =
    hour % 12 || 12;

  return `${displayHour}:${minute} ${period}`;
}

function getPushStatusCode(
  error: unknown
) {
  if (
    typeof error !== "object" ||
    error === null ||
    !("statusCode" in error)
  ) {
    return null;
  }

  const statusCode =
    (
      error as {
        statusCode?: unknown;
      }
    ).statusCode;

  return typeof statusCode ===
    "number"
    ? statusCode
    : null;
}

export async function sendNewOrderPushNotification({
  orderNumber,
  customerName,
  pickupTime,
  totalCents,
}: NewOrderPushProps) {
  configureWebPush();

  const adminClient =
    createAdminClient();

  const {
    data: subscriptions,
    error: subscriptionsError,
  } = await adminClient
    .from(
      "admin_push_subscriptions"
    )
    .select(
      `
        id,
        endpoint,
        p256dh,
        auth
      `
    );

  if (subscriptionsError) {
    throw subscriptionsError;
  }

  if (
    !subscriptions ||
    subscriptions.length === 0
  ) {
    return {
      sent: 0,
      failed: 0,
      removed: 0,
    };
  }

  const storedSubscriptions =
    subscriptions as StoredSubscription[];

  const formattedTime =
    formatPickupTime(
      pickupTime
    );

  const total =
    `$${(
      totalCents / 100
    ).toFixed(2)}`;

  const payload =
    JSON.stringify({
      title:
        `New Order #${orderNumber} ☕`,

      body:
        `${customerName} • ${formattedTime} • ${total}`,

      url:
        "/admin/orders",

      tag:
        `new-order-${orderNumber}`,
    });

  let sent = 0;
  let failed = 0;
  let removed = 0;

  for (
    const subscription of
    storedSubscriptions
  ) {
    try {
      await webpush.sendNotification(
        {
          endpoint:
            subscription.endpoint,

          keys: {
            p256dh:
              subscription.p256dh,

            auth:
              subscription.auth,
          },
        },
        payload,
        {
          TTL: 60,
        }
      );

      sent += 1;
    } catch (error) {
      const statusCode =
        getPushStatusCode(
          error
        );

      /*
       * 404 / 410 means the browser
       * subscription no longer exists.
       * Remove it so we don't keep
       * trying to notify a dead device.
       */
      if (
        statusCode === 404 ||
        statusCode === 410
      ) {
        const {
          error: deleteError,
        } = await adminClient
          .from(
            "admin_push_subscriptions"
          )
          .delete()
          .eq(
            "id",
            subscription.id
          );

        if (deleteError) {
          console.error(
            "Could not remove expired push subscription:",
            deleteError
          );
        } else {
          removed += 1;
        }

        continue;
      }

      failed += 1;

      console.error(
        "Push notification failed:",
        error
      );
    }
  }

  return {
    sent,
    failed,
    removed,
  };
}