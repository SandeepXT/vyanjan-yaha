import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth-store";
import { RegisterPayload } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RegisterPayload;
    const result = registerUser(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.user }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
