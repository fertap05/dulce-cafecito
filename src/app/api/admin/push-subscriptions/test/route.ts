import { NextResponse } from "next/server";

import { sendTestPushNotification } from "@/lib/push";
import { createClient } from "@/lib/supabase/server";

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
      (await request.json()) as {
        endpoint?: string;
      };

    const endpoint =
      body.endpoint?.trim();

    if (!endpoint) {
      return NextResponse.json(
        {
          error:
            "Push subscription endpoint is required.",
        },
        {
          status: 400,
        }
      );
    }

    await sendTestPushNotification({
      userId:
        user.id,

      endpoint,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Could not send test push notification:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not send test notification.",
      },
      {
        status: 500,
      }
    );
  }
}