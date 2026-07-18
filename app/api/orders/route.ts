import { NextResponse } from "next/server";
import { incrementOnlineOrders, getOnlineOrders, getOrdersServed } from "../../../lib/orders-db";

export async function GET() {
  return NextResponse.json({ offlineCount: getOrdersServed(), onlineCount: getOnlineOrders() });
}

export async function POST() {
  return NextResponse.json({ offlineCount: getOrdersServed(), onlineCount: incrementOnlineOrders() });
}
