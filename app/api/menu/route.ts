import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getAllMenuItems, getMenuItemsByCategory, getUserById } from "@/lib/kirraak-db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

function verifyToken(authHeader: string | null) {
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");

    let items: any[] = [];
    if (category) {
      items = getMenuItemsByCategory(category);
    } else {
      items = getAllMenuItems();
    }

    // Format response with FSSAI badge info
    const formattedItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      basePrice: item.base_price,
      category: item.category,
      imageUrl: item.image_url,
      isVeg: item.is_veg,
      fssaiBadge: item.is_veg ? "veg" : "non-veg",
      isBestseller: item.is_bestseller,
      isAvailable: item.is_available,
    }));

    return NextResponse.json(formattedItems);
  } catch (error: any) {
    console.error("Menu fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = verifyToken(request.headers.get("authorization"));
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = getUserById(decoded.id);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Access denied - admin only" }, { status: 403 });
    }

    const body = await request.json();
    // This would be implemented in the full admin dashboard
    // For now, it's a placeholder

    return NextResponse.json({ message: "Menu item creation - implement in admin dashboard" });
  } catch (error: any) {
    console.error("Menu creation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
