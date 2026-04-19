import { NextResponse } from "next/server";
import { getMissions } from "@/lib/canonicalState";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const missions = getMissions();
    return NextResponse.json(missions);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
