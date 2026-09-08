export type ProductOptionValue = {
  id: number;
  name: string;
  priceDelta: number;
  displayOrder: number;
};

export type ProductOptionGroup = {
  id: number;
  name: string;
  selectionType: "single" | "multiple";
  isRequired: boolean;
  displayOrder: number;
  values: ProductOptionValue[];
};

export type MenuItem = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  imagePath: string | null;
};

export type MenuItemDetail = MenuItem & {
  optionGroups: ProductOptionGroup[];
};

export type MenuCategory = {
  id: number;
  name: string;
  displayOrder: number;
  items: MenuItem[];
};