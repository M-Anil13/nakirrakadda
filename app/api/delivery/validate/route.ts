import { NextRequest, NextResponse } from "next/server";
import { getDeliveryConfig } from "@/lib/kirraak-db";

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(request: NextRequest) {
  try {
    const { lat, lng } = await request.json();

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const config = getDeliveryConfig();
    const distance = calculateDistance(config.store_lat, config.store_lng, lat, lng);

    let zone: "free" | "chargeable" | "out_of_range" = "out_of_range";
    let deliveryFee = 0;
    let message = "";

    if (distance <= config.free_delivery_radius_km) {
      zone = "free";
      deliveryFee = 0;
      message = "Free delivery available!";
    } else if (distance <= config.chargeable_radius_end_km) {
      zone = "chargeable";
      // Parse delivery fees JSON and calculate fee based on distance
      try {
        const fees = JSON.parse(config.delivery_fees_json);
        for (const [range, fee] of Object.entries(fees)) {
          const [min, max] = range.split("-").map(Number);
          if (distance > min && distance <= max) {
            deliveryFee = fee as number;
            break;
          }
        }
      } catch (e) {
        // Fallback fee if JSON parsing fails
        deliveryFee = 50;
      }
      message = `Delivery fee: ₹${deliveryFee}`;
    } else {
      zone = "out_of_range";
      message = "Address bahar hai delivery zone ke";
    }

    return NextResponse.json({
      inZone: zone !== "out_of_range",
      zone,
      distance: Math.round(distance * 100) / 100,
      deliveryFee,
      message,
    });
  } catch (error: any) {
    console.error("Delivery validation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
