/**
 * @jest-environment node
 */
import { menuItems } from "@/data/menu";

describe("Menu Data", () => {
  it("should have at least 25 menu items", () => {
    expect(menuItems.length).toBeGreaterThanOrEqual(25);
  });

  it("each item should have all required fields", () => {
    menuItems.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(item.name).toBeTruthy();
      expect(item.description.length).toBeGreaterThan(30);
      expect(typeof item.price).toBe("number");
      expect(item.price).toBeGreaterThan(0);
      expect(item.image).toMatch(/^https?:\/\//);
      expect(["Indian", "Western", "Fusion"]).toContain(item.cuisine);
      expect(["Starters", "Mains", "Breads", "Desserts", "Beverages", "Sides"]).toContain(item.category);
      expect(typeof item.isVeg).toBe("boolean");
      expect(typeof item.rating).toBe("number");
      expect(item.rating).toBeGreaterThanOrEqual(1);
      expect(item.rating).toBeLessThanOrEqual(5);
      expect(item.prepTime).toBeGreaterThan(0);
    });
  });

  it("all item IDs should be unique", () => {
    const ids = menuItems.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should have both veg and non-veg items", () => {
    expect(menuItems.filter((i) => i.isVeg).length).toBeGreaterThan(0);
    expect(menuItems.filter((i) => !i.isVeg).length).toBeGreaterThan(0);
  });

  it("should contain all 3 cuisines", () => {
    const cuisines = new Set(menuItems.map((i) => i.cuisine));
    expect(cuisines.has("Indian")).toBe(true);
    expect(cuisines.has("Western")).toBe(true);
    expect(cuisines.has("Fusion")).toBe(true);
  });

  it("should have popular items", () => {
    expect(menuItems.filter((i) => i.isPopular).length).toBeGreaterThan(0);
  });

  it("should have items across multiple categories", () => {
    const cats = new Set(menuItems.map((i) => i.category));
    expect(cats.size).toBeGreaterThanOrEqual(4);
  });

  it("prices should be reasonable (between ₹50 and ₹2000)", () => {
    menuItems.forEach((item) => {
      expect(item.price).toBeGreaterThanOrEqual(50);
      expect(item.price).toBeLessThanOrEqual(2000);
    });
  });
});
