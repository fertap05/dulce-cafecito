import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type CustomizationGroupInput = {
  groupId: number;
  isRequired: boolean;
  enabledValueIds: number[];
};

type UpdateCustomizationsBody = {
  groups?: CustomizationGroupInput[];
};

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;
    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const { data: admin, error: adminError } =
      await supabase
        .from("admin_users")
        .select("role, is_active")
        .eq("user_id", user.id)
        .maybeSingle();

    if (
      adminError ||
      !admin ||
      !admin.is_active
    ) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 403 }
      );
    }

    const body =
      (await request.json()) as
        UpdateCustomizationsBody;

    const groups =
      Array.isArray(body.groups)
        ? body.groups
        : [];

    const groupIds =
      groups.map(
        (group) => group.groupId
      );

    if (
      groupIds.some(
        (groupId) =>
          !Number.isInteger(groupId)
      ) ||
      new Set(groupIds).size !==
        groupIds.length
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid customization groups.",
        },
        { status: 400 }
      );
    }

    const adminClient =
      createAdminClient();

    const {
      data: product,
      error: productError,
    } = await adminClient
      .from("products")
      .select("id")
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
        { status: 404 }
      );
    }

    const uniqueValueIds =
      Array.from(
        new Set(
          groups.flatMap(
            (group) =>
              group.enabledValueIds
          )
        )
      );

    if (
      uniqueValueIds.some(
        (valueId) =>
          !Number.isInteger(valueId)
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid customization values.",
        },
        { status: 400 }
      );
    }

    if (groupIds.length > 0) {
      const {
        data: validGroups,
        error: groupsError,
      } = await adminClient
        .from("option_groups")
        .select(
          "id, selection_type, is_active"
        )
        .in("id", groupIds);

      if (groupsError) {
        throw groupsError;
      }

      if (
        (validGroups ?? []).length !==
        groupIds.length ||
        (validGroups ?? []).some(
          (group) =>
            !group.is_active
        )
      ) {
        return NextResponse.json(
          {
            error:
              "One or more customization groups are invalid.",
          },
          { status: 400 }
        );
      }

      const groupById =
        new Map(
          (validGroups ?? []).map(
            (group) => [
              group.id,
              group,
            ]
          )
        );

      for (const group of groups) {
        if (
          group.isRequired &&
          group.enabledValueIds
            .length === 0
        ) {
          return NextResponse.json(
            {
              error:
                "Required customization groups need at least one option.",
            },
            { status: 400 }
          );
        }

        if (
          groupById.get(
            group.groupId
          )?.selection_type ===
            "single" &&
          group.enabledValueIds
            .length === 0
        ) {
          return NextResponse.json(
            {
              error:
                "Enabled single-choice groups need at least one option.",
            },
            { status: 400 }
          );
        }
      }
    }

    if (
      uniqueValueIds.length > 0
    ) {
      const {
        data: values,
        error: valuesError,
      } = await adminClient
        .from("option_values")
        .select(
          "id, option_group_id, is_active"
        )
        .in(
          "id",
          uniqueValueIds
        );

      if (valuesError) {
        throw valuesError;
      }

      if (
        (values ?? []).length !==
        uniqueValueIds.length ||
        (values ?? []).some(
          (value) =>
            !value.is_active
        )
      ) {
        return NextResponse.json(
          {
            error:
              "One or more customization values are invalid.",
          },
          { status: 400 }
        );
      }

      const valueById =
        new Map(
          (values ?? []).map(
            (value) => [
              value.id,
              value,
            ]
          )
        );

      for (const group of groups) {
        const invalidValue =
          group.enabledValueIds.some(
            (valueId) =>
              valueById.get(
                valueId
              )
                ?.option_group_id !==
              group.groupId
          );

        if (invalidValue) {
          return NextResponse.json(
            {
              error:
                "A customization option does not belong to its selected group.",
            },
            { status: 400 }
          );
        }
      }
    }

    const {
      data: oldGroups,
      error: oldGroupsError,
    } = await adminClient
      .from(
        "product_option_groups"
      )
      .select(
        "option_group_id, is_required, display_order"
      )
      .eq(
        "product_id",
        productId
      );

    if (oldGroupsError) {
      throw oldGroupsError;
    }

    const {
      data: oldValues,
      error: oldValuesError,
    } = await adminClient
      .from(
        "product_option_values"
      )
      .select(
        "option_value_id"
      )
      .eq(
        "product_id",
        productId
      );

    if (oldValuesError) {
      throw oldValuesError;
    }

    async function restorePreviousState() {
      await adminClient
        .from(
          "product_option_values"
        )
        .delete()
        .eq(
          "product_id",
          productId
        );

      await adminClient
        .from(
          "product_option_groups"
        )
        .delete()
        .eq(
          "product_id",
          productId
        );

      if (
        (oldGroups ?? [])
          .length > 0
      ) {
        await adminClient
          .from(
            "product_option_groups"
          )
          .insert(
            (oldGroups ?? []).map(
              (group) => ({
                product_id:
                  productId,
                option_group_id:
                  group.option_group_id,
                is_required:
                  group.is_required,
                display_order:
                  group.display_order,
              })
            )
          );
      }

      if (
        (oldValues ?? [])
          .length > 0
      ) {
        await adminClient
          .from(
            "product_option_values"
          )
          .insert(
            (oldValues ?? []).map(
              (value) => ({
                product_id:
                  productId,
                option_value_id:
                  value.option_value_id,
              })
            )
          );
      }
    }

    const {
      error: deleteValuesError,
    } = await adminClient
      .from(
        "product_option_values"
      )
      .delete()
      .eq(
        "product_id",
        productId
      );

    if (deleteValuesError) {
      throw deleteValuesError;
    }

    const {
      error: deleteGroupsError,
    } = await adminClient
      .from(
        "product_option_groups"
      )
      .delete()
      .eq(
        "product_id",
        productId
      );

    if (deleteGroupsError) {
      await restorePreviousState();
      throw deleteGroupsError;
    }

    const groupRows =
      groups.map(
        (group, index) => ({
          product_id:
            productId,
          option_group_id:
            group.groupId,
          is_required:
            group.isRequired,
          display_order:
            index + 1,
        })
      );

    if (
      groupRows.length > 0
    ) {
      const {
        error: insertGroupsError,
      } = await adminClient
        .from(
          "product_option_groups"
        )
        .insert(groupRows);

      if (insertGroupsError) {
        await restorePreviousState();
        throw insertGroupsError;
      }
    }

    const valueRows =
      groups.flatMap(
        (group) =>
          group.enabledValueIds.map(
            (valueId) => ({
              product_id:
                productId,
              option_value_id:
                valueId,
            })
          )
      );

    if (
      valueRows.length > 0
    ) {
      const {
        error: insertValuesError,
      } = await adminClient
        .from(
          "product_option_values"
        )
        .insert(valueRows);

      if (insertValuesError) {
        await restorePreviousState();
        throw insertValuesError;
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Could not update product customizations:",
      error
    );

    return NextResponse.json(
      {
        error:
          "We could not update the customization options.",
      },
      { status: 500 }
    );
  }
}
