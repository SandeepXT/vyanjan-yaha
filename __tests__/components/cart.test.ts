/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { CartProvider, useCart } from "@/lib/cart-context";
import { MenuItem } from "@/lib/types";

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(CartProvider, null, children);

const mockItem: MenuItem = {
  id: "test-001",
  name: "Test Biryani",
  description: "A delicious test biryani",
  price: 299,
  image: "https://example.com/biryani.jpg",
  cuisine: "Indian",
  category: "Mains",
  isVeg: true,
  rating: 4.5,
  prepTime: 20,
};

const mockItem2: MenuItem = {
  id: "test-002",
  name: "Test Burger",
  description: "A test burger",
  price: 199,
  image: "https://example.com/burger.jpg",
  cuisine: "Western",
  category: "Mains",
  isVeg: false,
  rating: 4.3,
  prepTime: 15,
};

describe("CartContext", () => {
  describe("addItem", () => {
    it("adds a new item to the cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => { result.current.addItem(mockItem); });
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].menuItem.id).toBe("test-001");
      expect(result.current.items[0].quantity).toBe(1);
    });

    it("increments quantity when adding an existing item", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => { result.current.addItem(mockItem); });
      act(() => { result.current.addItem(mockItem); });
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
    });

    it("adds multiple different items", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => {
        result.current.addItem(mockItem);
        result.current.addItem(mockItem2);
      });
      expect(result.current.items).toHaveLength(2);
    });
  });

  describe("removeItem", () => {
    it("removes an item from the cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => { result.current.addItem(mockItem); });
      act(() => { result.current.removeItem("test-001"); });
      expect(result.current.items).toHaveLength(0);
    });

    it("only removes the specified item", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => {
        result.current.addItem(mockItem);
        result.current.addItem(mockItem2);
      });
      act(() => { result.current.removeItem("test-001"); });
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].menuItem.id).toBe("test-002");
    });

    it("does nothing when removing non-existent item", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => { result.current.addItem(mockItem); });
      act(() => { result.current.removeItem("does-not-exist"); });
      expect(result.current.items).toHaveLength(1);
    });
  });

  describe("updateQuantity", () => {
    it("updates the quantity of an item", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => { result.current.addItem(mockItem); });
      act(() => { result.current.updateQuantity("test-001", 5); });
      expect(result.current.items[0].quantity).toBe(5);
    });

    it("removes item when quantity is set to 0", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => { result.current.addItem(mockItem); });
      act(() => { result.current.updateQuantity("test-001", 0); });
      expect(result.current.items).toHaveLength(0);
    });

    it("removes item when quantity is set to negative", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => { result.current.addItem(mockItem); });
      act(() => { result.current.updateQuantity("test-001", -1); });
      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("clearCart", () => {
    it("removes all items from the cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => {
        result.current.addItem(mockItem);
        result.current.addItem(mockItem2);
      });
      act(() => { result.current.clearCart(); });
      expect(result.current.items).toHaveLength(0);
      expect(result.current.cart.itemCount).toBe(0);
      expect(result.current.cart.total).toBe(0);
    });
  });

  describe("cart totals", () => {
    it("calculates total correctly", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => {
        result.current.addItem(mockItem);   // 299
        result.current.addItem(mockItem2);  // 199
      });
      expect(result.current.cart.total).toBe(498);
    });

    it("calculates itemCount correctly", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => {
        result.current.addItem(mockItem);
        result.current.addItem(mockItem);
        result.current.addItem(mockItem2);
      });
      expect(result.current.cart.itemCount).toBe(3);
    });

    it("recalculates total after quantity change", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => { result.current.addItem(mockItem); }); // 299
      act(() => { result.current.updateQuantity("test-001", 3); }); // 897
      expect(result.current.cart.total).toBe(897);
    });
  });

  describe("helpers", () => {
    it("getItemQuantity returns 0 for items not in cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      expect(result.current.getItemQuantity("test-001")).toBe(0);
    });

    it("getItemQuantity returns correct quantity", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => {
        result.current.addItem(mockItem);
        result.current.addItem(mockItem);
      });
      expect(result.current.getItemQuantity("test-001")).toBe(2);
    });

    it("isInCart returns false when item not in cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      expect(result.current.isInCart("test-001")).toBe(false);
    });

    it("isInCart returns true when item is in cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => { result.current.addItem(mockItem); });
      expect(result.current.isInCart("test-001")).toBe(true);
    });
  });
});
