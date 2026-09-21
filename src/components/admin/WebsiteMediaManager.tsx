"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AssetType =
  | "logo"
  | "hero"
  | "about";

type MediaState = {
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

type Props = {
  initialMedia:
    MediaState;
};

type MediaCardProps = {
  assetType:
    AssetType;

  title:
    string;

  description:
    string;

  path:
    string | null;

  loading:
    AssetType | null;

  onUpload: (
    assetType: AssetType,
    file: File
  ) => Promise<void>;

  onRemove: (
    assetType: AssetType
  ) => Promise<void>;
};

const BUCKET_NAME =
  "dulce-cafecito-media";

function getPublicUrl(
  path: string | null
) {
  if (!path) {
    return null;
  }

  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  const encodedPath =
    path
      .split("/")
      .map((part) =>
        encodeURIComponent(part)
      )
      .join("/");

  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${encodedPath}`;
}

function getMediaColumn(
  assetType: AssetType
): keyof MediaState {
  if (
    assetType === "logo"
  ) {
    return "logo_image_path";
  }

  if (
    assetType === "hero"
  ) {
    return "hero_image_path";
  }

  return "about_image_path";
}

function MediaCard({
  assetType,
  title,
  description,
  path,
  loading,
  onUpload,
  onRemove,
}: MediaCardProps) {
  const imageUrl =
    getPublicUrl(path);

  const inputId =
    `website-image-${assetType}`;

  const isBusy =
    loading !== null;

  const thisCardLoading =
    loading === assetType;

  return (
    <div className="overflow-hidden rounded-3xl border border-[#ecd6d6] bg-[#fff8f4]">
      <div
        className="flex h-56 items-center justify-center bg-[#f9e5e8] bg-contain bg-center bg-no-repeat"
        style={
          imageUrl
            ? {
                backgroundImage:
                  `url("${imageUrl}")`,
              }
            : undefined
        }
      >
        {!imageUrl && (
          <div className="text-center">
            <p className="text-5xl">
              🖼️
            </p>

            <p className="mt-3 text-sm text-[#94716b]">
              No image uploaded
            </p>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-semibold">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-[#94716b]">
          {description}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={isBusy}
            onChange={(event) => {
              const file =
                event
                  .target
                  .files?.[0];

              if (file) {
                void onUpload(
                  assetType,
                  file
                );
              }

              event.currentTarget.value =
                "";
            }}
          />

          <label
            htmlFor={inputId}
            className={`rounded-full px-5 py-2.5 text-sm font-medium text-white transition ${
              isBusy
                ? "cursor-not-allowed bg-[#b98a90] opacity-60"
                : "cursor-pointer bg-[#8e4d56] hover:bg-[#763d46]"
            }`}
          >
            {thisCardLoading
              ? "Working..."
              : imageUrl
                ? "Replace Image"
                : "Upload Image"}
          </label>

          {imageUrl && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() =>
                void onRemove(
                  assetType
                )
              }
              className="rounded-full border border-[#8e4d56] px-5 py-2.5 text-sm font-medium text-[#8e4d56] transition hover:bg-[#fff1f2] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {thisCardLoading
                ? "Working..."
                : "Remove"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WebsiteMediaManager({
  initialMedia,
}: Props) {
  const router =
    useRouter();

  const [
    media,
    setMedia,
  ] = useState(
    initialMedia
  );

  const [
    loading,
    setLoading,
  ] = useState<
    AssetType | null
  >(null);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  async function uploadImage(
    assetType: AssetType,
    file: File
  ) {
    setLoading(
      assetType
    );

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const formData =
        new FormData();

      formData.append(
        "assetType",
        assetType
      );

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          "/api/admin/website-media",
          {
            method:
              "POST",

            body:
              formData,
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Could not upload image."
        );
      }

      const column =
        getMediaColumn(
          assetType
        );

      setMedia(
        (current) => ({
          ...current,

          [column]:
            result.path,
        })
      );

      setSuccessMessage(
        "Image saved successfully."
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not upload image."
      );
    } finally {
      setLoading(null);
    }
  }

  async function removeImage(
    assetType: AssetType
  ) {
    setLoading(
      assetType
    );

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response =
        await fetch(
          "/api/admin/website-media",
          {
            method:
              "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                assetType,
              }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Could not remove image."
        );
      }

      const column =
        getMediaColumn(
          assetType
        );

      setMedia(
        (current) => ({
          ...current,

          [column]:
            null,
        })
      );

      setSuccessMessage(
        "Image removed."
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not remove image."
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white">
      <div className="border-b border-[#ecd6d6] px-6 py-5">
        <h2 className="text-xl font-semibold">
          Website Appearance
        </h2>

        <p className="mt-1 text-sm text-[#94716b]">
          Manage the images customers see
          throughout the Dulce Cafecito
          website.
        </p>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <MediaCard
          assetType="logo"
          title="Business Logo"
          description="Used for Dulce Cafecito branding and navigation."
          path={
            media
              .logo_image_path
          }
          loading={loading}
          onUpload={
            uploadImage
          }
          onRemove={
            removeImage
          }
        />

        <MediaCard
          assetType="hero"
          title="Homepage Hero Image"
          description="The main featured image shown near the top of the homepage."
          path={
            media
              .hero_image_path
          }
          loading={loading}
          onUpload={
            uploadImage
          }
          onRemove={
            removeImage
          }
        />

        <MediaCard
          assetType="about"
          title="About Us Image"
          description="An image used in the homepage About Us section."
          path={
            media
              .about_image_path
          }
          loading={loading}
          onUpload={
            uploadImage
          }
          onRemove={
            removeImage
          }
        />
      </div>

      {(errorMessage ||
        successMessage) && (
        <div className="px-6 pb-6">
          {errorMessage && (
            <div className="rounded-2xl bg-[#f9e5e8] p-4 text-sm text-[#8e4d56]">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-2xl bg-[#edf6ed] p-4 text-sm text-[#426b42]">
              {successMessage}
            </div>
          )}
        </div>
      )}
    </section>
  );
}