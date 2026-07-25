import { NextResponse } from "next/server";
import {
  getAllOffers,
  saveOffer,
  toggleOfferStatus,
  deleteOffer,
  validateCoupon,
  verifyAdminToken,
} from "@/lib/admin-db";

export async function GET() {
  try {
    const offers = getAllOffers(false); // get only active offers for public customer site
    return NextResponse.json(offers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, token, ...data } = body;

    // Validation action from customer checkout (No admin token required)
    if (action === "validateCoupon") {
      const { code, phone, deviceId, cartTotal } = data;
      const result = validateCoupon(code || "", phone || "", deviceId || "", Number(cartTotal) || 0);
      return NextResponse.json(result);
    }

    // All admin management actions require valid token
    if (!token) {
      return NextResponse.json({ error: "Unauthorized access token missing" }, { status: 401 });
    }

    const session = verifyAdminToken(token);
    if (!session) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    if (action === "getAdminOffers") {
      const offers = getAllOffers(true);
      return NextResponse.json(offers);
    }

    if (action === "saveOffer") {
      const offers = saveOffer(data);
      return NextResponse.json(offers);
    }

    if (action === "toggleOffer") {
      const offers = toggleOfferStatus(data.id);
      return NextResponse.json(offers);
    }

    if (action === "deleteOffer") {
      const offers = deleteOffer(data.id);
      return NextResponse.json(offers);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
