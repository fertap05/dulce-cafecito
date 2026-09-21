const WEBSITE_MEDIA_BUCKET =
  "dulce-cafecito-media";

export function getWebsiteMediaUrl(
  path: string | null | undefined
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

  return `${supabaseUrl}/storage/v1/object/public/${WEBSITE_MEDIA_BUCKET}/${encodedPath}`;
}
