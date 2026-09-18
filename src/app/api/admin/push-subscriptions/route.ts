import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type PushSubscriptionBody = {
  endpoint?: string;

  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

async function getAdminUser() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const {
    data: admin,
    error,
  } = await supabase
    .from("admin_users")
    .select("is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    error ||
    !admin ||
    !admin.is_active
  ) {
    return null;
  }

  return user;
}

export async function POST(
  request: Request
) {
  try {
    const user =
      await getAdminUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Not authorized.",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      (await request.json()) as
        PushSubscriptionBody;

    const endpoint =
      body.endpoint?.trim();

    const p256dh =
      body.keys?.p256dh?.trim();

    const auth =
      body.keys?.auth?.trim();

    if (
      !endpoint ||
      !p256dh ||
      !auth
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid push subscription.",
        },
        {
          status: 400,
        }
      );
    }

    const adminClient =
      createAdminClient();

    const {
      error,
    } = await adminClient
      .from(
        "admin_push_subscriptions"
      )
      .upsert(
        {
          user_id:
            user.id,

          endpoint,

          p256dh,

          auth,

          user_agent:
            request.headers.get(
              "user-agent"
            ),

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "endpoint",
        }
      );

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Could not save push subscription:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not enable push notifications.",
      },
      {
        status: 500,
      }
    );
  }
}