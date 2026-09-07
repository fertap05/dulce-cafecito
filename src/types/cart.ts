export type CartItem = {
  cartId: string;
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  milk: string;
  coldFoam: string;
  instructions: string;
};

export type AddCartItem = Omit<CartItem, "cartId">;