"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type OptionValue = {
  id: number;
  option_group_id: number;
  name: string;
  price_delta_cents: number;
  display_order: number;
  is_active: boolean;
};

type OptionGroup = {
  id: number;
  name: string;
  selection_type:
    | "single"
    | "multiple";
  display_order: number;
  is_active: boolean;
  values: OptionValue[];
};

type Props = {
  groups: OptionGroup[];
};

export default function CustomizationManager({
  groups,
}: Props) {
  const router = useRouter();

  const [
    showCreateGroup,
    setShowCreateGroup,
  ] = useState(false);

  const [
    createGroupName,
    setCreateGroupName,
  ] = useState("");

  const [
    createSelectionType,
    setCreateSelectionType,
  ] = useState<
    "single" | "multiple"
  >("single");

  const [
    addingValueForGroupId,
    setAddingValueForGroupId,
  ] = useState<number | null>(
    null
  );

  const [
    newValueName,
    setNewValueName,
  ] = useState("");

  const [
    newValuePrice,
    setNewValuePrice,
  ] = useState("0.00");

  const [
    editingGroupId,
    setEditingGroupId,
  ] = useState<number | null>(
    null
  );

  const [
    editGroupName,
    setEditGroupName,
  ] = useState("");

  const [
    editSelectionType,
    setEditSelectionType,
  ] = useState<
    "single" | "multiple"
  >("single");

  const [
    editGroupActive,
    setEditGroupActive,
  ] = useState(true);

  const [
    editingValueId,
    setEditingValueId,
  ] = useState<number | null>(
    null
  );

  const [
    editValueName,
    setEditValueName,
  ] = useState("");

  const [
    editValuePrice,
    setEditValuePrice,
  ] = useState("0.00");

  const [
    editValueActive,
    setEditValueActive,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

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

  async function createGroup() {
    setErrorMessage("");

    if (!createGroupName.trim()) {
      setErrorMessage(
        "Enter a customization group name."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/admin/customizations/groups",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name:
              createGroupName.trim(),
            selectionType:
              createSelectionType,
          }),
        }
      );

      if (!response.ok) {
        setErrorMessage(
          await readError(response)
        );
        return;
      }

      setCreateGroupName("");
      setCreateSelectionType(
        "single"
      );
      setShowCreateGroup(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function createValue(
    groupId: number
  ) {
    setErrorMessage("");

    const numericPrice =
      Number(newValuePrice);

    if (!newValueName.trim()) {
      setErrorMessage(
        "Enter an option name."
      );
      return;
    }

    if (
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      setErrorMessage(
        "Enter a valid option price."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/admin/customizations/values",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            groupId,
            name:
              newValueName.trim(),
            priceDeltaCents:
              Math.round(
                numericPrice * 100
              ),
          }),
        }
      );

      if (!response.ok) {
        setErrorMessage(
          await readError(response)
        );
        return;
      }

      setNewValueName("");
      setNewValuePrice("0.00");
      setAddingValueForGroupId(
        null
      );
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function startEditGroup(
    group: OptionGroup
  ) {
    setErrorMessage("");
    setEditingGroupId(group.id);
    setEditGroupName(group.name);
    setEditSelectionType(
      group.selection_type
    );
    setEditGroupActive(
      group.is_active
    );
  }

  async function saveGroup(
    groupId: number
  ) {
    setErrorMessage("");

    if (!editGroupName.trim()) {
      setErrorMessage(
        "Enter a customization group name."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/customizations/groups/${groupId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name:
              editGroupName.trim(),
            selectionType:
              editSelectionType,
            isActive:
              editGroupActive,
          }),
        }
      );

      if (!response.ok) {
        setErrorMessage(
          await readError(response)
        );
        return;
      }

      setEditingGroupId(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function startEditValue(
    value: OptionValue
  ) {
    setErrorMessage("");
    setEditingValueId(value.id);
    setEditValueName(value.name);
    setEditValuePrice(
      (
        value.price_delta_cents /
        100
      ).toFixed(2)
    );
    setEditValueActive(
      value.is_active
    );
  }

  async function saveValue(
    valueId: number
  ) {
    setErrorMessage("");

    const numericPrice =
      Number(editValuePrice);

    if (!editValueName.trim()) {
      setErrorMessage(
        "Enter an option name."
      );
      return;
    }

    if (
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      setErrorMessage(
        "Enter a valid option price."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/customizations/values/${valueId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name:
              editValueName.trim(),
            priceDeltaCents:
              Math.round(
                numericPrice * 100
              ),
            isActive:
              editValueActive,
          }),
        }
      );

      if (!response.ok) {
        setErrorMessage(
          await readError(response)
        );
        return;
      }

      setEditingValueId(null);
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
            Customization Library
          </h2>

          <p className="mt-1 text-sm text-[#94716b]">
            Create reusable groups like Milk, Sweetness, Toppings, Size, or Cold Foam.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCreateGroup(
              (current) =>
                !current
            );
            setErrorMessage("");
          }}
          className="rounded-full bg-[#8e4d56] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#763d46]"
        >
          + Add Customization Group
        </button>
      </div>

      {showCreateGroup && (
        <div className="border-b border-[#ecd6d6] bg-[#fffaf8] p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
            <div>
              <label className="text-sm font-medium">
                Group Name
              </label>

              <input
                value={createGroupName}
                onChange={(event) =>
                  setCreateGroupName(
                    event.target.value
                  )
                }
                placeholder="Example: Sweetness"
                className="mt-2 w-full rounded-xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Customer Choice
              </label>

              <select
                value={
                  createSelectionType
                }
                onChange={(event) =>
                  setCreateSelectionType(
                    event.target
                      .value as
                      | "single"
                      | "multiple"
                  )
                }
                className="mt-2 w-full rounded-xl border border-[#ecd6d6] bg-white px-4 py-3 outline-none focus:border-[#8e4d56]"
              >
                <option value="single">
                  Choose one
                </option>
                <option value="multiple">
                  Choose multiple
                </option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={
                  createGroup
                }
                className="rounded-full bg-[#8e4d56] px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                Save
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setShowCreateGroup(
                    false
                  )
                }
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

      <div className="divide-y divide-[#f0dddd]">
        {groups.map((group) => (
          <div
            key={group.id}
            className="p-6"
          >
            {editingGroupId ===
            group.id ? (
              <div className="grid gap-4 lg:grid-cols-[1fr_180px_150px_auto]">
                <input
                  value={
                    editGroupName
                  }
                  onChange={(event) =>
                    setEditGroupName(
                      event.target.value
                    )
                  }
                  className="rounded-xl border border-[#ecd6d6] px-4 py-2.5 outline-none focus:border-[#8e4d56]"
                />

                <select
                  value={
                    editSelectionType
                  }
                  onChange={(event) =>
                    setEditSelectionType(
                      event.target
                        .value as
                        | "single"
                        | "multiple"
                    )
                  }
                  className="rounded-xl border border-[#ecd6d6] bg-white px-4 py-2.5 outline-none focus:border-[#8e4d56]"
                >
                  <option value="single">
                    Choose one
                  </option>
                  <option value="multiple">
                    Choose multiple
                  </option>
                </select>

                <label className="flex items-center gap-3 rounded-xl border border-[#ecd6d6] px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={
                      editGroupActive
                    }
                    onChange={(event) =>
                      setEditGroupActive(
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
                    disabled={saving}
                    onClick={() =>
                      saveGroup(
                        group.id
                      )
                    }
                    className="rounded-full bg-[#8e4d56] px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingGroupId(
                        null
                      )
                    }
                    className="rounded-full border border-[#8e4d56] px-4 py-2 text-xs font-medium text-[#8e4d56]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold">
                      {group.name}
                    </h3>

                    <span className="rounded-full bg-[#fff1f2] px-3 py-1 text-xs text-[#8e4d56]">
                      {group.selection_type ===
                      "single"
                        ? "Choose one"
                        : "Choose multiple"}
                    </span>

                    <span
                      className={
                        group.is_active
                          ? "rounded-full bg-[#edf6ed] px-3 py-1 text-xs text-[#426b42]"
                          : "rounded-full bg-[#f9e5e8] px-3 py-1 text-xs text-[#8e4d56]"
                      }
                    >
                      {group.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-[#94716b]">
                    Add options below, then enable this group on whichever drinks should use it.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      startEditGroup(
                        group
                      )
                    }
                    className="rounded-full border border-[#8e4d56] px-4 py-2 text-xs font-medium text-[#8e4d56]"
                  >
                    Edit Group
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAddingValueForGroupId(
                        group.id
                      );
                      setNewValueName(
                        ""
                      );
                      setNewValuePrice(
                        "0.00"
                      );
                      setErrorMessage(
                        ""
                      );
                    }}
                    className="rounded-full bg-[#8e4d56] px-4 py-2 text-xs font-medium text-white"
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            )}

            {addingValueForGroupId ===
              group.id && (
              <div className="mt-5 rounded-2xl border border-[#ecd6d6] bg-[#fffaf8] p-4">
                <div className="grid gap-4 md:grid-cols-[1fr_160px_auto]">
                  <div>
                    <label className="text-xs font-medium">
                      Option Name
                    </label>
                    <input
                      value={
                        newValueName
                      }
                      onChange={(
                        event
                      ) =>
                        setNewValueName(
                          event.target
                            .value
                        )
                      }
                      placeholder="Example: Oat Milk"
                      className="mt-2 w-full rounded-xl border border-[#ecd6d6] px-4 py-2.5 outline-none focus:border-[#8e4d56]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium">
                      Extra Price
                    </label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#76534e]">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          newValuePrice
                        }
                        onChange={(
                          event
                        ) =>
                          setNewValuePrice(
                            event.target
                              .value
                          )
                        }
                        className="w-full rounded-xl border border-[#ecd6d6] py-2.5 pl-7 pr-3 outline-none focus:border-[#8e4d56]"
                      />
                    </div>
                  </div>

                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        createValue(
                          group.id
                        )
                      }
                      className="rounded-full bg-[#8e4d56] px-4 py-2.5 text-xs font-medium text-white disabled:opacity-50"
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setAddingValueForGroupId(
                          null
                        )
                      }
                      className="rounded-full border border-[#8e4d56] px-4 py-2.5 text-xs font-medium text-[#8e4d56]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {group.values.length ===
              0 ? (
                <p className="text-sm text-[#94716b]">
                  No options yet.
                </p>
              ) : (
                group.values.map(
                  (value) => (
                    <div
                      key={value.id}
                      className="rounded-2xl border border-[#ecd6d6] p-4"
                    >
                      {editingValueId ===
                      value.id ? (
                        <div className="space-y-3">
                          <input
                            value={
                              editValueName
                            }
                            onChange={(
                              event
                            ) =>
                              setEditValueName(
                                event.target
                                  .value
                              )
                            }
                            className="w-full rounded-xl border border-[#ecd6d6] px-3 py-2 outline-none focus:border-[#8e4d56]"
                          />

                          <div className="flex gap-3">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#76534e]">
                                $
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  editValuePrice
                                }
                                onChange={(
                                  event
                                ) =>
                                  setEditValuePrice(
                                    event
                                      .target
                                      .value
                                  )
                                }
                                className="w-full rounded-xl border border-[#ecd6d6] py-2 pl-7 pr-3 outline-none focus:border-[#8e4d56]"
                              />
                            </div>

                            <label className="flex items-center gap-2 rounded-xl border border-[#ecd6d6] px-3">
                              <input
                                type="checkbox"
                                checked={
                                  editValueActive
                                }
                                onChange={(
                                  event
                                ) =>
                                  setEditValueActive(
                                    event.target
                                      .checked
                                  )
                                }
                              />
                              <span className="text-xs">
                                Active
                              </span>
                            </label>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={
                                saving
                              }
                              onClick={() =>
                                saveValue(
                                  value.id
                                )
                              }
                              className="rounded-full bg-[#8e4d56] px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setEditingValueId(
                                  null
                                )
                              }
                              className="rounded-full border border-[#8e4d56] px-4 py-2 text-xs font-medium text-[#8e4d56]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">
                              {
                                value.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-[#94716b]">
                              {value.price_delta_cents >
                              0
                                ? `+$${(
                                    value.price_delta_cents /
                                    100
                                  ).toFixed(
                                    2
                                  )}`
                                : "No extra charge"}
                              {" · "}
                              {value.is_active
                                ? "Active"
                                : "Inactive"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              startEditValue(
                                value
                              )
                            }
                            className="rounded-full border border-[#8e4d56] px-3 py-1.5 text-xs font-medium text-[#8e4d56]"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  )
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
