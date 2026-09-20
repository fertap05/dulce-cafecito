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

  heroEyebrow?: string;
  heroTagline?: string;
  heroDescription?: string;

  aboutTitle?: string;
  aboutParagraph1?: string;
  aboutParagraph2?: string;

  aboutHighlightTitle?: string;
  aboutHighlightText?: string;
};

async function checkAdmin() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return false;
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
    return false;
  }

  return true;
}

function validateRequiredText(
  value: unknown,
  {
    fieldName,
    minLength,
    maxLength,
  }: {
    fieldName: string;
    minLength: number;
    maxLength: number;
  }
) {
  if (
    typeof value !== "string"
  ) {
    return {
      value: "",
      error:
        `${fieldName} is required.`,
    };
  }

  const cleaned =
    value.trim();

  if (
    cleaned.length <
      minLength ||
    cleaned.length >
      maxLength
  ) {
    return {
      value: cleaned,
      error:
        `${fieldName} must be between ${minLength} and ${maxLength} characters.`,
    };
  }

  return {
    value: cleaned,
    error: null,
  };
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
        SettingsRequest;

    /*
     * Business name
     */
    const businessNameResult =
      validateRequiredText(
        body.businessName,
        {
          fieldName:
            "Business name",
          minLength: 2,
          maxLength: 100,
        }
      );

    if (
      businessNameResult.error
    ) {
      return NextResponse.json(
        {
          error:
            businessNameResult.error,
        },
        {
          status: 400,
        }
      );
    }

    const businessName =
      businessNameResult.value;

    /*
     * Time zone
     */
    if (
      !body.timezone ||
      !allowedTimezones.includes(
        body.timezone
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid time zone.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Ordering controls
     */
    if (
      typeof body.orderingEnabled !==
        "boolean" ||
      typeof body.pickupEnabled !==
        "boolean"
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

    /*
     * Maximum orders per slot
     */
    let maxOrdersPerSlot:
      | number
      | null = null;

    if (
      body.maxOrdersPerSlot !==
        null &&
      body.maxOrdersPerSlot !==
        undefined
    ) {
      if (
        !Number.isInteger(
          body.maxOrdersPerSlot
        ) ||
        body.maxOrdersPerSlot <
          1 ||
        body.maxOrdersPerSlot >
          1000
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

    /*
     * Public ZIP
     */
    let publicZipCode:
      | string
      | null = null;

    if (
      typeof body.publicZipCode ===
        "string" &&
      body.publicZipCode.trim() !==
        ""
    ) {
      const cleanedZip =
        body.publicZipCode.trim();

      if (
        !/^\d{5}$/.test(
          cleanedZip
        )
      ) {
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

      publicZipCode =
        cleanedZip;
    }

    /*
     * Homepage Hero
     */
    const heroEyebrowResult =
      validateRequiredText(
        body.heroEyebrow,
        {
          fieldName:
            "Hero eyebrow",
          minLength: 2,
          maxLength: 100,
        }
      );

    if (
      heroEyebrowResult.error
    ) {
      return NextResponse.json(
        {
          error:
            heroEyebrowResult.error,
        },
        {
          status: 400,
        }
      );
    }

    const heroTaglineResult =
      validateRequiredText(
        body.heroTagline,
        {
          fieldName:
            "Hero tagline",
          minLength: 2,
          maxLength: 160,
        }
      );

    if (
      heroTaglineResult.error
    ) {
      return NextResponse.json(
        {
          error:
            heroTaglineResult.error,
        },
        {
          status: 400,
        }
      );
    }

    const heroDescriptionResult =
      validateRequiredText(
        body.heroDescription,
        {
          fieldName:
            "Hero description",
          minLength: 2,
          maxLength: 250,
        }
      );

    if (
      heroDescriptionResult.error
    ) {
      return NextResponse.json(
        {
          error:
            heroDescriptionResult.error,
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Homepage About section
     */
    const aboutTitleResult =
      validateRequiredText(
        body.aboutTitle,
        {
          fieldName:
            "About title",
          minLength: 2,
          maxLength: 160,
        }
      );

    if (
      aboutTitleResult.error
    ) {
      return NextResponse.json(
        {
          error:
            aboutTitleResult.error,
        },
        {
          status: 400,
        }
      );
    }

    const aboutParagraph1Result =
      validateRequiredText(
        body.aboutParagraph1,
        {
          fieldName:
            "About paragraph 1",
          minLength: 2,
          maxLength: 1000,
        }
      );

    if (
      aboutParagraph1Result.error
    ) {
      return NextResponse.json(
        {
          error:
            aboutParagraph1Result.error,
        },
        {
          status: 400,
        }
      );
    }

    const aboutParagraph2Result =
      validateRequiredText(
        body.aboutParagraph2,
        {
          fieldName:
            "About paragraph 2",
          minLength: 2,
          maxLength: 1000,
        }
      );

    if (
      aboutParagraph2Result.error
    ) {
      return NextResponse.json(
        {
          error:
            aboutParagraph2Result.error,
        },
        {
          status: 400,
        }
      );
    }

    const aboutHighlightTitleResult =
      validateRequiredText(
        body.aboutHighlightTitle,
        {
          fieldName:
            "About highlight title",
          minLength: 2,
          maxLength: 160,
        }
      );

    if (
      aboutHighlightTitleResult.error
    ) {
      return NextResponse.json(
        {
          error:
            aboutHighlightTitleResult.error,
        },
        {
          status: 400,
        }
      );
    }

    const aboutHighlightTextResult =
      validateRequiredText(
        body.aboutHighlightText,
        {
          fieldName:
            "About highlight text",
          minLength: 2,
          maxLength: 1000,
        }
      );

    if (
      aboutHighlightTextResult.error
    ) {
      return NextResponse.json(
        {
          error:
            aboutHighlightTextResult.error,
        },
        {
          status: 400,
        }
      );
    }

    const adminClient =
      createAdminClient();

    /*
     * There should only be one
     * business settings row.
     */
    const {
      data: existingSettings,
      error: existingError,
    } = await adminClient
      .from(
        "business_settings"
      )
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

    /*
     * Save everything.
     */
    const {
      data: updatedSettings,
      error: updateError,
    } = await adminClient
      .from(
        "business_settings"
      )
      .update({
        business_name:
          businessName,

        timezone:
          body.timezone,

        ordering_enabled:
          body.orderingEnabled,

        pickup_enabled:
          body.pickupEnabled,

        max_orders_per_slot:
          maxOrdersPerSlot,

        public_zip_code:
          publicZipCode,

        hero_eyebrow:
          heroEyebrowResult.value,

        hero_tagline:
          heroTaglineResult.value,

        hero_description:
          heroDescriptionResult.value,

        about_title:
          aboutTitleResult.value,

        about_paragraph_1:
          aboutParagraph1Result.value,

        about_paragraph_2:
          aboutParagraph2Result.value,

        about_highlight_title:
          aboutHighlightTitleResult.value,

        about_highlight_text:
          aboutHighlightTextResult.value,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        existingSettings.id
      )
      .select(`
        id,
        business_name,
        timezone,
        ordering_enabled,
        pickup_enabled,
        max_orders_per_slot,
        public_zip_code,
        hero_eyebrow,
        hero_tagline,
        hero_description,
        about_title,
        about_paragraph_1,
        about_paragraph_2,
        about_highlight_title,
        about_highlight_text,
        updated_at
      `)
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      settings:
        updatedSettings,
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