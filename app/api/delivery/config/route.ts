import { NextRequest, NextResponse } from "next/server";
import { getDeliveryConfig, updateDeliveryConfig } from "@/lib/kirraak-db";
import { verifyAdminToken } from "@/lib/admin-db";

export async function GET() {
  try {
    const config = getDeliveryConfig();
    return NextResponse.json({
      storeLocation: {
        lat: config.store_lat,
        lng: config.store_lng,
        address: config.store_address,
      },
      freeRadiusKm: config.free_delivery_radius_km,
      chargeableRadiusStartKm: config.chargeable_radius_start_km,
      chargeableRadiusEndKm: config.chargeable_radius_end_km,
      gstRate: config.gst_rate,
      packagingFee: config.packaging_fee,
      minOrderValue: config.min_order_value,
      deliveryFees: JSON.parse(config.delivery_fees_json),
    });
  } catch (error: any) {
    console.error("Delivery config fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || "";
    const admin = verifyAdminToken(token);

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized / Access denied - admin only" }, { status: 403 });
    }

    const updates = await request.json();
    const updatePayload: any = {};

    if (updates.storeLocation) {
      updatePayload.store_lat = updates.storeLocation.lat;
      updatePayload.store_lng = updates.storeLocation.lng;
      updatePayload.store_address = updates.storeLocation.address;
    }
    if (updates.freeRadiusKm !== undefined) updatePayload.free_delivery_radius_km = updates.freeRadiusKm;
    if (updates.chargeableRadiusStartKm !== undefined) updatePayload.chargeable_radius_start_km = updates.chargeableRadiusStartKm;
    if (updates.chargeableRadiusEndKm !== undefined) updatePayload.chargeable_radius_end_km = updates.chargeableRadiusEndKm;
    if (updates.gstRate !== undefined) updatePayload.gst_rate = updates.gstRate;
    if (updates.packagingFee !== undefined) updatePayload.packaging_fee = updates.packagingFee;
    if (updates.minOrderValue !== undefined) updatePayload.min_order_value = updates.minOrderValue;
    if (updates.deliveryFees) updatePayload.delivery_fees_json = JSON.stringify(updates.deliveryFees);

    const updated = updateDeliveryConfig(updatePayload);

    return NextResponse.json({
      storeLocation: {
        lat: updated.store_lat,
        lng: updated.store_lng,
        address: updated.store_address,
      },
      freeRadiusKm: updated.free_delivery_radius_km,
      chargeableRadiusStartKm: updated.chargeable_radius_start_km,
      chargeableRadiusEndKm: updated.chargeable_radius_end_km,
      gstRate: updated.gst_rate,
      packagingFee: updated.packaging_fee,
      minOrderValue: updated.min_order_value,
      deliveryFees: JSON.parse(updated.delivery_fees_json),
    });
  } catch (error: any) {
    console.error("Delivery config update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
