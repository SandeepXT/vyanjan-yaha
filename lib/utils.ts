import { OrderStatus, OrderStatusStep } from "@/lib/types";

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; description: string; icon: string; color: string }
> = {
  ORDER_RECEIVED: {
    label: "Order Received",
    description: "We've got your order and are processing it",
    icon: "receipt",
    color: "#10B981",
  },
  CONFIRMED: {
    label: "Confirmed",
    description: "Restaurant has confirmed your order",
    icon: "check-circle",
    color: "#10B981",
  },
  PREPARING: {
    label: "Preparing",
    description: "Our chefs are crafting your meal with love",
    icon: "chef-hat",
    color: "#F59E0B",
  },
  QUALITY_CHECK: {
    label: "Quality Check",
    description: "Final quality inspection before it leaves",
    icon: "shield-check",
    color: "#F59E0B",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    description: "Your order is on its way!",
    icon: "bike",
    color: "#3B82F6",
  },
  DELIVERED: {
    label: "Delivered",
    description: "Enjoy your meal! Aapka khana aa gaya 🎉",
    icon: "home",
    color: "#10B981",
  },
};

export const STATUS_SEQUENCE: OrderStatus[] = [
  "ORDER_RECEIVED",
  "CONFIRMED",
  "PREPARING",
  "QUALITY_CHECK",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export function buildStatusSteps(currentStatus: OrderStatus): OrderStatusStep[] {
  const currentIndex = STATUS_SEQUENCE.indexOf(currentStatus);

  return STATUS_SEQUENCE.map((status, index) => ({
    status,
    label: ORDER_STATUS_CONFIG[status].label,
    description: ORDER_STATUS_CONFIG[status].description,
    completed: index < currentIndex,
    active: index === currentIndex,
  }));
}

export function getStatusProgress(status: OrderStatus): number {
  const index = STATUS_SEQUENCE.indexOf(status);
  return Math.round((index / (STATUS_SEQUENCE.length - 1)) * 100);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTime(isoString: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(isoString));
}
