import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/auth-store";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  const user = getUserById(userId);
  if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: user });
}
