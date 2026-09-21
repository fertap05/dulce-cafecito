import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const BUCKET_NAME =
  "dulce-cafecito-media";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const allowedTypes: Record<
  string,
  string
> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const assetConfig = {
  logo: {
    column:
      "logo_image_path",
    prefix:
      "logo",
  },

  hero: {
    column:
      "hero_image_path",
    prefix:
      "hero",
  },

  about: {
    column:
      "about_image_path",
    prefix:
      "about",
  },
} as const;

type AssetType =
  keyof typeof assetConfig;

type MediaColumn =
  | "logo_image_path"
  | "hero_image_path"
  | "about_image_path";

type SettingsMediaRow = {
  id: number;

  logo_image_path:
    | string
    | null;

  hero_image_path:
    | string
    | null;

  about_image_path:
    | string
    | null;
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

function isAssetType(
  value: unknown
): value is AssetType {
  return (
    typeof value ===
      "string" &&
    value in assetConfig
  );
}

async function getSettingsRow() {
  const adminClient =
    createAdminClient();

  const {
    data,
    error,
  } = await adminClient
    .from(
      "business_settings"
    )
    .select(`
      id,
      logo_image_path,
      hero_image_path,
      about_image_path
    `)
    .eq("id", 1)
    .maybeSingle();

  if (
    error ||
    !data
  ) {
    throw new Error(
      "Business settings could not be found."
    );
  }

  return {
    adminClient,

    settings:
      data as SettingsMediaRow,
  };
}

export async function POST(
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

    const formData =
      await request.formData();

    const assetType =
      formData.get(
        "assetType"
      );

    const file =
      formData.get("file");

    if (
      !isAssetType(
        assetType
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid image type.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !(file instanceof File)
    ) {
      return NextResponse.json(
        {
          error:
            "Please select an image.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      file.size <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "The selected image is empty.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          error:
            "Images must be 5 MB or smaller.",
        },
        {
          status: 400,
        }
      );
    }

    const extension =
      allowedTypes[
        file.type
      ];

    if (!extension) {
      return NextResponse.json(
        {
          error:
            "Only JPG, PNG, and WebP images are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      adminClient,
      settings,
    } =
      await getSettingsRow();

    const config =
      assetConfig[
        assetType
      ];

    const column =
      config.column as
        MediaColumn;

    const oldPath =
      settings[column];

    const newPath =
      `branding/${config.prefix}-${crypto.randomUUID()}.${extension}`;

    const arrayBuffer =
      await file.arrayBuffer();

    const bytes =
      new Uint8Array(
        arrayBuffer
      );

    const {
      error: uploadError,
    } =
      await adminClient
        .storage
        .from(
          BUCKET_NAME
        )
        .upload(
          newPath,
          bytes,
          {
            contentType:
              file.type,

            cacheControl:
              "3600",

            upsert:
              false,
          }
        );

    if (uploadError) {
      throw uploadError;
    }

    const {
      error: updateError,
    } =
      await adminClient
        .from(
          "business_settings"
        )
        .update({
          [column]:
            newPath,

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          settings.id
        );

    if (updateError) {
      await adminClient
        .storage
        .from(
          BUCKET_NAME
        )
        .remove([
          newPath,
        ]);

      throw updateError;
    }

    if (
      oldPath &&
      oldPath !== newPath
    ) {
      const {
        error:
          removeOldError,
      } =
        await adminClient
          .storage
          .from(
            BUCKET_NAME
          )
          .remove([
            oldPath,
          ]);

      if (
        removeOldError
      ) {
        console.error(
          "Could not remove old website image:",
          removeOldError
        );
      }
    }

    const {
      data:
        publicUrlData,
    } =
      adminClient
        .storage
        .from(
          BUCKET_NAME
        )
        .getPublicUrl(
          newPath
        );

    return NextResponse.json({
      success: true,

      assetType,

      path:
        newPath,

      publicUrl:
        publicUrlData
          .publicUrl,
    });
  } catch (error) {
    console.error(
      "Could not upload website image:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not upload the image.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
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
      (await request.json()) as {
        assetType?: unknown;
      };

    if (
      !isAssetType(
        body.assetType
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid image type.",
        },
        {
          status: 400,
        }
      );
    }

    const assetType =
      body.assetType;

    const {
      adminClient,
      settings,
    } =
      await getSettingsRow();

    const config =
      assetConfig[
        assetType
      ];

    const column =
      config.column as
        MediaColumn;

    const oldPath =
      settings[column];

    const {
      error: updateError,
    } =
      await adminClient
        .from(
          "business_settings"
        )
        .update({
          [column]:
            null,

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          settings.id
        );

    if (updateError) {
      throw updateError;
    }

    if (oldPath) {
      const {
        error:
          removeError,
      } =
        await adminClient
          .storage
          .from(
            BUCKET_NAME
          )
          .remove([
            oldPath,
          ]);

      if (removeError) {
        console.error(
          "Could not remove website image:",
          removeError
        );
      }
    }

    return NextResponse.json({
      success: true,

      assetType,
    });
  } catch (error) {
    console.error(
      "Could not remove website image:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not remove the image.",
      },
      {
        status: 500,
      }
    );
  }
}