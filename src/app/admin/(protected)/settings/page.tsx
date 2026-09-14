import BusinessSettingsManager from "@/components/admin/BusinessSettingsManager";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SettingsRow = {
  id: number;
  business_name: string;
  timezone: string;
  ordering_enabled: boolean;
  pickup_enabled: boolean;
  max_orders_per_slot: number | null;
  public_zip_code: string | null;
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("business_settings")
    .select(`
      id,
      business_name,
      timezone,
      ordering_enabled,
      pickup_enabled,
      max_orders_per_slot,
      public_zip_code
    `)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
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
          Manage general business and ordering settings.
        </p>
      </div>

      <BusinessSettingsManager
        initialSettings={data as SettingsRow}
      />
    </div>
  );
}