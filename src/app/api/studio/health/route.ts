import { NextResponse } from "next/server";
import { computeOrgHealth } from "@/lib/canonicalState";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = computeOrgHealth();
    return NextResponse.json(health);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
