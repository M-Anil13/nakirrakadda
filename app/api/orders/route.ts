import { NextResponse } from "next/server";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { sendOrderEmail } from "@/lib/email";

export async function GET() {
  return NextResponse.json({
    offlineCount: 200,
    onlineCount: 0,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    await addDoc(collection(db, "orders"), {
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      paymentMethod: body.paymentMethod,
      cartItems: body.cartItems,
      grandTotal: body.grandTotal,
      createdAt: new Date(),
    });
    
    await sendOrderEmail(body);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Order API Error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}