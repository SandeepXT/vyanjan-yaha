import { NextRequest, NextResponse } from "next/server";
import { createOrder, getAllOrders, getOrdersByUser, validatePlaceOrderPayload } from "@/lib/store";
import { ApiResponse, Order, PlaceOrderPayload } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  const orders = userId ? getOrdersByUser(userId) : getAllOrders();
  const response: ApiResponse<Order[]> = { success: true, data: orders };
  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const errors = validatePlaceOrderPayload(body);
    if (errors.length > 0) {
      return NextResponse.json({ success: false, error: "Validation failed", details: errors }, { status: 400 });
    }
    const { userId, ...orderPayload } = body as PlaceOrderPayload & { userId?: string };
    const order = createOrder(orderPayload as PlaceOrderPayload, userId);
    const response: ApiResponse<Order> = {
      success: true,
      data: order,
      message: "Order placed successfully! Khana ban raha hai 🍽️",
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to process order. Please try again." }, { status: 500 });
  }
}
