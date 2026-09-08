export type BusinessSettings = {
  businessName: string;
  timezone: string;
  preparationTimeMinutes: number;
  pickupSlotIntervalMinutes: number;
  sameDayOnly: boolean;
  orderingEnabled: boolean;
  pickupEnabled: boolean;
  maxOrdersPerSlot: number | null;
  publicZipCode: string | null;
};

export type PickupSlot = {
  value: string;
  label: string;
};

export type PickupAvailability = {
  settings: BusinessSettings;
  date: string;
  dayLabel: string;
  isOpen: boolean;
  reason: string | null;
  note: string | null;
  openTime: string | null;
  closeTime: string | null;
  slots: PickupSlot[];
};