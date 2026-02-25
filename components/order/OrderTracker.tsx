"use client";

import { Order } from "@/lib/types";
import { ORDER_STATUS_CONFIG, STATUS_SEQUENCE, getStatusProgress, formatCurrency, formatTime } from "@/lib/utils";
import { CheckCircle, Circle, Loader2, MapPin, Phone, User, Clock, Wifi, WifiOff, Package } from "lucide-react";

interface OrderTrackerProps {
  order: Order;
  isConnected: boolean;
}

export function OrderTracker({ order, isConnected }: OrderTrackerProps) {
  const progress = getStatusProgress(order.status);
  const currentConfig = ORDER_STATUS_CONFIG[order.status];
  const isDelivered = order.status === "DELIVERED";

  return (
    <div className="space-y-6">
      {/* Order ID + connection status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-mono-custom tracking-widest uppercase mb-1" style={{ color: "var(--ink-400)" }}>
            Order ID
          </p>
          <h1 className="font-display font-bold text-3xl tracking-tight" style={{ color: "var(--parchment)" }}>
            {order.id}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid var(--emerald)", color: "var(--emerald-light)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-pulse" />
              Live tracking
            </span>
          ) : isDelivered ? (
            <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid var(--emerald)", color: "var(--emerald-light)" }}>
              <CheckCircle size={12} />
              Delivered
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid var(--saffron)", color: "var(--saffron-light)" }}>
              <WifiOff size={12} />
              Reconnecting...
            </span>
          )}
        </div>
      </div>

      {/* Current status hero */}
      <div
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{ background: "var(--ink-200)", border: "1px solid var(--border-subtle)" }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: `radial-gradient(ellipse at 20% 50%, ${currentConfig.color} 0%, transparent 60%)`,
          }}
        />

        <div className="relative flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${currentConfig.color}20`, border: `1.5px solid ${currentConfig.color}` }}
          >
            {!isDelivered ? (
              <Loader2 size={22} className="animate-spin" style={{ color: currentConfig.color }} />
            ) : (
              <CheckCircle size={22} style={{ color: currentConfig.color }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-2xl mb-1" style={{ color: "var(--parchment)" }}>
              {currentConfig.label}
            </h2>
            <p className="text-sm" style={{ color: "var(--ink-400)" }}>
              {currentConfig.description}
            </p>
            {!isDelivered && (
              <p className="text-xs mt-2" style={{ color: "var(--saffron)" }}>
                <Clock size={11} className="inline mr-1" />
                Est. delivery by {formatTime(order.estimatedDelivery)}
              </p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "var(--ink-300)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${currentConfig.color}, ${currentConfig.color}99)`,
                boxShadow: `0 0 12px ${currentConfig.color}60`,
              }}
            />
          </div>
          <p className="text-right text-xs mt-1.5" style={{ color: "var(--ink-400)" }}>
            {progress}% complete
          </p>
        </div>
      </div>

      {/* Status timeline */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--ink-200)", border: "1px solid var(--border-subtle)" }}
      >
        <h3 className="text-xs font-mono-custom tracking-widest uppercase mb-5" style={{ color: "var(--ink-400)" }}>
          Order Journey
        </h3>
        <div className="space-y-0">
          {STATUS_SEQUENCE.map((status, index) => {
            const currentIndex = STATUS_SEQUENCE.indexOf(order.status);
            const config = ORDER_STATUS_CONFIG[status];
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;
            const isFuture = index > currentIndex;
            const historyEntry = order.statusHistory.find((h) => h.status === status);

            return (
              <div key={status} className="flex items-start gap-4">
                {/* Timeline line + dot */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
                    style={{
                      background: isCompleted
                        ? "var(--emerald)"
                        : isActive
                        ? `${config.color}20`
                        : "var(--ink-300)",
                      border: isActive
                        ? `2px solid ${config.color}`
                        : isCompleted
                        ? "2px solid var(--emerald)"
                        : "2px solid var(--border-medium)",
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle size={14} style={{ color: "var(--ink)" }} />
                    ) : isActive ? (
                      <div
                        className="w-2.5 h-2.5 rounded-full status-pulse"
                        style={{ background: config.color }}
                      />
                    ) : (
                      <Circle size={10} style={{ color: "var(--ink-400)" }} />
                    )}
                  </div>
                  {index < STATUS_SEQUENCE.length - 1 && (
                    <div
                      className="w-0.5 h-8 my-1 transition-all duration-500"
                      style={{
                        background: isCompleted
                          ? "var(--emerald)"
                          : "var(--border-subtle)",
                      }}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 pb-1 pt-1">
                  <div className="flex items-center justify-between">
                    <p
                      className="text-sm font-semibold transition-colors"
                      style={{
                        color: isActive
                          ? "var(--parchment)"
                          : isCompleted
                          ? "var(--parchment-200)"
                          : "var(--ink-400)",
                      }}
                    >
                      {config.label}
                    </p>
                    {historyEntry && (
                      <span className="text-[10px] font-mono-custom" style={{ color: "var(--ink-400)" }}>
                        {formatTime(historyEntry.timestamp)}
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--ink-400)" }}>
                      {config.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order items */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--ink-200)", border: "1px solid var(--border-subtle)" }}
      >
        <h3 className="text-xs font-mono-custom tracking-widest uppercase mb-4" style={{ color: "var(--ink-400)" }}>
          Your Order
        </h3>
        <div className="space-y-3">
          {order.items.map((ci, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 ${
                    ci.menuItem.isVeg
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-red-500 bg-red-500"
                  }`}
                />
                <span className="text-sm" style={{ color: "var(--parchment-200)" }}>
                  {ci.menuItem.name}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "var(--ink-300)", color: "var(--ink-400)" }}
                >
                  ×{ci.quantity}
                </span>
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--parchment)" }}>
                {formatCurrency(ci.menuItem.price * ci.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Bill */}
        <div className="mt-4 pt-4 space-y-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <BillLine label="Subtotal" value={formatCurrency(order.subtotal)} />
          <BillLine
            label="Delivery"
            value={order.deliveryFee === 0 ? "FREE" : formatCurrency(order.deliveryFee)}
            highlight={order.deliveryFee === 0}
          />
          <BillLine label="GST (5%)" value={formatCurrency(order.taxes)} />
          <div
            className="flex items-center justify-between pt-2 mt-2"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <span className="font-display font-bold text-base" style={{ color: "var(--parchment)" }}>
              Total Paid
            </span>
            <span className="font-display font-bold text-lg" style={{ color: "var(--parchment)" }}>
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery details */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--ink-200)", border: "1px solid var(--border-subtle)" }}
      >
        <h3 className="text-xs font-mono-custom tracking-widest uppercase mb-4" style={{ color: "var(--ink-400)" }}>
          Delivering To
        </h3>
        <div className="space-y-3">
          <DetailRow icon={<User size={14} />} value={order.deliveryDetails.name} />
          <DetailRow icon={<Phone size={14} />} value={order.deliveryDetails.phone} />
          <DetailRow icon={<MapPin size={14} />} value={order.deliveryDetails.address} />
          {order.deliveryDetails.landmark && (
            <DetailRow icon={<MapPin size={14} />} value={`Near: ${order.deliveryDetails.landmark}`} />
          )}
        </div>
      </div>
    </div>
  );
}

function BillLine({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: "var(--ink-400)" }}>{label}</span>
      <span style={{ color: highlight ? "var(--emerald-light)" : "var(--parchment-200)" }}>{value}</span>
    </div>
  );
}

function DetailRow({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex-shrink-0" style={{ color: "var(--emerald)" }}>{icon}</span>
      <span className="text-sm" style={{ color: "var(--parchment-200)" }}>{value}</span>
    </div>
  );
}
