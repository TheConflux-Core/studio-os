import { NextResponse } from "next/server";
import { getDecisions } from "@/lib/canonicalState";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const decisions = getDecisions(20);
    return NextResponse.json(decisions);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
