import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const allowedTimezones = [
  "America/Chicago",
  "America/New_York",
  "America/Denver",
  "America/Los_Angeles",
];

type SettingsRequest = {
  businessName?: string;
  timezone?: string;
  orderingEnabled?: boolean;
  pickupEnabled?: boolean;
  maxOrdersPerSlot?: number | null;
  publicZipCode?: string | null;
};

async function checkAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    error ||
    !admin ||
    !admin.is_active
  ) {
    return false;
  }

  return true;
}

export async function PATCH(request: Request) {
  try {
    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        {
          error: "Not authorized.",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      (await request.json()) as SettingsRequest;

    const businessName =
      typeof body.businessName === "string"
        ? body.businessName.trim()
        : "";

    if (
      businessName.length < 2 ||
      businessName.length > 100
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid business name.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !body.timezone ||
      !allowedTimezones.includes(body.timezone)
    ) {
      return NextResponse.json(
        {
          error: "Invalid time zone.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body.orderingEnabled !== "boolean" ||
      typeof body.pickupEnabled !== "boolean"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid ordering configuration.",
        },
        {
          status: 400,
        }
      );
    }

    let maxOrdersPerSlot: number | null = null;

    if (
      body.maxOrdersPerSlot !== null &&
      body.maxOrdersPerSlot !== undefined
    ) {
      if (
        !Number.isInteger(
          body.maxOrdersPerSlot
        ) ||
        body.maxOrdersPerSlot < 1 ||
        body.maxOrdersPerSlot > 1000
      ) {
        return NextResponse.json(
          {
            error:
              "Maximum orders per slot must be a whole number greater than 0.",
          },
          {
            status: 400,
          }
        );
      }

      maxOrdersPerSlot =
        body.maxOrdersPerSlot;
    }

    let publicZipCode: string | null = null;

    if (
      typeof body.publicZipCode === "string" &&
      body.publicZipCode.trim() !== ""
    ) {
      const cleanedZip =
        body.publicZipCode.trim();

      if (!/^\d{5}$/.test(cleanedZip)) {
        return NextResponse.json(
          {
            error:
              "ZIP code must contain exactly 5 digits.",
          },
          {
            status: 400,
          }
        );
      }

      publicZipCode = cleanedZip;
    }

    const adminClient =
      createAdminClient();

    // There should only be one business settings row.
    const {
      data: existingSettings,
      error: existingError,
    } = await adminClient
      .from("business_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (
      existingError ||
      !existingSettings
    ) {
      return NextResponse.json(
        {
          error:
            "Business settings could not be found.",
        },
        {
          status: 404,
        }
      );
    }

    const {
      data: updatedSettings,
      error: updateError,
    } = await adminClient
      .from("business_settings")
      .update({
        business_name: businessName,
        timezone: body.timezone,
        ordering_enabled:
          body.orderingEnabled,
        pickup_enabled:
          body.pickupEnabled,
        max_orders_per_slot:
          maxOrdersPerSlot,
        public_zip_code:
          publicZipCode,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", existingSettings.id)
      .select(`
        id,
        business_name,
        timezone,
        ordering_enabled,
        pickup_enabled,
        max_orders_per_slot,
        public_zip_code,
        updated_at
      `)
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      settings: updatedSettings,
    });
  } catch (error) {
    console.error(
      "Could not update business settings:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not save business settings.",
      },
      {
        status: 500,
      }
    );
  }
}