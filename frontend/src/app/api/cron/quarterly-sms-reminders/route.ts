import { NextResponse } from "next/server";

import { runQuarterlySmsReminders } from "@/lib/quarterly-sms-reminders";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorizeCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/** Daily job: send quarterly deadline SMS at 30, 14, 7, and 1 days before each user's due date. */
export async function GET(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runQuarterlySmsReminders();
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reminder job failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
