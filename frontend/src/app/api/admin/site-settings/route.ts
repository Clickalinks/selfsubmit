import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { requireSecureAdminApi } from "@/lib/admin-auth";
import { apiAuthErrorResponse, clientMetaFromRequest } from "@/lib/api-auth";
import { API_RATE_LIMITS, rateLimitOrNull } from "@/lib/api-rate-limit";
import { writeAuditLog } from "@/lib/audit-log";
import { getSiteSettings, upsertSiteSettings, type AnnouncementSeverity } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

const SEVERITIES = new Set<AnnouncementSeverity>(["info", "warning", "maintenance"]);

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch (err) {
    return apiAuthErrorResponse(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireSecureAdminApi();
    const limited = await rateLimitOrNull("admin", session.userId, API_RATE_LIMITS.admin);
    if (limited) return limited;

    const body = (await req.json()) as {
      announcementEnabled?: unknown;
      announcementMessage?: unknown;
      announcementSeverity?: unknown;
      maintenanceMode?: unknown;
      maintenanceUntil?: unknown;
    };

    const announcementEnabled = Boolean(body.announcementEnabled);
    const maintenanceMode = Boolean(body.maintenanceMode);
    const announcementMessage =
      typeof body.announcementMessage === "string" ? body.announcementMessage.slice(0, 2000) : null;
    const severityRaw = typeof body.announcementSeverity === "string" ? body.announcementSeverity : "info";
    const announcementSeverity: AnnouncementSeverity = SEVERITIES.has(severityRaw as AnnouncementSeverity)
      ? (severityRaw as AnnouncementSeverity)
      : "info";

    let maintenanceUntil: Date | null = null;
    if (typeof body.maintenanceUntil === "string" && body.maintenanceUntil.trim()) {
      const parsed = new Date(body.maintenanceUntil);
      if (!Number.isNaN(parsed.getTime())) maintenanceUntil = parsed;
    }

    if (announcementEnabled && !announcementMessage?.trim()) {
      return NextResponse.json({ error: "Announcement message is required when enabled." }, { status: 400 });
    }

    const settings = await upsertSiteSettings({
      announcementEnabled,
      announcementMessage,
      announcementSeverity,
      maintenanceMode,
      maintenanceUntil,
      updatedByUserId: session.userId,
    });

    const meta = clientMetaFromRequest(req);
    await writeAuditLog({
      userId: session.userId,
      actorRole: session.role,
      action: "admin.action",
      resource: "site_settings",
      resourceId: "default",
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      metadata: {
        announcementEnabled: settings.announcementEnabled,
        maintenanceMode: settings.maintenanceMode,
        announcementSeverity: settings.announcementSeverity,
      },
    });

    return NextResponse.json(settings);
  } catch (err) {
    return apiAuthErrorResponse(err);
  }
}
