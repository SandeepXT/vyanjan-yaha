// ─── Menu ────────────────────────────────────────────────────────────────────

export type Cuisine = "Indian" | "Western" | "Fusion";
export type Category = "Starters" | "Mains" | "Breads" | "Desserts" | "Beverages" | "Sides";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  cuisine: Cuisine;
  category: Category;
  isVeg: boolean;
  isPopular?: boolean;
  isSpicy?: boolean;
  rating: number;
  prepTime: number; // minutes
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "ORDER_RECEIVED"
  | "CONFIRMED"
  | "PREPARING"
  | "QUALITY_CHECK"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

export interface OrderStatusStep {
  status: OrderStatus;
  label: string;
  description: string;
  timestamp?: string;
  completed: boolean;
  active: boolean;
}

export interface DeliveryDetails {
  name: string;
  phone: string;
  address: string;
  landmark?: string;
  instructions?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  deliveryDetails: DeliveryDetails;
  status: OrderStatus;
  statusHistory: Array<{ status: OrderStatus; timestamp: string }>;
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  estimatedDelivery: string; // ISO string
  createdAt: string;
  userId?: string | null;
  updatedAt: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PlaceOrderPayload {
  items: Array<{ menuItemId: string; quantity: number }>;
  deliveryDetails: DeliveryDetails;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ValidationError {
  field: string;
  message: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  avatar?: string; // initials or color
  createdAt: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Auth (already defined above, ensure Order has userId) ───────────────────
// User and auth interfaces are defined above in this file
