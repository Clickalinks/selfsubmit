import { NextResponse } from "next/server";

import { runDeadlineReminders } from "@/lib/deadline-reminders";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorizeCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/** Daily job: monthly SMS + quarterly SMS/email at 5 and 1 days before each deadline. */
export async function GET(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runDeadlineReminders();
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reminder job failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
