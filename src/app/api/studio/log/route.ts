import { NextRequest, NextResponse } from "next/server";
import { readFileSync, appendFileSync, existsSync } from "fs";

const RUN_LOG_PATH = "/home/calo/.openclaw/shared/RUN_LOG.md";

const AGENT_NAMES: Record<string, string> = {
  vector: "Vector", zigbot: "ZigBot", viper: "Viper", aegis: "Aegis",
  prism: "Prism", spectra: "Spectra", luma: "Luma", catalyst: "Catalyst",
  forge: "Forge", quanta: "Quanta", pulse: "Pulse", helix: "Helix",
  lex: "Lex", ledger: "Ledger", bolt: "Bolt", sona: "Sona", vanta: "Vanta",
};

// Standard log format — matches what log_activity.py writes
function formatEntry(
  agentId: string,
  action: string,
  details: string,
  evidence?: string
): string {
  const now = new Date();
  const ts = now.toISOString().replace("T", " ").substring(0, 19);
  const agentName = AGENT_NAMES[agentId.toLowerCase()] ?? agentId;
  const evidenceLine = evidence ? ` | ${evidence}` : "";
  return `[${ts}] ${agentName} | ${action} | ${details}${evidenceLine}\n---\n`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, action, details, evidence } = body;

    if (!agentId || !action || !details) {
      return NextResponse.json(
        { error: "agentId, action, and details are required" },
        { status: 400 }
      );
    }

    const entry = formatEntry(agentId, action, details, evidence);

    if (!existsSync(RUN_LOG_PATH)) {
      // Touch the file first
      appendFileSync(RUN_LOG_PATH, "", "utf-8");
    }

    appendFileSync(RUN_LOG_PATH, entry, "utf-8");

    return NextResponse.json({ ok: true, entry }, { status: 200 });
  } catch (err) {
    console.error("[/api/studio/log]", err);
    return NextResponse.json({ error: "Failed to write to RUN_LOG" }, { status: 500 });
  }
}
