import { NextResponse } from "next/server";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sendOrderEmail } from "@/lib/email";
import { sendOrderSMS } from "@/lib/sms";
import { createOrder } from "@/lib/admin-db";

export async function GET() {
  const snapshot = await getDocs(collection(db, "orders"));

  return NextResponse.json({
    offlineCount: 200,
    onlineCount: snapshot.size,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Create unique Order ID
    const orderId = Date.now().toString();

    // Save Order to Firestore
    await addDoc(collection(db, "orders"), {
      orderId,

      // Customer Details
      customerName: body.customerName,
      phone: body.phone,

      // Address & Payment
      address: body.address,
      paymentMethod: body.paymentMethod,

      // Order Details
      cartItems: body.cartItems,
      grandTotal: body.grandTotal,

      // Status
      status: "Received",
      createdAt: new Date(),
    });

    // Save Order to local database
    createOrder({
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      paymentMethod: body.paymentMethod,
      items: body.cartItems,
      total: body.grandTotal,
      status: "Received",
    });

    const order = {
      ...body,
      id: orderId,
      orderId,
      status: "Received",
    };

    // Send Email
    await sendOrderEmail(order);

    // Send SMS
    await sendOrderSMS(order);

    return NextResponse.json({
      success: true,
      orderId,
    });
  } catch (error) {
    console.error("Order API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}