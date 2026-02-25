/**
 * @jest-environment node
 */
import {
  createOrder,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  validatePlaceOrderPayload,
} from "@/lib/store";
import { PlaceOrderPayload, OrderStatus } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeValidPayload(overrides: Partial<PlaceOrderPayload> = {}): PlaceOrderPayload {
  return {
    items: [{ menuItemId: "item-001", quantity: 2 }],
    deliveryDetails: {
      name: "Arjun Sharma",
      phone: "9876543210",
      address: "123 MG Road, Connaught Place, New Delhi 110001",
    },
    ...overrides,
  };
}

// ─── Validation Tests ─────────────────────────────────────────────────────────

describe("validatePlaceOrderPayload", () => {
  it("passes with valid payload", () => {
    const errors = validatePlaceOrderPayload(makeValidPayload());
    expect(errors).toHaveLength(0);
  });

  it("fails with empty items array", () => {
    const errors = validatePlaceOrderPayload({ ...makeValidPayload(), items: [] });
    expect(errors.some((e) => e.field === "items")).toBe(true);
  });

  it("fails with missing items field", () => {
    const payload = { deliveryDetails: makeValidPayload().deliveryDetails };
    const errors = validatePlaceOrderPayload(payload);
    expect(errors.some((e) => e.field === "items")).toBe(true);
  });

  it("fails when menuItemId does not exist", () => {
    const errors = validatePlaceOrderPayload({
      ...makeValidPayload(),
      items: [{ menuItemId: "does-not-exist", quantity: 1 }],
    });
    expect(errors.some((e) => e.field.includes("menuItemId"))).toBe(true);
  });

  it("fails with zero quantity", () => {
    const errors = validatePlaceOrderPayload({
      ...makeValidPayload(),
      items: [{ menuItemId: "item-001", quantity: 0 }],
    });
    expect(errors.some((e) => e.field.includes("quantity"))).toBe(true);
  });

  it("fails with negative quantity", () => {
    const errors = validatePlaceOrderPayload({
      ...makeValidPayload(),
      items: [{ menuItemId: "item-001", quantity: -1 }],
    });
    expect(errors.some((e) => e.field.includes("quantity"))).toBe(true);
  });

  it("fails with fractional quantity", () => {
    const errors = validatePlaceOrderPayload({
      ...makeValidPayload(),
      items: [{ menuItemId: "item-001", quantity: 1.5 }],
    });
    expect(errors.some((e) => e.field.includes("quantity"))).toBe(true);
  });

  it("fails with short name", () => {
    const errors = validatePlaceOrderPayload(
      makeValidPayload({ deliveryDetails: { ...makeValidPayload().deliveryDetails, name: "A" } })
    );
    expect(errors.some((e) => e.field.includes("name"))).toBe(true);
  });

  it("fails with invalid phone number", () => {
    const errors = validatePlaceOrderPayload(
      makeValidPayload({
        deliveryDetails: { ...makeValidPayload().deliveryDetails, phone: "12345" },
      })
    );
    expect(errors.some((e) => e.field.includes("phone"))).toBe(true);
  });

  it("fails with phone starting with 0", () => {
    const errors = validatePlaceOrderPayload(
      makeValidPayload({
        deliveryDetails: { ...makeValidPayload().deliveryDetails, phone: "0123456789" },
      })
    );
    expect(errors.some((e) => e.field.includes("phone"))).toBe(true);
  });

  it("fails with short address", () => {
    const errors = validatePlaceOrderPayload(
      makeValidPayload({
        deliveryDetails: { ...makeValidPayload().deliveryDetails, address: "Short" },
      })
    );
    expect(errors.some((e) => e.field.includes("address"))).toBe(true);
  });

  it("fails with missing delivery details", () => {
    const errors = validatePlaceOrderPayload({ items: makeValidPayload().items });
    expect(errors.some((e) => e.field === "deliveryDetails")).toBe(true);
  });

  it("fails with non-object body", () => {
    const errors = validatePlaceOrderPayload("invalid");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns multiple errors when multiple fields are invalid", () => {
    const errors = validatePlaceOrderPayload({
      items: [],
      deliveryDetails: { name: "", phone: "bad", address: "short" },
    });
    expect(errors.length).toBeGreaterThan(1);
  });
});

// ─── Order CRUD Tests ─────────────────────────────────────────────────────────

describe("Order CRUD", () => {
  let orderId: string;

  it("creates an order with correct structure", () => {
    const payload = makeValidPayload();
    const order = createOrder(payload);

    orderId = order.id;

    expect(order.id).toMatch(/^ORD-/);
    expect(order.status).toBe("ORDER_RECEIVED");
    expect(order.items).toHaveLength(1);
    expect(order.items[0].quantity).toBe(2);
    expect(order.items[0].menuItem.id).toBe("item-001");
    expect(order.deliveryDetails.name).toBe("Arjun Sharma");
    expect(order.statusHistory).toHaveLength(1);
    expect(order.statusHistory[0].status).toBe("ORDER_RECEIVED");
    expect(order.createdAt).toBeDefined();
    expect(order.updatedAt).toBeDefined();
    expect(order.estimatedDelivery).toBeDefined();
  });

  it("calculates subtotal correctly", () => {
    const payload = makeValidPayload({
      items: [{ menuItemId: "item-001", quantity: 2 }],
    });
    const order = createOrder(payload);
    // item-001 is Galouti Kebab at ₹340 × 2 = ₹680
    expect(order.subtotal).toBe(680);
  });

  it("applies free delivery for orders >= ₹500", () => {
    const payload = makeValidPayload({
      items: [{ menuItemId: "item-001", quantity: 2 }], // ₹680
    });
    const order = createOrder(payload);
    expect(order.deliveryFee).toBe(0);
  });

  it("charges delivery fee for orders < ₹500", () => {
    const payload = makeValidPayload({
      items: [{ menuItemId: "item-003", quantity: 1 }], // Vada Pav ₹80
    });
    const order = createOrder(payload);
    expect(order.deliveryFee).toBe(49);
    expect(order.taxes).toBe(4); // 5% of ₹80 = ₹4
  });

  it("calculates total = subtotal + deliveryFee + taxes", () => {
    const payload = makeValidPayload({
      items: [{ menuItemId: "item-003", quantity: 1 }],
    });
    const order = createOrder(payload);
    expect(order.total).toBe(order.subtotal + order.deliveryFee + order.taxes);
  });

  it("retrieves an order by ID", () => {
    const found = getOrder(orderId);
    expect(found).toBeDefined();
    expect(found!.id).toBe(orderId);
  });

  it("returns undefined for non-existent order", () => {
    const found = getOrder("ORD-DOESNOTEXIST");
    expect(found).toBeUndefined();
  });

  it("includes newly created order in getAllOrders", () => {
    const all = getAllOrders();
    const found = all.find((o) => o.id === orderId);
    expect(found).toBeDefined();
  });

  it("returns orders sorted by newest first", () => {
    const all = getAllOrders();
    for (let i = 0; i < all.length - 1; i++) {
      const a = new Date(all[i].createdAt).getTime();
      const b = new Date(all[i + 1].createdAt).getTime();
      expect(a).toBeGreaterThanOrEqual(b);
    }
  });
});

// ─── Order Status Update Tests ────────────────────────────────────────────────

describe("Order Status Updates", () => {
  let orderId: string;

  beforeEach(() => {
    const order = createOrder(makeValidPayload());
    orderId = order.id;
  });

  it("updates order status successfully", () => {
    const updated = updateOrderStatus(orderId, "CONFIRMED");
    expect(updated).not.toBeNull();
    expect(updated!.status).toBe("CONFIRMED");
  });

  it("appends to status history on update", () => {
    updateOrderStatus(orderId, "CONFIRMED");
    updateOrderStatus(orderId, "PREPARING");
    const order = getOrder(orderId);
    expect(order!.statusHistory).toHaveLength(3);
    expect(order!.statusHistory[1].status).toBe("CONFIRMED");
    expect(order!.statusHistory[2].status).toBe("PREPARING");
  });

  it("updates updatedAt timestamp on status change", () => {
    const before = getOrder(orderId)!.updatedAt;
    // Small delay to ensure timestamp differs
    const updated = updateOrderStatus(orderId, "CONFIRMED");
    expect(updated!.updatedAt).toBeDefined();
  });

  it("returns null when updating non-existent order", () => {
    const result = updateOrderStatus("ORD-FAKE", "CONFIRMED");
    expect(result).toBeNull();
  });

  it("can advance through full status sequence", () => {
    const statuses: OrderStatus[] = [
      "CONFIRMED",
      "PREPARING",
      "QUALITY_CHECK",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ];
    for (const status of statuses) {
      const updated = updateOrderStatus(orderId, status);
      expect(updated!.status).toBe(status);
    }
  });
});

// ─── Edge Cases ───────────────────────────────────────────────────────────────

describe("Edge Cases", () => {
  it("handles multiple items in a single order", () => {
    const payload = makeValidPayload({
      items: [
        { menuItemId: "item-001", quantity: 1 },
        { menuItemId: "item-005", quantity: 2 },
        { menuItemId: "item-017", quantity: 3 },
      ],
    });
    const order = createOrder(payload);
    expect(order.items).toHaveLength(3);
    const expectedSubtotal = 340 * 1 + 380 * 2 + 120 * 3;
    expect(order.subtotal).toBe(expectedSubtotal);
  });

  it("generates unique IDs for each order", () => {
    const order1 = createOrder(makeValidPayload());
    const order2 = createOrder(makeValidPayload());
    const order3 = createOrder(makeValidPayload());
    expect(order1.id).not.toBe(order2.id);
    expect(order2.id).not.toBe(order3.id);
  });

  it("stores optional fields when provided", () => {
    const payload = makeValidPayload({
      deliveryDetails: {
        name: "Test User",
        phone: "9876543210",
        address: "123 Full Address Line, City, State 110001",
        landmark: "Near Metro Station",
        instructions: "Please call on arrival",
      },
    });
    const order = createOrder(payload);
    expect(order.deliveryDetails.landmark).toBe("Near Metro Station");
    expect(order.deliveryDetails.instructions).toBe("Please call on arrival");
  });
});
