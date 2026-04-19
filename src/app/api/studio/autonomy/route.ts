import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const STATE_FILE = "/home/calo/.openclaw/shared/studio/studio_state.json";

// Mapping from dial positions to state values
const DIAL_TO_STATE: Record<string, { current_mode: string; studio_status: string }> = {
  supervised: { current_mode: "phase_1_controlled_factory", studio_status: "controlled" },
  oversight: { current_mode: "phase_1_controlled_factory", studio_status: "active" },
  delegated: { current_mode: "phase_2_delegated", studio_status: "active" },
  autonomous: { current_mode: "phase_3_autonomous", studio_status: "autonomous" },
};

export async function GET() {
  try {
    const raw = readFileSync(STATE_FILE, "utf-8");
    const state = JSON.parse(raw);
    return NextResponse.json({ mode: state.current_mode });
  } catch (e) {
    return NextResponse.json({ error: "Failed to read state" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { mode } = await req.json();
    if (!DIAL_TO_STATE[mode]) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    const raw = readFileSync(STATE_FILE, "utf-8");
    const state = JSON.parse(raw);

    const updates = DIAL_TO_STATE[mode];
    state.current_mode = updates.current_mode;
    state.studio_status = updates.studio_status;

    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    return NextResponse.json({ success: true, mode: state.current_mode });
  } catch (e) {
    return NextResponse.json({ error: "Failed to write state" }, { status: 500 });
  }
}