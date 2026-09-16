"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Category = {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
  productCount: number;
};

type CategoryManagerProps = {
  categories: Category[];
};

export default function CategoryManager({
  categories,
}: CategoryManagerProps) {
  const router = useRouter();

  const [showCreate, setShowCreate] =
    useState(false);

  const [createName, setCreateName] =
    useState("");

  const [
    createDisplayOrder,
    setCreateDisplayOrder,
  ] = useState(
    Math.max(
      0,
      ...categories.map(
        (category) =>
          category.display_order
      )
    ) + 1
  );

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [editName, setEditName] =
    useState("");

  const [
    editDisplayOrder,
    setEditDisplayOrder,
  ] = useState(0);

  const [editActive, setEditActive] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  async function readError(
    response: Response
  ) {
    const data = await response
      .json()
      .catch(() => null);

    return (
      data?.error ??
      "Something went wrong."
    );
  }

  async function createCategory() {
    setErrorMessage("");

    if (!createName.trim()) {
      setErrorMessage(
        "Enter a category name."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/admin/categories",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: createName,
            displayOrder:
              createDisplayOrder,
            isActive: true,
          }),
        }
      );

      if (!response.ok) {
        setErrorMessage(
          await readError(response)
        );
        return;
      }

      setCreateName("");
      setShowCreate(false);

      setCreateDisplayOrder(
        createDisplayOrder + 1
      );

      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function startEditing(
    category: Category
  ) {
    setErrorMessage("");

    setEditingId(category.id);
    setEditName(category.name);

    setEditDisplayOrder(
      category.display_order
    );

    setEditActive(
      category.is_active
    );
  }

  function cancelEditing() {
    setEditingId(null);
    setErrorMessage("");
  }

  async function saveCategory(
    categoryId: number
  ) {
    setErrorMessage("");

    if (!editName.trim()) {
      setErrorMessage(
        "Enter a category name."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/categories/${categoryId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: editName,
            displayOrder:
              editDisplayOrder,
            isActive: editActive,
          }),
        }
      );

      if (!response.ok) {
        setErrorMessage(
          await readError(response)
        );
        return;
      }

      setEditingId(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(
    category: Category
  ) {
    setErrorMessage("");

    const confirmed =
      window.confirm(
        `Delete "${category.name}"?`
      );

    if (!confirmed) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/categories/${category.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        setErrorMessage(
          await readError(response)
        );
        return;
      }

      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ecd6d6] px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold">
            Categories
          </h2>

          <p className="mt-1 text-sm text-[#94716b]">
            Organize products into menu
            sections.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCreate(
              (current) => !current
            );

            setErrorMessage("");
          }}
          className="rounded-full bg-[#8e4d56] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#763d46]"
        >
          + Add Category
        </button>
      </div>

      {showCreate && (
        <div className="border-b border-[#ecd6d6] bg-[#fffaf8] p-6">
          <h3 className="font-semibold">
            New Category
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_160px_auto]">
            <div>
              <label className="text-sm font-medium">
                Name
              </label>

              <input
                value={createName}
                onChange={(event) =>
                  setCreateName(
                    event.target.value
                  )
                }
                placeholder="Example: Snacks"
                className="mt-2 w-full rounded-xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Display Order
              </label>

              <input
                type="number"
                min={0}
                value={
                  createDisplayOrder
                }
                onChange={(event) =>
                  setCreateDisplayOrder(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="mt-2 w-full rounded-xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={
                  createCategory
                }
                className="rounded-full bg-[#8e4d56] px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setShowCreate(false);
                  setErrorMessage("");
                }}
                className="rounded-full border border-[#8e4d56] px-5 py-3 text-sm font-medium text-[#8e4d56]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="border-b border-[#ecd6d6] bg-[#f9e5e8] px-6 py-4 text-sm text-[#8e4d56]">
          {errorMessage}
        </div>
      )}

      {categories.length === 0 ? (
        <div className="p-8 text-center text-[#94716b]">
          No categories yet.
        </div>
      ) : (
        <div>
          {categories.map(
            (category) => (
              <div
                key={category.id}
                className="border-b border-[#f0dddd] px-6 py-5 last:border-b-0"
              >
                {editingId ===
                category.id ? (
                  <div className="grid gap-4 lg:grid-cols-[1fr_140px_170px_auto]">
                    <input
                      value={editName}
                      onChange={(event) =>
                        setEditName(
                          event.target
                            .value
                        )
                      }
                      className="rounded-xl border border-[#ecd6d6] px-4 py-2.5 outline-none focus:border-[#8e4d56]"
                    />

                    <input
                      type="number"
                      min={0}
                      value={
                        editDisplayOrder
                      }
                      onChange={(
                        event
                      ) =>
                        setEditDisplayOrder(
                          Number(
                            event.target
                              .value
                          )
                        )
                      }
                      className="rounded-xl border border-[#ecd6d6] px-4 py-2.5 outline-none focus:border-[#8e4d56]"
                    />

                    <label className="flex items-center gap-3 rounded-xl border border-[#ecd6d6] px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={
                          editActive
                        }
                        onChange={(
                          event
                        ) =>
                          setEditActive(
                            event.target
                              .checked
                          )
                        }
                      />

                      Active
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={
                          saving
                        }
                        onClick={() =>
                          saveCategory(
                            category.id
                          )
                        }
                        className="rounded-full bg-[#8e4d56] px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        disabled={
                          saving
                        }
                        onClick={
                          cancelEditing
                        }
                        className="rounded-full border border-[#8e4d56] px-4 py-2 text-xs font-medium text-[#8e4d56]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-semibold">
                          {
                            category.name
                          }
                        </p>

                        {category.is_active ? (
                          <span className="rounded-full bg-[#edf6ed] px-3 py-1 text-xs text-[#426b42]">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#f9e5e8] px-3 py-1 text-xs text-[#8e4d56]">
                            Inactive
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-[#94716b]">
                        {
                          category.productCount
                        }{" "}
                        {category.productCount ===
                        1
                          ? "product"
                          : "products"}{" "}
                        · Display order{" "}
                        {
                          category.display_order
                        }
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          startEditing(
                            category
                          )
                        }
                        className="rounded-full border border-[#8e4d56] px-4 py-2 text-xs font-medium text-[#8e4d56]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={
                          saving
                        }
                        onClick={() =>
                          deleteCategory(
                            category
                          )
                        }
                        className="rounded-full border border-[#c96868] px-4 py-2 text-xs font-medium text-[#a34c4c] disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}