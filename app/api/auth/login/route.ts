import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/auth-store";
import { LoginPayload } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LoginPayload;
    const result = loginUser(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }
    return NextResponse.json({ success: true, data: result.user });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
