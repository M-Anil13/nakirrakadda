import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { amount } = await req.json();

  return NextResponse.json({
    success: true,
    amount,
    orderId: "demo_order_12345",
  });
}