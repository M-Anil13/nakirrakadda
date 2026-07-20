import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Order ID required" }, { status: 400 });
  }

  const orderRef = doc(db, "orders", id);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(orderSnap.data());
}