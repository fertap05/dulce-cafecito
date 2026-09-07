export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: "Coffee" | "Matcha" | "Refreshers";
  available: boolean;
};

export const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Mazapán Iced Coffee",
    description:
      "A creamy iced coffee inspired by the sweet, nutty flavor of mazapán.",
    price: 5,
    category: "Coffee",
    available: true,
  },
  {
    id: 2,
    name: "Gansito Iced Coffee",
    description:
      "Sweet iced coffee inspired by the classic chocolate and strawberry treat.",
    price: 5,
    category: "Coffee",
    available: true,
  },
  {
    id: 3,
    name: "Cookie Butter Iced Coffee",
    description:
      "Smooth iced coffee with sweet and spiced cookie butter flavor.",
    price: 5.5,
    category: "Coffee",
    available: true,
  },
  {
    id: 4,
    name: "Caramel Iced Coffee",
    description:
      "Classic iced coffee finished with a rich caramel flavor.",
    price: 4.5,
    category: "Coffee",
    available: true,
  },
  {
    id: 5,
    name: "Abuelita Iced Latte",
    description:
      "A cozy iced latte inspired by Mexican chocolate flavors.",
    price: 5,
    category: "Coffee",
    available: true,
  },
  {
    id: 6,
    name: "Iced Matcha Latte",
    description:
      "Creamy matcha served over ice for a smooth and refreshing drink.",
    price: 5,
    category: "Matcha",
    available: true,
  },
  {
    id: 7,
    name: "Strawberry Matcha",
    description:
      "Iced matcha topped with sweet strawberry cold foam.",
    price: 5,
    category: "Matcha",
    available: true,
  },
  {
    id: 8,
    name: "Berry Chill",
    description:
      "A refreshing berry drink served with your choice of water or lemonade.",
    price: 5,
    category: "Refreshers",
    available: true,
  },
  {
    id: 9,
    name: "Mango & Dragonfruit",
    description:
      "Tropical mango and dragonfruit refresher served with lemonade.",
    price: 5,
    category: "Refreshers",
    available: true,
  },
  {
    id: 10,
    name: "Strawberry Açaí",
    description:
      "A fruity strawberry and açaí refresher served chilled.",
    price: 5,
    category: "Refreshers",
    available: false,
  },
];