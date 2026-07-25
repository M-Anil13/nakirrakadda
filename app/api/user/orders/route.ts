import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createOrder, getUserOrders, getOrder, getUserById, getOrderStatusHistory } from "@/lib/kirraak-db";

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

    const orderId = request.nextUrl.searchParams.get("id");

    if (orderId) {
      // Fetch single order
      const order = getOrder(orderId);
      if (!order || order.user_id !== decoded.id) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const statusHistory = getOrderStatusHistory(orderId);

      return NextResponse.json({
        id: order.id,
        subtotal: order.subtotal,
        gst: order.gst,
        packagingFee: order.packaging_fee,
        deliveryFee: order.delivery_fee,
        discount: order.discount,
        total: order.total,
        status: order.order_status,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        createdAt: order.created_at,
        statusHistory: statusHistory.map((h) => ({
          status: h.status,
          changedAt: h.changed_at,
        })),
      });
    }

    // Fetch all orders for user
    const orders = getUserOrders(decoded.id);
    return NextResponse.json(
      orders.map((order) => ({
        id: order.id,
        subtotal: order.subtotal,
        gst: order.gst,
        packagingFee: order.packaging_fee,
        deliveryFee: order.delivery_fee,
        discount: order.discount,
        total: order.total,
        status: order.order_status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
      }))
    );
  } catch (error: any) {
    console.error("Orders fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = verifyToken(request.headers.get("authorization"));
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { addressId, items, subtotal, gst, packagingFee, deliveryFee, discount, paymentMethod } = await request.json();

    if (!addressId || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const total = subtotal + gst + packagingFee + deliveryFee - discount;

    const order = createOrder({
      user_id: decoded.id,
      address_id: addressId,
      subtotal,
      gst,
      packaging_fee: packagingFee,
      delivery_fee: deliveryFee,
      discount,
      total,
      payment_status: "pending",
      order_status: "received",
      payment_method: paymentMethod || "cash",
      paytm_order_id: null,
    });

    return NextResponse.json({
      id: order.id,
      subtotal: order.subtotal,
      gst: order.gst,
      packagingFee: order.packaging_fee,
      deliveryFee: order.delivery_fee,
      discount: order.discount,
      total: order.total,
      status: order.order_status,
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
