import { NextRequest } from "next/server";
import { getOrder } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const encoder = new TextEncoder();
  let interval: NodeJS.Timeout | null = null;
  let closed = false;

  const safeClose = (controller: ReadableStreamDefaultController) => {
    if (closed) return;
    closed = true;
    if (interval) { clearInterval(interval); interval = null; }
    try { controller.close(); } catch { /* already closed */ }
  };

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: object) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          safeClose(controller);
        }
      };

      const order = getOrder(params.id);
      if (!order) {
        sendEvent({ error: "Order not found" });
        safeClose(controller);
        return;
      }

      sendEvent({ type: "connected", order });
      let lastStatus = order.status;

      interval = setInterval(() => {
        const current = getOrder(params.id);
        if (!current) { safeClose(controller); return; }
        if (current.status !== lastStatus) {
          lastStatus = current.status;
          sendEvent({ type: "status_update", order: current });
        }
        if (current.status === "DELIVERED") {
          sendEvent({ type: "delivered", order: current });
          safeClose(controller);
        }
      }, 3000);

      request.signal.addEventListener("abort", () => safeClose(controller));
    },
    cancel() {
      closed = true;
      if (interval) { clearInterval(interval); interval = null; }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
