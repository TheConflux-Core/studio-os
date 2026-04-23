import { NextResponse } from "next/server";
import { readFileSync, existsSync, readdirSync } from "fs";
import path from "path";

const SHARED_DIR = "/home/calo/.openclaw/shared";

export const dynamic = "force-dynamic";

interface SecurityFinding {
  source: "aegis" | "viper";
  date: string;
  title: string;
  status: "clean" | "warning" | "critical";
  severity?: "low" | "medium" | "high" | "critical";
  items: string[];
  rawFile: string;
}

function readSecurityFiles(dir: string, pattern: RegExp, source: "aegis" | "viper"): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  try {
    if (!existsSync(dir)) return [];
    const files = readdirSync(dir).filter((f) => pattern.test(f)).sort().reverse().slice(0, 7);
    for (const file of files) {
      const full = path.join(dir, file);
      const raw = readFileSync(full, "utf-8");
      const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
      const date = dateMatch ? dateMatch[1] : file;

      const isClean = raw.toLowerCase().includes("clean") || raw.toLowerCase().includes("no issues");
      const hasCritical = raw.toLowerCase().includes("critical") || raw.toLowerCase().includes("exposure") || raw.toLowerCase().includes("live key found");

      let status: SecurityFinding["status"] = "clean";
      if (hasCritical) status = "critical";
      else if (!isClean) status = "warning";

      // Extract key items
      const items: string[] = [];
      const lines = raw.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (
          trimmed &&
          !trimmed.startsWith("#") &&
          !trimmed.startsWith("---") &&
          trimmed.length > 20 &&
          trimmed.length < 200 &&
          (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("**"))
        ) {
          items.push(trimmed.replace(/^[-*]+\s*/, "").replace(/\*\*/g, ""));
          if (items.length >= 6) break;
        }
      }

      findings.push({
        source,
        date,
        title: source === "aegis"
          ? `Aegis Security Scan — ${date}`
          : `Viper Offensive Scan — ${date}`,
        status,
        severity: hasCritical ? "critical" : isClean ? "low" : "medium",
        items,
        rawFile: file,
      });
    }
  } catch { /* graceful */ }
  return findings;
}

export async function GET() {
  try {
    const aegisFindings = readSecurityFiles(
      path.join(SHARED_DIR, "security", "audits"),
      /^overnight-\d{4}-\d{2}-\d{2}\.md$|^daily-\d{4}-\d{2}-\d{2}\.md$/,
      "aegis"
    );

    const viperFindings = readSecurityFiles(
      path.join(SHARED_DIR, "security", "findings"),
      /^viper-\d{4}-\d{2}-\d{2}\.md$/,
      "viper"
    );

    const all = [...aegisFindings, ...viperFindings].sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({ findings: all, total: all.length });
  } catch (err) {
    return NextResponse.json({ error: String(err), findings: [] }, { status: 200 });
  }
}
