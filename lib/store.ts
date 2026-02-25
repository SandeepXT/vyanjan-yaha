import { Order, OrderStatus, PlaceOrderPayload, CartItem, ValidationError } from "@/lib/types";
import { menuItems } from "@/data/menu";
import { STATUS_SEQUENCE } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

// ─── Global Singleton (survives Next.js hot-reload / module re-init in dev) ──

declare global {
  // eslint-disable-next-line no-var
  var __vyanjan_orders: Map<string, Order> | undefined;
  // eslint-disable-next-line no-var
  var __vyanjan_sse: Map<string, Set<SSEListener>> | undefined;
}

type SSEListener = (order: Order) => void;

const orders: Map<string, Order> =
  globalThis.__vyanjan_orders ?? (globalThis.__vyanjan_orders = new Map());

const sseListeners: Map<string, Set<SSEListener>> =
  globalThis.__vyanjan_sse ?? (globalThis.__vyanjan_sse = new Map());

// ─── Status Timing ────────────────────────────────────────────────────────────

const STATUS_DELAYS_MS: Record<OrderStatus, number> = {
  ORDER_RECEIVED: 0,
  CONFIRMED: 10000,
  PREPARING: 25000,
  QUALITY_CHECK: 40000,
  OUT_FOR_DELIVERY: 55000,
  DELIVERED: 80000,
};

// ─── SSE ─────────────────────────────────────────────────────────────────────

export function subscribeToOrder(orderId: string, listener: SSEListener): () => void {
  if (!sseListeners.has(orderId)) sseListeners.set(orderId, new Set());
  sseListeners.get(orderId)!.add(listener);
  return () => { sseListeners.get(orderId)?.delete(listener); };
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validatePlaceOrderPayload(payload: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!payload || typeof payload !== "object") return [{ field: "body", message: "Invalid request body" }];
  const p = payload as Record<string, unknown>;

  if (!Array.isArray(p.items) || p.items.length === 0) {
    errors.push({ field: "items", message: "At least one item is required" });
  } else {
    (p.items as unknown[]).forEach((item, index) => {
      if (!item || typeof item !== "object") {
        errors.push({ field: `items[${index}]`, message: "Invalid item format" });
        return;
      }
      const i = item as Record<string, unknown>;
      if (!i.menuItemId || typeof i.menuItemId !== "string") {
        errors.push({ field: `items[${index}].menuItemId`, message: "menuItemId is required" });
      } else if (!menuItems.find((m) => m.id === i.menuItemId)) {
        errors.push({ field: `items[${index}].menuItemId`, message: `Menu item '${i.menuItemId}' not found` });
      }
      if (typeof i.quantity !== "number" || i.quantity < 1 || !Number.isInteger(i.quantity)) {
        errors.push({ field: `items[${index}].quantity`, message: "Quantity must be a positive integer" });
      }
    });
  }

  const dd = p.deliveryDetails as Record<string, unknown> | undefined;
  if (!dd || typeof dd !== "object") {
    errors.push({ field: "deliveryDetails", message: "Delivery details are required" });
  } else {
    if (!dd.name || typeof dd.name !== "string" || (dd.name as string).trim().length < 2)
      errors.push({ field: "deliveryDetails.name", message: "Name must be at least 2 characters" });
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!dd.phone || typeof dd.phone !== "string" || !phoneRegex.test((dd.phone as string).replace(/\s/g, "")))
      errors.push({ field: "deliveryDetails.phone", message: "Enter a valid 10-digit Indian mobile number" });
    if (!dd.address || typeof dd.address !== "string" || (dd.address as string).trim().length < 10)
      errors.push({ field: "deliveryDetails.address", message: "Address must be at least 10 characters" });
  }
  return errors;
}

// ─── Order CRUD ───────────────────────────────────────────────────────────────

export function createOrder(payload: PlaceOrderPayload, userId?: string): Order {
  const cartItems: CartItem[] = payload.items.map((item) => ({
    menuItem: menuItems.find((m) => m.id === item.menuItemId)!,
    quantity: item.quantity,
  }));
  const subtotal = cartItems.reduce((sum, ci) => sum + ci.menuItem.price * ci.quantity, 0);
  const deliveryFee = subtotal >= 500 ? 0 : 49;
  const taxes = Math.round(subtotal * 0.05);
  const now = new Date();

  const order: Order = {
    id: `ORD-${uuidv4().slice(0, 8).toUpperCase()}`,
    items: cartItems,
    deliveryDetails: payload.deliveryDetails,
    status: "ORDER_RECEIVED",
    statusHistory: [{ status: "ORDER_RECEIVED", timestamp: now.toISOString() }],
    subtotal,
    deliveryFee,
    taxes,
    total: subtotal + deliveryFee + taxes,
    estimatedDelivery: new Date(now.getTime() + 45 * 60 * 1000).toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    userId: userId || null,
  } as Order & { userId: string | null };

  orders.set(order.id, order);
  scheduleStatusProgression(order.id);
  return order;
}

export function getOrder(id: string): Order | undefined {
  return orders.get(id);
}

export function getAllOrders(): Order[] {
  return Array.from(orders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getOrdersByUser(userId: string): Order[] {
  return Array.from(orders.values())
    .filter((o) => (o as Order & { userId?: string }).userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | null {
  const order = orders.get(id);
  if (!order) return null;
  const now = new Date().toISOString();
  order.status = status;
  order.updatedAt = now;
  order.statusHistory.push({ status, timestamp: now });
  orders.set(id, order);
  sseListeners.get(id)?.forEach((listener) => listener(order));
  return order;
}

// ─── Auto Progression ─────────────────────────────────────────────────────────

function scheduleStatusProgression(orderId: string) {
  STATUS_SEQUENCE.forEach((status) => {
    const delay = STATUS_DELAYS_MS[status];
    if (delay === 0) return;
    setTimeout(() => {
      const order = orders.get(orderId);
      if (!order || order.status === "DELIVERED") return;
      updateOrderStatus(orderId, status);
    }, delay);
  });
}
