"use client";

import React, { createContext, useContext, useReducer, useCallback, useMemo } from "react";
import { Cart, CartItem, MenuItem } from "@/lib/types";

// ─── Actions ─────────────────────────────────────────────────────────────────

type CartAction =
  | { type: "ADD_ITEM"; menuItem: MenuItem }
  | { type: "REMOVE_ITEM"; menuItemId: string }
  | { type: "UPDATE_QUANTITY"; menuItemId: string; quantity: number }
  | { type: "CLEAR_CART" };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.find((ci) => ci.menuItem.id === action.menuItem.id);
      if (existing) {
        return state.map((ci) =>
          ci.menuItem.id === action.menuItem.id
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [...state, { menuItem: action.menuItem, quantity: 1 }];
    }
    case "REMOVE_ITEM":
      return state.filter((ci) => ci.menuItem.id !== action.menuItemId);

    case "UPDATE_QUANTITY":
      if (action.quantity <= 0) {
        return state.filter((ci) => ci.menuItem.id !== action.menuItemId);
      }
      return state.map((ci) =>
        ci.menuItem.id === action.menuItemId
          ? { ...ci, quantity: action.quantity }
          : ci
      );

    case "CLEAR_CART":
      return [];

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface CartContextValue {
  cart: Cart;
  items: CartItem[];
  addItem: (menuItem: MenuItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (menuItemId: string) => number;
  isInCart: (menuItemId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  const cart: Cart = useMemo(() => {
    const subtotal = items.reduce(
      (sum, ci) => sum + ci.menuItem.price * ci.quantity,
      0
    );
    return {
      items,
      total: subtotal,
      itemCount: items.reduce((sum, ci) => sum + ci.quantity, 0),
    };
  }, [items]);

  const addItem = useCallback((menuItem: MenuItem) => {
    dispatch({ type: "ADD_ITEM", menuItem });
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    dispatch({ type: "REMOVE_ITEM", menuItemId });
  }, []);

  const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", menuItemId, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const getItemQuantity = useCallback(
    (menuItemId: string) => {
      return items.find((ci) => ci.menuItem.id === menuItemId)?.quantity ?? 0;
    },
    [items]
  );

  const isInCart = useCallback(
    (menuItemId: string) => items.some((ci) => ci.menuItem.id === menuItemId),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ cart, items, addItem, removeItem, updateQuantity, clearCart, getItemQuantity, isInCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
