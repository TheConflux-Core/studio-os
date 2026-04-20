import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import path from "path";

const SHARED_DIR = "/home/calo/.openclaw/shared";

interface Mission {
  mission_id: string;
  title: string;
  status: string;
  owner?: string;
  progress?: number;
  due_date?: string;
  blockers?: string[];
  updated_at: string;
}

function readMission(id: string): Mission | null {
  try {
    const p = path.join(SHARED_DIR, "missions", `${id}.json`);
    if (!existsSync(p)) return null;
    return JSON.parse(readFileSync(p, "utf-8")) as Mission;
  } catch {
    return null;
  }
}

export async function GET() {
  const now = new Date();
  const q2Start = new Date("2026-04-01");
  const q2End = new Date("2026-06-30");
  const launchDate = new Date("2026-05-22");
  const securityDue = new Date("2026-04-30");
  const auditDue = new Date("2026-05-15");

  const q2DaysTotal = Math.round((q2End.getTime() - q2Start.getTime()) / (1000 * 60 * 60 * 24));
  const q2DaysRemaining = Math.max(0, Math.round((q2End.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const q2DaysPassed = q2DaysTotal - q2DaysRemaining;
  const q2Progress = Math.round((q2DaysPassed / q2DaysTotal) * 100);
  const launchDaysRemaining = Math.max(0, Math.round((launchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const securityDaysRemaining = Math.max(0, Math.round((securityDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const securityProgress = Math.min(100, Math.round(((30 - securityDaysRemaining) / 30) * 100));
  const auditDaysRemaining = Math.max(0, Math.round((auditDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const auditProgress = Math.min(100, Math.round(((14 - auditDaysRemaining) / 14) * 100));

  // Read mission-1224 for real security progress
  const mission1224 = readMission("mission-1224");
  const securityProgressReal = mission1224?.progress ?? securityProgress;

  // Revenue from portfolio state
  let revenue = 0;
  let betaUsers = 0;
  let paidUsers = 0;
  try {
    const portfolioPath = path.join(SHARED_DIR, "portfolio", "portfolio.json");
    if (existsSync(portfolioPath)) {
      const portfolio = JSON.parse(readFileSync(portfolioPath, "utf-8"));
      revenue = portfolio.total_revenue ?? 0;
      betaUsers = portfolio.beta_users ?? 0;
      paidUsers = portfolio.paid_users ?? 0;
    }
  } catch { /* pre-launch */ }

  return NextResponse.json({
    q2DaysRemaining,
    q2DaysTotal,
    q2Progress,
    launchDaysRemaining,
    securityDaysRemaining,
    securityProgress: securityProgressReal,
    auditProgress,
    revenue,
    revenueTarget: 500,
    betaUsers,
    betaTarget: 50,
    paidUsers,
    paidTarget: 5,
  }, { status: 200 });
}
