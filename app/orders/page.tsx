"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Order } from "@/lib/types";
import { ORDER_STATUS_CONFIG, formatCurrency, formatTime } from "@/lib/utils";
import { Package, ChevronRight, Clock, RefreshCw, ShoppingBag, Lock } from "lucide-react";

export default function OrdersPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Redirect guests immediately
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth?redirect=/orders");
    }
  }, [isLoading, isAuthenticated, router]);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (!user) return;
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch(`/api/orders?userId=${user.id}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    fetchOrders();
    const interval = setInterval(() => fetchOrders(), 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, fetchOrders]);

  // Show loading while auth resolves
  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: "80px" }}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: "rgba(16,185,129,0.1)", border: "1.5px solid rgba(16,185,129,0.3)" }}>
            <Lock size={24} style={{ color: "var(--emerald)" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--ink-400)" }}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pb-16" style={{ paddingTop: "100px" }}>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-4xl mb-1" style={{ color: "var(--parchment)" }}>My Orders</h1>
          <p className="text-sm" style={{ color: "var(--ink-400)" }}>
            {orders.length > 0 ? `${orders.length} order${orders.length > 1 ? "s" : ""} · Auto-refreshes every 10s` : "Your order history will appear here"}
          </p>
          {lastUpdated && (
            <p className="text-xs mt-0.5" style={{ color: "var(--ink-400)" }}>
              Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          )}
        </div>
        <button onClick={() => fetchOrders(true)} disabled={refreshing} className="btn-ghost px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium mt-1">
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "var(--ink-200)" }} />)}
        </div>
      ) : orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => <OrderCard key={order.id} order={order} index={i} />)}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, index }: { order: Order; index: number }) {
  const config = ORDER_STATUS_CONFIG[order.status];
  const isDelivered = order.status === "DELIVERED";
  const totalItems = order.items.reduce((s, ci) => s + ci.quantity, 0);
  const itemNames = order.items.map((ci) => `${ci.menuItem.name} ×${ci.quantity}`).join(", ");

  return (
    <Link href={`/orders/${order.id}`}>
      <div
        className="group flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
        style={{ background: "var(--ink-200)", border: "1px solid var(--border-subtle)", animation: `fadeUp 0.4s ease forwards`, animationDelay: `${index * 0.07}s`, opacity: 0 }}
        data-testid="order-card"
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${config.color}15`, border: `1.5px solid ${config.color}40` }}>
          <Package size={20} style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono-custom text-sm font-bold" style={{ color: "var(--parchment)" }}>{order.id}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${config.color}20`, color: config.color, border: `1px solid ${config.color}40` }}>{config.label.toUpperCase()}</span>
            {!isDelivered && (
              <span className="flex items-center gap-1 text-[10px]" style={{ color: config.color }}>
                <span className="w-1.5 h-1.5 rounded-full status-pulse" style={{ background: config.color }} />
                Live
              </span>
            )}
          </div>
          <p className="text-xs truncate mb-1.5" style={{ color: "var(--ink-400)" }}>{itemNames}</p>
          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--ink-400)" }}>
            <span className="flex items-center gap-1"><Clock size={10} />{formatTime(order.createdAt)}</span>
            <span>·</span>
            <span>{totalItems} item{totalItems > 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="font-display font-bold text-lg leading-none" style={{ color: "var(--parchment)" }}>{formatCurrency(order.total)}</p>
            <p className="text-xs mt-1" style={{ color: "var(--ink-400)" }}>{order.items.length} dish{order.items.length > 1 ? "es" : ""}</p>
          </div>
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" style={{ color: "var(--ink-400)" }} />
        </div>
      </div>
    </Link>
  );
}

function EmptyOrders() {
  return (
    <div className="text-center py-24">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "var(--ink-200)" }}>
        <ShoppingBag size={32} style={{ color: "var(--ink-400)" }} />
      </div>
      <h3 className="font-display font-bold text-xl mb-2" style={{ color: "var(--parchment)" }}>No orders yet</h3>
      <p className="text-sm mb-6" style={{ color: "var(--ink-400)" }}>Head to the menu to place your first order</p>
      <Link href="/"><button className="btn-primary px-8 py-3 rounded-xl font-semibold">Browse Menu</button></Link>
    </div>
  );
}
