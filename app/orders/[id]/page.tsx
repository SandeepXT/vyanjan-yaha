"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Order } from "@/lib/types";
import { useOrderStatus } from "@/lib/use-order-status";
import { OrderTracker } from "@/components/order/OrderTracker";
import { ArrowLeft, AlertCircle, Loader2, Lock } from "lucide-react";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [initialOrder, setInitialOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [retries, setRetries] = useState(0);

  // Redirect guests
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth?redirect=/orders/${id}`);
    }
  }, [authLoading, isAuthenticated, router, id]);

  const fetchOrder = useCallback(async () => {
    if (!id || !isAuthenticated) return;
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setInitialOrder(data.data);
        setLoading(false);
      } else {
        if (retries < 5) {
          setTimeout(() => setRetries((r) => r + 1), 600);
        } else {
          setNotFound(true);
          setLoading(false);
        }
      }
    } catch {
      if (retries < 5) {
        setTimeout(() => setRetries((r) => r + 1), 600);
      } else {
        setNotFound(true);
        setLoading(false);
      }
    }
  }, [id, retries, isAuthenticated]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const { order: liveOrder, isConnected } = useOrderStatus(initialOrder ? id : null);
  const order = liveOrder || initialOrder;

  // Auth loading
  if (authLoading || (!isAuthenticated && !authLoading)) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]" style={{ paddingTop: "80px" }}>
        <div className="text-center space-y-4">
          <Loader2 size={40} className="animate-spin mx-auto" style={{ color: "var(--emerald)" }} />
          <p className="font-display text-lg" style={{ color: "var(--parchment)" }}>Loading your order...</p>
          <p className="text-sm" style={{ color: "var(--ink-400)" }}>Just a moment</p>
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="max-w-md mx-auto px-6 text-center" style={{ paddingTop: "140px" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid var(--crimson)" }}>
          <AlertCircle size={28} style={{ color: "var(--crimson)" }} />
        </div>
        <h1 className="font-display font-bold text-2xl mb-2" style={{ color: "var(--parchment)" }}>Order Not Found</h1>
        <p className="text-sm mb-6" style={{ color: "var(--ink-400)" }}>
          We couldn&apos;t find order <code className="font-mono-custom px-1 py-0.5 rounded text-xs" style={{ background: "var(--ink-200)" }}>{id}</code>
        </p>
        <Link href="/orders"><button className="btn-primary px-6 py-3 rounded-xl font-semibold">View All Orders</button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pb-16" style={{ paddingTop: "100px" }}>
      <Link href="/orders" className="inline-flex items-center gap-2 text-sm mb-8 group hover:text-parchment transition-colors" style={{ color: "var(--ink-400)" }}>
        <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
        All Orders
      </Link>
      <OrderTracker order={order} isConnected={isConnected} />
    </div>
  );
}
