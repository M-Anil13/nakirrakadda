import { NextResponse } from "next/server";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const phone = body.phone?.trim();
    const orderId = body.orderId?.trim();

    const q = query(
      collection(db, "orders"),
      where("phone", "==", phone),
      where("orderId", "==", orderId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({
        success: false,
        message: "Order not found",
      });
    }

    const order = snapshot.docs[0].data();

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}