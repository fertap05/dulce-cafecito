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

function getProductId(
  id: string
) {
  const productId =
    Number(id);

  if (
    !Number.isInteger(
      productId
    ) ||
    productId < 1
  ) {
    return null;
  }

  return productId;
}

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
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

    const { id } =
      await params;

    const productId =
      getProductId(id);

    if (!productId) {
      return NextResponse.json(
        {
          error:
            "Invalid product.",
        },
        {
          status: 400,
        }
      );
    }

    const formData =
      await request.formData();

    const file =
      formData.get("file");

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

    if (file.size <= 0) {
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
      allowedTypes[file.type];

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

    const adminClient =
      createAdminClient();

    const {
      data: product,
      error: productError,
    } = await adminClient
      .from("products")
      .select(`
        id,
        image_path
      `)
      .eq("id", productId)
      .maybeSingle();

    if (
      productError ||
      !product
    ) {
      return NextResponse.json(
        {
          error:
            "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    const oldPath =
      product.image_path;

    const newPath =
      `products/product-${productId}-${crypto.randomUUID()}.${extension}`;

    const arrayBuffer =
      await file.arrayBuffer();

    const bytes =
      new Uint8Array(
        arrayBuffer
      );

    const {
      error: uploadError,
    } = await adminClient
      .storage
      .from(BUCKET_NAME)
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
    } = await adminClient
      .from("products")
      .update({
        image_path:
          newPath,
      })
      .eq("id", productId);

    if (updateError) {
      await adminClient
        .storage
        .from(BUCKET_NAME)
        .remove([
          newPath,
        ]);

      throw updateError;
    }

    if (
      oldPath &&
      oldPath.startsWith(
        "products/"
      ) &&
      oldPath !== newPath
    ) {
      const {
        error:
          removeOldError,
      } = await adminClient
        .storage
        .from(BUCKET_NAME)
        .remove([
          oldPath,
        ]);

      if (
        removeOldError
      ) {
        console.error(
          "Could not remove old product image:",
          removeOldError
        );
      }
    }

    const {
      data:
        publicUrlData,
    } = adminClient
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(
        newPath
      );

    return NextResponse.json({
      success: true,
      productId,
      path: newPath,
      publicUrl:
        publicUrlData.publicUrl,
    });
  } catch (error) {
    console.error(
      "Could not upload product image:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not upload the product image.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
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

    const { id } =
      await params;

    const productId =
      getProductId(id);

    if (!productId) {
      return NextResponse.json(
        {
          error:
            "Invalid product.",
        },
        {
          status: 400,
        }
      );
    }

    const adminClient =
      createAdminClient();

    const {
      data: product,
      error: productError,
    } = await adminClient
      .from("products")
      .select(`
        id,
        image_path
      `)
      .eq("id", productId)
      .maybeSingle();

    if (
      productError ||
      !product
    ) {
      return NextResponse.json(
        {
          error:
            "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    const oldPath =
      product.image_path;

    const {
      error: updateError,
    } = await adminClient
      .from("products")
      .update({
        image_path:
          null,
      })
      .eq("id", productId);

    if (updateError) {
      throw updateError;
    }

    if (
      oldPath &&
      oldPath.startsWith(
        "products/"
      )
    ) {
      const {
        error: removeError,
      } = await adminClient
        .storage
        .from(BUCKET_NAME)
        .remove([
          oldPath,
        ]);

      if (removeError) {
        console.error(
          "Could not remove product image:",
          removeError
        );
      }
    }

    return NextResponse.json({
      success: true,
      productId,
    });
  } catch (error) {
    console.error(
      "Could not remove product image:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Could not remove the product image.",
      },
      {
        status: 500,
      }
    );
  }
}