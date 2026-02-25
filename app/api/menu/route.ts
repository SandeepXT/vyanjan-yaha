import { NextRequest, NextResponse } from "next/server";
import { menuItems } from "@/data/menu";
import { ApiResponse, MenuItem } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const cuisine = searchParams.get("cuisine");
  const veg = searchParams.get("veg");
  const search = searchParams.get("q");

  let items = [...menuItems];

  if (category && category !== "All") {
    items = items.filter((item) => item.category === category);
  }

  if (cuisine && cuisine !== "All") {
    items = items.filter((item) => item.cuisine === cuisine);
  }

  if (veg === "true") {
    items = items.filter((item) => item.isVeg);
  }

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }

  const response: ApiResponse<MenuItem[]> = {
    success: true,
    data: items,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
