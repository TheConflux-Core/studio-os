import { NextResponse } from "next/server";
import { readFileSync, existsSync, readdirSync } from "fs";
import path from "path";

const SHARED_DIR = "/home/calo/.openclaw/shared";

export const dynamic = "force-dynamic";

interface MorningBrief {
  date: string;
  file: string;
  content: string;
  highlights: string[];
  fundingRounds: string[];
  competitorNews: string[];
}

function parseBrief(raw: string): MorningBrief["highlights"] {
  const highlights: string[] = [];
  const lines = raw.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.startsWith("#") &&
      trimmed.length > 30 &&
      trimmed.length < 250 &&
      (trimmed.startsWith("-") || trimmed.startsWith("*") || /^\d/.test(trimmed))
    ) {
      highlights.push(trimmed.replace(/^[-*\d.)\s]+/, "").slice(0, 150));
      if (highlights.length >= 5) break;
    }
  }
  return highlights;
}

function extractFundingRounds(raw: string): string[] {
  const rounds: string[] = [];
  const patterns = [
    /([A-Z][a-zA-Z\s&]+) raised \$[\d.,]+(?:M|B) (?:series|seed|round|Series|Seed|Round)[^\n]*/gi,
    /\$[\d.,]+(?:M|B) (?:raised|raised by|for)[^\n]*/gi,
  ];
  for (const pat of patterns) {
    let m;
    while ((m = pat.exec(raw)) !== null && rounds.length < 4) {
      const cleaned = m[0].trim().slice(0, 120);
      if (cleaned.length > 20) rounds.push(cleaned);
    }
  }
  return rounds;
}

export async function GET() {
  try {
    const dir = path.join(SHARED_DIR, "intelligence", "reports");
    if (!existsSync(dir)) return NextResponse.json({ briefs: [], total: 0 });

    const files = readdirSync(dir)
      .filter((f) => /^(\d{4}-\d{2}-\d{2}|YYYY-MM-DD).*research.*\.md$/.test(f) || /^202\d-\d{2}-\d{2}.*\.md$/.test(f))
      .sort()
      .reverse()
      .slice(0, 5);

    const briefs: MorningBrief[] = [];
    for (const file of files) {
      const full = path.join(dir, file);
      const raw = readFileSync(full, "utf-8");
      const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
      briefs.push({
        date: dateMatch ? dateMatch[1] : file,
        file,
        content: raw.slice(0, 800),
        highlights: parseBrief(raw),
        fundingRounds: extractFundingRounds(raw),
        competitorNews: [],
      });
    }

    return NextResponse.json({ briefs, total: briefs.length });
  } catch (err) {
    return NextResponse.json({ error: String(err), briefs: [] }, { status: 200 });
  }
}
