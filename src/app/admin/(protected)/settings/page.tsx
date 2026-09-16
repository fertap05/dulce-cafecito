import BusinessSettingsManager from "@/components/admin/BusinessSettingsManager";
import PrivatePickupSettingsManager from "@/components/admin/PrivatePickupSettingsManager";
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
        public_zip_code
      `)
      .eq("id", 1)
      .maybeSingle(),

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
          ordering, and pickup settings.
        </p>
      </div>

      <BusinessSettingsManager
        initialSettings={
          settingsData as SettingsRow
        }
      />

      <PrivatePickupSettingsManager
        initialSettings={
          privateSettings
        }
      />
    </div>
  );
}