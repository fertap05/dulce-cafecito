import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function checkAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: admin, error } =
    await supabase
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

function cleanOptionalText(
  value: unknown
) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();

  return cleaned || null;
}

export async function PATCH(
  request: Request
) {
  try {
    const isAdmin =
      await checkAdmin();

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
      (await request.json()) as {
        pickupAddressLine1?: string;
        pickupAddressLine2?: string;
        pickupCity?: string;
        pickupState?: string;
        pickupZipCode?: string;
        pickupInstructions?: string;
      };

    const addressLine1 =
      cleanOptionalText(
        body.pickupAddressLine1
      );

    const addressLine2 =
      cleanOptionalText(
        body.pickupAddressLine2
      );

    const city =
      cleanOptionalText(
        body.pickupCity
      );

    const state =
      cleanOptionalText(
        body.pickupState
      );

    const zipCode =
      cleanOptionalText(
        body.pickupZipCode
      );

    const instructions =
      cleanOptionalText(
        body.pickupInstructions
      );

    if (
      zipCode &&
      !/^\d{5}$/.test(zipCode)
    ) {
      return NextResponse.json(
        {
          error:
            "Pickup ZIP code must contain 5 digits.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      state &&
      state.length > 2
    ) {
      return NextResponse.json(
        {
          error:
            "Use the 2-letter state abbreviation.",
        },
        {
          status: 400,
        }
      );
    }

    const adminClient =
      createAdminClient();

    const {
      data,
      error,
    } = await adminClient
      .from(
        "private_business_settings"
      )
      .upsert({
        id: 1,

        pickup_address_line1:
          addressLine1,

        pickup_address_line2:
          addressLine2,

        pickup_city:
          city,

        pickup_state:
          state?.toUpperCase() ??
          null,

        pickup_zip_code:
          zipCode,

        pickup_instructions:
          instructions,

        updated_at:
          new Date().toISOString(),
      })
      .select(`
        id,
        pickup_address_line1,
        pickup_address_line2,
        pickup_city,
        pickup_state,
        pickup_zip_code,
        pickup_instructions
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      settings: data,
    });
  } catch (error) {
    console.error(
      "Could not save private business settings:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not save pickup location.",
      },
      {
        status: 500,
      }
    );
  }
}