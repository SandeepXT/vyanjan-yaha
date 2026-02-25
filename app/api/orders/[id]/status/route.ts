import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus, getOrder } from "@/lib/store";
import { ApiResponse, Order, OrderStatus } from "@/lib/types";

const VALID_STATUSES: OrderStatus[] = [
  "ORDER_RECEIVED",
  "CONFIRMED",
  "PREPARING",
  "QUALITY_CHECK",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = getOrder(params.id);
  if (!order) {
    return NextResponse.json(
      { success: false, error: `Order '${params.id}' not found` },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status",
          validStatuses: VALID_STATUSES,
        },
        { status: 400 }
      );
    }

    if (order.status === "DELIVERED") {
      return NextResponse.json(
        { success: false, error: "Cannot update status of a delivered order" },
        { status: 409 }
      );
    }

    const updated = updateOrderStatus(params.id, status as OrderStatus);
    const response: ApiResponse<Order> = {
      success: true,
      data: updated!,
      message: `Status updated to ${status}`,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
