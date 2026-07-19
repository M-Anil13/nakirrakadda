import { NextResponse } from "next/server";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import {
  incrementOnlineOrders,
  getOnlineOrders,
  getOrdersServed,
} from "../../../lib/orders-db";

export async function GET() {
  return NextResponse.json({
    offlineCount: getOrdersServed(),
    onlineCount: getOnlineOrders(),
  });
}

export async function POST(request: Request) {
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

  return NextResponse.json({
    offlineCount: getOrdersServed(),
    onlineCount: incrementOnlineOrders(),
  });
}
