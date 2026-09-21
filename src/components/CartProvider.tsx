"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  AddCartItem,
  CartItem,
  SelectedCartOption,
} from "@/types/cart";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;

  addItem: (
    item: AddCartItem
  ) => void;

  removeItem: (
    cartId: string
  ) => void;

  updateQuantity: (
    cartId: string,
    quantity: number
  ) => void;

  clearCart: () => void;
};

const CartContext =
  createContext<
    CartContextValue | undefined
  >(undefined);

/*
 * We are changing this from v2 to v3
 * because the cart now stores product images.
 *
 * During development this also clears old
 * saved cart items that did not contain imagePath.
 */
const STORAGE_KEY =
  "dulce-cafecito-cart-v3";

function normalizeInstructions(
  instructions: string
) {
  return instructions
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function normalizeOptions(
  options: SelectedCartOption[]
) {
  return [...options]
    .sort((a, b) => {
      if (
        a.groupId !==
        b.groupId
      ) {
        return (
          a.groupId -
          b.groupId
        );
      }

      return (
        a.valueId -
        b.valueId
      );
    })
    .map((option) => ({
      groupId:
        option.groupId,

      valueId:
        option.valueId,

      priceDelta:
        option.priceDelta,
    }));
}

function isSameCartItem(
  existing: CartItem,
  incoming: AddCartItem
) {
  if (
    existing.productId !==
    incoming.productId
  ) {
    return false;
  }

  if (
    existing.unitPrice !==
    incoming.unitPrice
  ) {
    return false;
  }

  if (
    normalizeInstructions(
      existing.instructions
    ) !==
    normalizeInstructions(
      incoming.instructions
    )
  ) {
    return false;
  }

  const existingOptions =
    normalizeOptions(
      existing.selectedOptions
    );

  const incomingOptions =
    normalizeOptions(
      incoming.selectedOptions
    );

  return (
    JSON.stringify(
      existingOptions
    ) ===
    JSON.stringify(
      incomingOptions
    )
  );
}

export default function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    items,
    setItems,
  ] =
    useState<CartItem[]>(
      []
    );

  const hasLoadedCart =
    useRef(false);

  /*
   * Restore saved cart.
   */
  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (savedCart) {
        const parsed =
          JSON.parse(
            savedCart
          ) as CartItem[];

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(parsed);
      }
    } catch {
      console.error(
        "Could not load the saved cart."
      );
    }

    hasLoadedCart.current =
      true;
  }, []);

  /*
   * Save whenever the cart changes.
   */
  useEffect(() => {
    if (
      !hasLoadedCart.current
    ) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items)
    );
  }, [items]);

  /*
   * Add new product or merge with
   * an identical customization.
   */
  function addItem(
    item: AddCartItem
  ) {
    setItems(
      (currentItems) => {
        const matchingIndex =
          currentItems.findIndex(
            (existing) =>
              isSameCartItem(
                existing,
                item
              )
          );

        /*
         * Same product + same options +
         * same instructions:
         *
         * Increase quantity instead of
         * making another line.
         */
        if (
          matchingIndex !== -1
        ) {
          return currentItems.map(
            (
              existing,
              index
            ) =>
              index ===
              matchingIndex
                ? {
                    ...existing,

                    quantity:
                      existing.quantity +
                      item.quantity,

                    /*
                     * Refresh the image path too,
                     * in case the owner replaced
                     * the product image.
                     */
                    imagePath:
                      item.imagePath ??
                      existing.imagePath,
                  }
                : existing
          );
        }

        /*
         * Different customization:
         * create a separate cart item.
         */
        const newItem:
          CartItem = {
          ...item,

          cartId:
            crypto.randomUUID(),
        };

        return [
          ...currentItems,
          newItem,
        ];
      }
    );
  }

  function removeItem(
    cartId: string
  ) {
    setItems(
      (currentItems) =>
        currentItems.filter(
          (item) =>
            item.cartId !==
            cartId
        )
    );
  }

  function updateQuantity(
    cartId: string,
    quantity: number
  ) {
    setItems(
      (currentItems) =>
        currentItems.map(
          (item) =>
            item.cartId ===
            cartId
              ? {
                  ...item,

                  quantity:
                    Math.max(
                      1,
                      quantity
                    ),
                }
              : item
        )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        item.quantity,
      0
    );

  const subtotal =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        item.unitPrice *
          item.quantity,
      0
    );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(
      CartContext
    );

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}