import { NextResponse } from "next/server";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sendOrderEmail } from "@/lib/email";
import { sendOrderSMS } from "@/lib/sms";

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

    await addDoc(collection(db, "orders"), {
      orderId,
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      paymentMethod: body.paymentMethod,
      cartItems: body.cartItems,
      grandTotal: body.grandTotal,
      status: "Received",
      createdAt: new Date(),
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