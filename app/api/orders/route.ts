import { NextResponse } from "next/server";
import { createOrder, getAllOrders } from "@/lib/admin-db";
import { sendAdminOrderNotificationEmail } from "@/lib/email-service";

export async function GET() {
  try {
    const orders = getAllOrders();
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.phone || !body.address) {
      return NextResponse.json(
        { success: false, error: "Missing required order fields" },
        { status: 400 }
      );
    }

    // Save order into SQLite database
    const newOrder = createOrder({
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      paymentMethod: body.paymentMethod || "UPI",
      items: body.items || body.cartItems || [],
      subtotal: body.subtotal || 0,
      gst: body.gst || 0,
      deliveryCharge: body.deliveryCharge !== undefined ? body.deliveryCharge : 0,
      total: body.grandTotal || body.total || 0,
      status: "Received",
      couponCode: body.couponCode || "",
      deviceId: body.deviceId || "",
    });

    // Send instant Email alert to Admin
    sendAdminOrderNotificationEmail({
      order: {
        id: newOrder.id,
        customerName: body.customerName,
        phone: body.phone,
        address: body.address,
        items: body.items || body.cartItems || [],
        subtotal: body.subtotal || 0,
        gst: body.gst || 0,
        deliveryCharge: body.deliveryCharge || 0,
        grandTotal: body.grandTotal || body.total || 0,
        paymentMethod: body.paymentMethod || "UPI",
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      order: newOrder,
    });
  } catch (error: any) {
    console.error("Order API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create order",
      },
      {
        status: 500,
      }
    );
  }
}