import WebsiteMediaManager from "@/components/admin/WebsiteMediaManager";
import BusinessSettingsManager from "@/components/admin/BusinessSettingsManager";
import PrivatePickupSettingsManager from "@/components/admin/PrivatePickupSettingsManager";
import PushNotificationSettings from "@/components/admin/PushNotificationSettings";

import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

type SettingsRow = {
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

type PrivateSettingsRow = {
  id: number;

  pickup_address_line1:
    | string
    | null;

  pickup_address_line2:
    | string
    | null;

  pickup_city:
    | string
    | null;

  pickup_state:
    | string
    | null;

  pickup_zip_code:
    | string
    | null;

  pickup_instructions:
    | string
    | null;
};

export default async function AdminSettingsPage() {
  const supabase =
    createAdminClient();

  const [
    {
      data: settingsData,
      error: settingsError,
    },
    {
      data: privateData,
      error: privateError,
    },
  ] = await Promise.all([
    /*
     * Public/general business settings.
     */
    supabase
      .from(
        "business_settings"
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
        logo_image_path,
        hero_image_path,
        about_image_path
      `)
      .eq("id", 1)
      .maybeSingle(),

    /*
     * Private pickup information.
     */
    supabase
      .from(
        "private_business_settings"
      )
      .select(`
        id,
        pickup_address_line1,
        pickup_address_line2,
        pickup_city,
        pickup_state,
        pickup_zip_code,
        pickup_instructions
      `)
      .eq("id", 1)
      .maybeSingle(),
  ]);

  if (
    settingsError ||
    privateError ||
    !settingsData
  ) {
    console.error(
      "Could not load admin settings:",
      {
        settingsError,
        privateError,
      }
    );

    return (
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#b76e79]">
          Dulce Cafecito Admin
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          Settings
        </h1>

        <div className="mt-8 rounded-3xl border border-[#ecd6d6] bg-white p-6">
          <p className="text-[#8e4d56]">
            Could not load business settings.
          </p>
        </div>
      </div>
    );
  }

  const privateSettings: PrivateSettingsRow =
    privateData ?? {
      id: 1,

      pickup_address_line1:
        null,

      pickup_address_line2:
        null,

      pickup_city:
        null,

      pickup_state:
        null,

      pickup_zip_code:
        null,

      pickup_instructions:
        null,
    };

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-[#b76e79]">
          Dulce Cafecito Admin
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          Settings
        </h1>

        <p className="mt-2 text-[#76534e]">
          Manage general business,
          website, ordering, pickup,
          and notification settings.
        </p>
      </div>

      <BusinessSettingsManager
        initialSettings={
          settingsData as SettingsRow
        }
      />

      <WebsiteMediaManager
  initialMedia={{
    logo_image_path:
      settingsData.logo_image_path,

    hero_image_path:
      settingsData.hero_image_path,

    about_image_path:
      settingsData.about_image_path,
  }}
/>

      <PrivatePickupSettingsManager
        initialSettings={
          privateSettings
        }
      />

      <PushNotificationSettings />
    </div>
  );
}