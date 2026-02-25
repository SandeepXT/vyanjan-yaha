import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/store";
import { ApiResponse, Order } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = getOrder(params.id);

  if (!order) {
    const response: ApiResponse<null> = {
      success: false,
      error: `Order '${params.id}' not found`,
    };
    return NextResponse.json(response, { status: 404 });
  }

  const response: ApiResponse<Order> = {
    success: true,
    data: order,
  };

  return NextResponse.json(response);
}
