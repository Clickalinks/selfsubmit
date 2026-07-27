import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { requireSecureAdminApi } from "@/lib/admin-auth";
import { apiAuthErrorResponse, clientMetaFromRequest } from "@/lib/api-auth";
import { API_RATE_LIMITS, rateLimitOrNull } from "@/lib/api-rate-limit";
import { writeAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSecureAdminApi();
    const limited = await rateLimitOrNull("admin", session.userId, API_RATE_LIMITS.admin);
    if (limited) return limited;

    const [userCount, businessCount, submissionCount, recentAudit] = await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.submission.count(),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 25,
        select: {
          id: true,
          action: true,
          resource: true,
          resourceId: true,
          userId: true,
          actorRole: true,
          ipAddress: true,
          createdAt: true,
        },
      }),
    ]);

    const meta = clientMetaFromRequest(req);
    await writeAuditLog({
      userId: session.userId,
      actorRole: session.role,
      action: "admin.action",
      resource: "admin_overview",
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      metadata: { view: "overview" },
    });

    return NextResponse.json({
      stats: { userCount, businessCount, submissionCount },
      recentAudit,
      role: session.role,
    });
  } catch (err) {
    return apiAuthErrorResponse(err);
  }
}
