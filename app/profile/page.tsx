"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getAvatarColor, getInitials } from "@/lib/auth-store";
import { Order } from "@/lib/types";
import { ORDER_STATUS_CONFIG, formatCurrency, formatTime } from "@/lib/utils";
import { User, Phone, Mail, MapPin, LogOut, Package, ChevronRight, Clock, ShoppingBag, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth?redirect=/profile");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!user) return;
    async function fetchOrders() {
      try {
        const res = await fetch(`/api/orders?userId=${user!.id}`, { cache: "no-store" });
        const data = await res.json();
        if (data.success) setOrders(data.data);
      } finally {
        setOrdersLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--emerald)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const avatarColor = getAvatarColor(user.name);
  const initials = getInitials(user.name);
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
  const totalSpent = deliveredOrders.reduce((s, o) => s + o.total, 0);

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pb-16" style={{ paddingTop: "100px" }}>
      <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8 group hover:text-parchment transition-colors" style={{ color: "var(--ink-400)" }}>
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Menu
      </Link>

      {/* Profile Header */}
      <div className="rounded-3xl p-6 mb-6 relative overflow-hidden" style={{ background: "var(--ink-100)", border: "1px solid var(--border-subtle)" }}>
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: `radial-gradient(circle at 80% 20%, ${avatarColor}15 0%, transparent 60%)` }} />

        <div className="relative flex items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-black font-display" style={{ background: avatarColor, color: "#fff", boxShadow: `0 8px 32px ${avatarColor}40` }}>
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-3xl mb-0.5" style={{ color: "var(--parchment)" }}>{user.name}</h1>
            <p className="text-sm mb-4" style={{ color: "var(--ink-400)" }}>Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>

            {/* Info pills */}
            <div className="flex flex-wrap gap-2">
              <InfoPill icon={<Mail size={12} />} text={user.email} />
              <InfoPill icon={<Phone size={12} />} text={user.phone} />
              {user.address && <InfoPill icon={<MapPin size={12} />} text={user.address} />}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:bg-red-500/10 flex-shrink-0"
            style={{ color: "#FCA5A5", border: "1px solid rgba(220,38,38,0.2)" }}
          >
            <LogOut size={14} />
            <span className="hidden sm:block">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Orders", value: orders.length, icon: <Package size={18} /> },
          { label: "Delivered", value: deliveredOrders.length, icon: <ShoppingBag size={18} /> },
          { label: "Total Spent", value: formatCurrency(totalSpent), icon: <Clock size={18} /> },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl p-4 text-center" style={{ background: "var(--ink-100)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex justify-center mb-2" style={{ color: "var(--emerald)" }}>{stat.icon}</div>
            <p className="font-display font-bold text-xl" style={{ color: "var(--parchment)" }}>{stat.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink-400)" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Order History */}
      <div className="rounded-3xl overflow-hidden" style={{ background: "var(--ink-100)", border: "1px solid var(--border-subtle)" }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
          <h2 className="font-display font-bold text-xl" style={{ color: "var(--parchment)" }}>Order History</h2>
          <span className="text-sm" style={{ color: "var(--ink-400)" }}>{orders.length} orders</span>
        </div>

        {ordersLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: "var(--emerald)", borderTopColor: "transparent" }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={36} className="mx-auto mb-4" style={{ color: "var(--ink-400)" }} />
            <p className="font-display font-semibold text-lg mb-1" style={{ color: "var(--parchment)" }}>No orders yet</p>
            <p className="text-sm mb-6" style={{ color: "var(--ink-400)" }}>Your order history will appear here</p>
            <Link href="/">
              <button className="btn-primary px-6 py-3 rounded-xl font-semibold text-sm">Browse Menu</button>
            </Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {orders.map((order) => {
              const config = ORDER_STATUS_CONFIG[order.status];
              return (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${config.color}15`, border: `1.5px solid ${config.color}40` }}>
                      <Package size={18} style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono-custom text-sm font-bold" style={{ color: "var(--parchment)" }}>{order.id}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${config.color}20`, color: config.color }}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs truncate" style={{ color: "var(--ink-400)" }}>
                        {order.items.map((ci) => ci.menuItem.name).join(", ")}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--ink-400)" }}>
                        <Clock size={9} className="inline mr-1" />{formatTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-display font-bold" style={{ color: "var(--parchment)" }}>{formatCurrency(order.total)}</p>
                      <p className="text-xs" style={{ color: "var(--ink-400)" }}>{order.items.length} dish{order.items.length > 1 ? "es" : ""}</p>
                    </div>
                    <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" style={{ color: "var(--ink-400)" }} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ background: "var(--ink-200)", color: "var(--parchment-200)", border: "1px solid var(--border-subtle)" }}>
      <span style={{ color: "var(--emerald)" }}>{icon}</span>
      {text}
    </span>
  );
}
