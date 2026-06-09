import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  getRecentLoginAttemptsForUser,
  getSecurityNotificationsForUser,
  markSecurityNotificationsRead,
} from "@/lib/login-protection";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [attempts, notifications] = await Promise.all([
    getRecentLoginAttemptsForUser(userId, 15),
    getSecurityNotificationsForUser(userId, 20),
  ]);

  return NextResponse.json({
    attempts: attempts.map((a) => ({
      id: a.id,
      success: a.success,
      suspicious: a.suspicious,
      ipAddress: a.ipAddress,
      failureReason: a.failureReason,
      createdAt: a.createdAt.toISOString(),
    })),
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount: notifications.filter((n) => !n.read).length,
  });
}

function parseNotificationIds(body: unknown): string[] | undefined | null {
  if (body === null || typeof body !== "object") return null;
  const ids = (body as { notificationIds?: unknown }).notificationIds;
  if (ids === undefined) return undefined;
  if (!Array.isArray(ids)) return null;
  if (!ids.every((id) => typeof id === "string" && id.length > 0)) return null;
  return ids;
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const notificationIds = parseNotificationIds(body);
  if (notificationIds === null) {
    return NextResponse.json(
      { error: "notificationIds must be an array of non-empty strings when provided." },
      { status: 400 },
    );
  }

  await markSecurityNotificationsRead(userId, notificationIds);
  return NextResponse.json({ ok: true });
}
