import { NextResponse } from "next/server";
import { readFileSync, existsSync, readdirSync } from "fs";
import path from "path";

const SHARED_DIR = "/home/calo/.openclaw/shared";

export const dynamic = "force-dynamic";

interface EmailSummary {
  date: string;
  period: "AM" | "PM";
  file: string;
  flags: string[];
  total: number;
  urgent: string[];
}

function parseEmailSummary(raw: string): { flags: string[]; total: number; urgent: string[] } {
  const flags: string[] = [];
  const urgent: string[] = [];
  let total = 0;

  const lines = raw.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("---")) continue;
    if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      const text = trimmed.replace(/^[-*]+\s*/, "").replace(/\*\*/g, "").trim();
      if (text.length > 10 && text.length < 200) {
        flags.push(text);
        if (
          text.toLowerCase().includes("urgent") ||
          text.toLowerCase().includes("press") ||
          text.toLowerCase().includes("investor") ||
          text.toLowerCase().includes("enterprise")
        ) {
          urgent.push(text);
        }
      }
    }
    // Count emails
    const countMatch = trimmed.match(/(\d+)\s*(?:emails?|messages?)/i);
    if (countMatch) total = parseInt(countMatch[1]);
  }

  return { flags, total, urgent };
}

export async function GET() {
  try {
    const dir = path.join(SHARED_DIR, "communications");
    if (!existsSync(dir)) return NextResponse.json({ summaries: [], total: 0 });

    const files = readdirSync(dir)
      .filter((f) => /^email_summary_\d{4}-\d{2}-\d{2}-(AM|PM)\.json$/.test(f))
      .sort()
      .reverse()
      .slice(0, 10);

    const summaries: EmailSummary[] = [];
    for (const file of files) {
      const full = path.join(dir, file);
      try {
        const raw = readFileSync(full, "utf-8");
        const parsed = JSON.parse(raw);
        const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})-(AM|PM)/);
        summaries.push({
          date: dateMatch ? dateMatch[1] : file,
          period: dateMatch ? (dateMatch[2] as "AM" | "PM") : "AM",
          file,
          flags: parsed.flags ?? [],
          total: parsed.total ?? 0,
          urgent: parsed.urgent ?? [],
        });
      } catch {
        // malformed JSON — skip
      }
    }

    // Also try markdown files
    const mdFiles = readdirSync(dir)
      .filter((f) => /^email_summary_\d{4}-\d{2}-\d{2}-(AM|PM)\.md$/.test(f))
      .sort()
      .reverse()
      .slice(0, 5);

    for (const file of mdFiles) {
      const full = path.join(dir, file);
      const raw = readFileSync(full, "utf-8");
      const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})-(AM|PM)/);
      const { flags, total, urgent } = parseEmailSummary(raw);
      if (flags.length > 0) {
        summaries.push({
          date: dateMatch ? dateMatch[1] : file,
          period: dateMatch ? (dateMatch[2] as "AM" | "PM") : "AM",
          file,
          flags,
          total,
          urgent,
        });
      }
    }

    summaries.sort((a, b) => b.date.localeCompare(a.date));
    return NextResponse.json({ summaries: summaries.slice(0, 10), total: summaries.length });
  } catch (err) {
    return NextResponse.json({ error: String(err), summaries: [] }, { status: 200 });
  }
}
