import { NextResponse } from "next/server";
import { getDineInTablesStatus } from "@/lib/admin-db";

export async function GET() {
  try {
    const data = getDineInTablesStatus();
    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch table statuses" },
      { status: 500 }
    );
  }
}
