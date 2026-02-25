"use client";

import { useEffect, useRef, useState } from "react";
import { Order } from "@/lib/types";

interface UseOrderStatusReturn {
  order: Order | null;
  isConnected: boolean;
  error: string | null;
}

export function useOrderStatus(orderId: string | null): UseOrderStatusReturn {
  const [order, setOrder] = useState<Order | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!orderId) return;

    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`/api/orders/${orderId}/stream`);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.order) {
          setOrder(data.order);
        }
        if (data.type === "delivered") {
          es.close();
          setIsConnected(false);
        }
      } catch {
        console.error("SSE parse error:", event.data);
      }
    };

    es.onerror = () => {
      setIsConnected(false);
      setError("Connection lost. Status updates paused.");
      es.close();
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [orderId]);

  return { order, isConnected, error };
}
