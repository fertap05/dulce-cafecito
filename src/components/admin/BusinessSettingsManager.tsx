"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type BusinessSettings = {
  id: number;

  business_name: string;
  timezone: string;

  ordering_enabled: boolean;
  pickup_enabled: boolean;

  max_orders_per_slot:
    | number
    | null;

  public_zip_code:
    | string
    | null;

  hero_eyebrow: string;
  hero_tagline: string;
  hero_description: string;

  about_title: string;
  about_paragraph_1: string;
  about_paragraph_2: string;

  about_highlight_title: string;
  about_highlight_text: string;
};

type Props = {
  initialSettings: BusinessSettings;
};

export default function BusinessSettingsManager({
  initialSettings,
}: Props) {
  const router = useRouter();

  const [
    businessName,
    setBusinessName,
  ] = useState(
    initialSettings.business_name
  );

  const [
    timezone,
    setTimezone,
  ] = useState(
    initialSettings.timezone
  );

  const [
    orderingEnabled,
    setOrderingEnabled,
  ] = useState(
    initialSettings.ordering_enabled
  );

  const [
    pickupEnabled,
    setPickupEnabled,
  ] = useState(
    initialSettings.pickup_enabled
  );

  const [
    maxOrdersPerSlot,
    setMaxOrdersPerSlot,
  ] = useState(
    initialSettings
      .max_orders_per_slot
      ?.toString() ?? ""
  );

  const [
    publicZipCode,
    setPublicZipCode,
  ] = useState(
    initialSettings
      .public_zip_code ?? ""
  );

  const [
    heroEyebrow,
    setHeroEyebrow,
  ] = useState(
    initialSettings.hero_eyebrow
  );

  const [
    heroTagline,
    setHeroTagline,
  ] = useState(
    initialSettings.hero_tagline
  );

  const [
    heroDescription,
    setHeroDescription,
  ] = useState(
    initialSettings.hero_description
  );

  const [
    aboutTitle,
    setAboutTitle,
  ] = useState(
    initialSettings.about_title
  );

  const [
    aboutParagraph1,
    setAboutParagraph1,
  ] = useState(
    initialSettings.about_paragraph_1
  );

  const [
    aboutParagraph2,
    setAboutParagraph2,
  ] = useState(
    initialSettings.about_paragraph_2
  );

  const [
    aboutHighlightTitle,
    setAboutHighlightTitle,
  ] = useState(
    initialSettings
      .about_highlight_title
  );

  const [
    aboutHighlightText,
    setAboutHighlightText,
  ] = useState(
    initialSettings
      .about_highlight_text
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  async function saveSettings() {
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response =
        await fetch(
          "/api/admin/settings",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              businessName,
              timezone,

              orderingEnabled,
              pickupEnabled,

              maxOrdersPerSlot:
                maxOrdersPerSlot
                  .trim() === ""
                  ? null
                  : Number(
                      maxOrdersPerSlot
                    ),

              publicZipCode:
                publicZipCode
                  .trim() || null,

              heroEyebrow,
              heroTagline,
              heroDescription,

              aboutTitle,
              aboutParagraph1,
              aboutParagraph2,

              aboutHighlightTitle,
              aboutHighlightText,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.error ??
            "Could not save business settings."
        );

        return;
      }

      setSuccessMessage(
        "Settings saved."
      );

      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong while saving settings."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
      {/* Business Information */}
      <section className="overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white">
        <div className="border-b border-[#ecd6d6] px-6 py-5">
          <h2 className="text-xl font-semibold">
            Business Information
          </h2>

          <p className="mt-1 text-sm text-[#94716b]">
            General information used
            throughout Dulce Cafecito.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label
              htmlFor="business-name"
              className="text-sm font-medium"
            >
              Business Name
            </label>

            <input
              id="business-name"
              type="text"
              maxLength={100}
              value={businessName}
              onChange={(event) =>
                setBusinessName(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
            />
          </div>

          <div>
            <label
              htmlFor="public-zip"
              className="text-sm font-medium"
            >
              Public ZIP Code
            </label>

            <p className="mt-1 text-sm text-[#94716b]">
              Used to identify the general
              pickup area without publishing
              the full address.
            </p>

            <input
              id="public-zip"
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder="Example: 38104"
              value={publicZipCode}
              onChange={(event) =>
                setPublicZipCode(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
            />
          </div>

          <div>
            <label
              htmlFor="timezone"
              className="text-sm font-medium"
            >
              Time Zone
            </label>

            <p className="mt-1 text-sm text-[#94716b]">
              Controls how pickup dates and
              times are calculated.
            </p>

            <select
              id="timezone"
              value={timezone}
              onChange={(event) =>
                setTimezone(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
            >
              <option value="America/Chicago">
                Central Time —
                America/Chicago
              </option>

              <option value="America/New_York">
                Eastern Time —
                America/New_York
              </option>

              <option value="America/Denver">
                Mountain Time —
                America/Denver
              </option>

              <option value="America/Los_Angeles">
                Pacific Time —
                America/Los_Angeles
              </option>
            </select>
          </div>
        </div>
      </section>

      {/* Ordering Controls */}
      <section className="overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white">
        <div className="border-b border-[#ecd6d6] px-6 py-5">
          <h2 className="text-xl font-semibold">
            Ordering Controls
          </h2>

          <p className="mt-1 text-sm text-[#94716b]">
            Quickly control whether customers
            can place orders.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between gap-6 border-b border-[#f0dddd] pb-6">
            <div>
              <p className="font-medium">
                Online Ordering
              </p>

              <p className="mt-1 text-sm text-[#94716b]">
                Turn this off to temporarily
                pause new orders.
              </p>
            </div>

            <input
              type="checkbox"
              checked={orderingEnabled}
              onChange={(event) =>
                setOrderingEnabled(
                  event.target.checked
                )
              }
              className="h-5 w-5"
            />
          </div>

          <div className="flex items-center justify-between gap-6 border-b border-[#f0dddd] pb-6">
            <div>
              <p className="font-medium">
                Pickup Enabled
              </p>

              <p className="mt-1 text-sm text-[#94716b]">
                Disable pickup ordering without
                changing normal business hours.
              </p>
            </div>

            <input
              type="checkbox"
              checked={pickupEnabled}
              onChange={(event) =>
                setPickupEnabled(
                  event.target.checked
                )
              }
              className="h-5 w-5"
            />
          </div>

          <div>
            <label
              htmlFor="max-orders"
              className="font-medium"
            >
              Maximum Orders Per Pickup Slot
            </label>

            <p className="mt-1 text-sm text-[#94716b]">
              Leave blank for no limit.
            </p>

            <input
              id="max-orders"
              type="number"
              min={1}
              max={1000}
              value={maxOrdersPerSlot}
              onChange={(event) =>
                setMaxOrdersPerSlot(
                  event.target.value
                )
              }
              placeholder="No limit"
              className="mt-3 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
            />
          </div>
        </div>
      </section>

      {/* Website Content */}
      <section className="overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white xl:col-span-2">
        <div className="border-b border-[#ecd6d6] px-6 py-5">
          <h2 className="text-xl font-semibold">
            Website Content
          </h2>

          <p className="mt-1 text-sm text-[#94716b]">
            Edit the text customers see on
            the Dulce Cafecito homepage.
          </p>
        </div>

        <div className="grid gap-10 p-6 lg:grid-cols-2">
          {/* Hero */}
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#b76e79]">
                Homepage Hero
              </p>

              <h3 className="mt-2 text-lg font-semibold">
                Main Section
              </h3>
            </div>

            <div>
              <label
                htmlFor="hero-eyebrow"
                className="text-sm font-medium"
              >
                Small Heading
              </label>

              <p className="mt-1 text-sm text-[#94716b]">
                The small text above
                &quot;Dulce Cafecito&quot;.
              </p>

              <input
                id="hero-eyebrow"
                type="text"
                maxLength={100}
                value={heroEyebrow}
                onChange={(event) =>
                  setHeroEyebrow(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
              />
            </div>

            <div>
              <label
                htmlFor="hero-tagline"
                className="text-sm font-medium"
              >
                Tagline
              </label>

              <p className="mt-1 text-sm text-[#94716b]">
                The main sentence below the
                business name.
              </p>

              <input
                id="hero-tagline"
                type="text"
                maxLength={160}
                value={heroTagline}
                onChange={(event) =>
                  setHeroTagline(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
              />
            </div>

            <div>
              <label
                htmlFor="hero-description"
                className="text-sm font-medium"
              >
                Short Description
              </label>

              <textarea
                id="hero-description"
                rows={3}
                maxLength={250}
                value={heroDescription}
                onChange={(event) =>
                  setHeroDescription(
                    event.target.value
                  )
                }
                className="mt-2 w-full resize-y rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
              />
            </div>
          </div>

          {/* About */}
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#b76e79]">
                About Us
              </p>

              <h3 className="mt-2 text-lg font-semibold">
                About Section
              </h3>
            </div>

            <div>
              <label
                htmlFor="about-title"
                className="text-sm font-medium"
              >
                About Title
              </label>

              <input
                id="about-title"
                type="text"
                maxLength={160}
                value={aboutTitle}
                onChange={(event) =>
                  setAboutTitle(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
              />
            </div>

            <div>
              <label
                htmlFor="about-paragraph-1"
                className="text-sm font-medium"
              >
                First Paragraph
              </label>

              <textarea
                id="about-paragraph-1"
                rows={4}
                maxLength={1000}
                value={aboutParagraph1}
                onChange={(event) =>
                  setAboutParagraph1(
                    event.target.value
                  )
                }
                className="mt-2 w-full resize-y rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
              />
            </div>

            <div>
              <label
                htmlFor="about-paragraph-2"
                className="text-sm font-medium"
              >
                Second Paragraph
              </label>

              <textarea
                id="about-paragraph-2"
                rows={4}
                maxLength={1000}
                value={aboutParagraph2}
                onChange={(event) =>
                  setAboutParagraph2(
                    event.target.value
                  )
                }
                className="mt-2 w-full resize-y rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
              />
            </div>

            <div>
              <label
                htmlFor="about-highlight-title"
                className="text-sm font-medium"
              >
                Highlight Title
              </label>

              <p className="mt-1 text-sm text-[#94716b]">
                The title inside the card on
                the right side of About Us.
              </p>

              <input
                id="about-highlight-title"
                type="text"
                maxLength={160}
                value={aboutHighlightTitle}
                onChange={(event) =>
                  setAboutHighlightTitle(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
              />
            </div>

            <div>
              <label
                htmlFor="about-highlight-text"
                className="text-sm font-medium"
              >
                Highlight Description
              </label>

              <textarea
                id="about-highlight-text"
                rows={4}
                maxLength={1000}
                value={aboutHighlightText}
                onChange={(event) =>
                  setAboutHighlightText(
                    event.target.value
                  )
                }
                className="mt-2 w-full resize-y rounded-2xl border border-[#ecd6d6] px-4 py-3 outline-none focus:border-[#8e4d56]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="xl:col-span-2">
        {errorMessage && (
          <div className="mb-4 rounded-2xl bg-[#f9e5e8] p-4 text-sm text-[#8e4d56]">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-2xl bg-[#edf6ed] p-4 text-sm text-[#426b42]">
            {successMessage}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={saveSettings}
            className="rounded-full bg-[#8e4d56] px-7 py-3 font-medium text-white transition hover:bg-[#763d46] disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}