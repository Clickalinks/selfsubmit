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
      userAgent: a.userAgent,
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

/**
 * Accepts:
 * - { notificationIds: string[] } — mark those ids read (must belong to caller)
 * - { id: string } — mark one id read (must belong to caller)
 * - {} or { notificationIds: [] } omitted — mark all unread for caller
 * Returns 404 when specific ids were requested but none belonged to the caller.
 */
function parseMarkReadBody(body: unknown): { mode: "all" } | { mode: "ids"; ids: string[] } | { error: string } {
  if (body === null || typeof body !== "object") {
    return { error: "Invalid request body." };
  }
  const obj = body as { id?: unknown; notificationIds?: unknown };

  if (obj.notificationIds !== undefined) {
    if (!Array.isArray(obj.notificationIds)) {
      return { error: "notificationIds must be an array of non-empty strings when provided." };
    }
    if (!obj.notificationIds.every((id) => typeof id === "string" && id.length > 0)) {
      return { error: "notificationIds must be an array of non-empty strings when provided." };
    }
    if (obj.notificationIds.length === 0) {
      return { mode: "all" };
    }
    return { mode: "ids", ids: obj.notificationIds };
  }

  if (obj.id !== undefined) {
    if (typeof obj.id !== "string" || obj.id.length === 0) {
      return { error: "id must be a non-empty string when provided." };
    }
    return { mode: "ids", ids: [obj.id] };
  }

  return { mode: "all" };
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

  const parsed = parseMarkReadBody(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (parsed.mode === "all") {
    await markSecurityNotificationsRead(userId);
    return NextResponse.json({ ok: true });
  }

  const { count } = await markSecurityNotificationsRead(userId, parsed.ids);
  if (count === 0) {
    return NextResponse.json({ error: "Notification not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, updated: count });
}
