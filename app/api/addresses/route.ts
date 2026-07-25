import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getUserAddresses, createAddress, updateAddress, setDefaultAddress, getUserById } from "@/lib/kirraak-db";

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
    const decoded = verifyToken(request.headers.get("authorization"));
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = getUserAddresses(decoded.id);
    return NextResponse.json(
      addresses.map((addr) => ({
        id: addr.id,
        label: addr.label,
        lat: addr.lat,
        lng: addr.lng,
        address: addr.formatted_address,
        isDefault: addr.is_default,
      }))
    );
  } catch (error: any) {
    console.error("Addresses fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = verifyToken(request.headers.get("authorization"));
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { label, lat, lng, address } = await request.json();

    if (!label || typeof lat !== "number" || typeof lng !== "number" || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newAddr = createAddress(decoded.id, label, lat, lng, address);
    return NextResponse.json({
      id: newAddr.id,
      label: newAddr.label,
      lat: newAddr.lat,
      lng: newAddr.lng,
      address: newAddr.formatted_address,
      isDefault: newAddr.is_default,
    });
  } catch (error: any) {
    console.error("Address creation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const decoded = verifyToken(request.headers.get("authorization"));
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, label, address, setAsDefault } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 });
    }

    if (setAsDefault) {
      setDefaultAddress(id, decoded.id);
    }

    if (label || address) {
      const updated = updateAddress(id, decoded.id, label, address);
      if (!updated) {
        return NextResponse.json({ error: "Address not found" }, { status: 404 });
      }
      return NextResponse.json({
        id: updated.id,
        label: updated.label,
        lat: updated.lat,
        lng: updated.lng,
        address: updated.formatted_address,
        isDefault: updated.is_default,
      });
    }

    return NextResponse.json({ message: "Address updated" });
  } catch (error: any) {
    console.error("Address update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
