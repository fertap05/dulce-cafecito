export type SelectedCartOption = {
  groupId: number;
  groupName: string;

  valueId: number;
  valueName: string;

  priceDelta: number;
};

export type CartItem = {
  cartId: string;

  productId: number;

  name: string;

  imagePath:
    | string
    | null;

  unitPrice: number;

  quantity: number;

  selectedOptions:
    SelectedCartOption[];

  instructions: string;
};

export type AddCartItem =
  Omit<CartItem, "cartId">;