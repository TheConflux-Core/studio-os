import { NextResponse } from "next/server";
import { readFileSync, existsSync, readdirSync } from "fs";
import path from "path";

const SHARED_DIR = "/home/calo/.openclaw/shared";

export const dynamic = "force-dynamic";

interface GrowthSnapshot {
  date: string;
  file: string;
  daus?: number;
  signups?: number;
  churn?: number;
  productHunt?: { upvotes: number; comments: number; position: number };
  socialMentions?: number;
  highlights: string[];
}

function parseGrowthFile(raw: string): GrowthSnapshot["highlights"] {
  const highlights: string[] = [];
  const lines = raw.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("---") &&
      trimmed.length > 15 &&
      trimmed.length < 200 &&
      (trimmed.startsWith("-") || trimmed.startsWith("*") || /^\d/.test(trimmed))
    ) {
      highlights.push(trimmed.replace(/^[-*\d.)\s]+/, "").slice(0, 150));
      if (highlights.length >= 6) break;
    }
  }
  return highlights;
}

export async function GET() {
  try {
    const dir = path.join(SHARED_DIR, "growth");
    if (!existsSync(dir)) return NextResponse.json({ snapshots: [], total: 0 });

    const files = readdirSync(dir)
      .filter((f) => /^daily-\d{4}-\d{2}-\d{2}\.md$/.test(f))
      .sort()
      .reverse()
      .slice(0, 7);

    const snapshots: GrowthSnapshot[] = [];
    for (const file of files) {
      const full = path.join(dir, file);
      const raw = readFileSync(full, "utf-8");
      const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
      const phMatch = raw.match(/Product Hunt.*?(\d+)\s*(?:upvotes|votes).*?(\d+)\s*comments/i);

      snapshots.push({
        date: dateMatch ? dateMatch[1] : file,
        file,
        highlights: parseGrowthFile(raw),
        productHunt: phMatch
          ? {
              upvotes: parseInt(phMatch[1]),
              comments: parseInt(phMatch[2]),
              position: 0,
            }
          : undefined,
      });
    }

    return NextResponse.json({ snapshots, total: snapshots.length });
  } catch (err) {
    return NextResponse.json({ error: String(err), snapshots: [] }, { status: 200 });
  }
}
