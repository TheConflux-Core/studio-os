import { NextResponse } from "next/server";
import { getStudioDashboard } from "@/lib/canonicalState";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = getStudioDashboard();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to read canonical state", detail: String(err) },
      { status: 500 }
    );
  }
}
