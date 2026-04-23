import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";

const PIPELINE_PATH = "/home/calo/.openclaw/shared/infra/pipeline-status.md";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!existsSync(PIPELINE_PATH)) {
      return NextResponse.json({ status: "unknown", platforms: [], lastChecked: null, error: "No pipeline report yet" });
    }

    const raw = readFileSync(PIPELINE_PATH, "utf-8");

    // Parse platform table from markdown
    const platformLines: { name: string; status: "pass" | "fail" | "unknown"; notes: string }[] = [];
    const tableMatch = raw.match(/\|\s*Platform\s*\|.*?\n\|[-|\s]+\|\n((?:\|.*?\n)*)/);
    if (tableMatch) {
      const rows = tableMatch[1].trim().split("\n");
      for (const row of rows) {
        const cells = row.split("|").map((c) => c.trim()).filter(Boolean);
        if (cells.length >= 2) {
          const name = cells[0];
          const statusCell = cells[1];
          const notes = cells[2] ?? "";
          const status: "pass" | "fail" | "unknown" =
            statusCell.includes("PASS") || statusCell.includes("✅")
              ? "pass"
              : statusCell.includes("FAIL") || statusCell.includes("❌")
              ? "fail"
              : "unknown";
          platformLines.push({ name, status, notes });
        }
      }
    }

    // Parse last checked time
    const checkedMatch = raw.match(/\*\*Checked:\*\* ([^\n]+)/);
    const lastChecked = checkedMatch ? checkedMatch[1] : null;

    // Parse overall status
    const hasFailure = platformLines.some((p) => p.status === "fail");
    const status = hasFailure ? "degraded" : platformLines.length > 0 ? "healthy" : "unknown";

    return NextResponse.json({ status, platforms: platformLines, lastChecked, raw: raw.slice(0, 500) });
  } catch (err) {
    return NextResponse.json({ error: String(err), status: "unknown", platforms: [] }, { status: 200 });
  }
}
