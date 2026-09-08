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

export type MenuCategory = {
  id: number;
  name: string;
  displayOrder: number;
  items: MenuItem[];
};