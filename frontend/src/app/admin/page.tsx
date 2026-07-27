import { AdminAnnouncementForm } from "@/components/admin/AdminAnnouncementForm";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/site-settings";
import { requireAdminPage } from "@/server/admin-guards";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  await requireAdminPage("/admin");

  const [settings, userCount, businessCount, submissionCount, recentAudit] = await Promise.all([
    getSiteSettings(),
    prisma.user.count(),
    prisma.business.count(),
    prisma.submission.count(),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        action: true,
        resource: true,
        userId: true,
        actorRole: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-600">
          Restricted console. Access requires an admin role, optional allowlist, and MFA.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Users", value: userCount },
          { label: "Businesses", value: businessCount },
          { label: "Monthly records", value: submissionCount },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <AdminAnnouncementForm
        initial={{
          announcementEnabled: settings.announcementEnabled,
          announcementMessage: settings.announcementMessage,
          announcementSeverity: settings.announcementSeverity,
          maintenanceMode: settings.maintenanceMode,
          maintenanceUntil: settings.maintenanceUntil
            ? settings.maintenanceUntil.toISOString()
            : null,
        }}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Recent audit events</h2>
        <p className="mt-1 text-sm text-slate-600">Append-only log of security and admin actions.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3 font-semibold">When</th>
                <th className="py-2 pr-3 font-semibold">Action</th>
                <th className="py-2 pr-3 font-semibold">Resource</th>
                <th className="py-2 pr-3 font-semibold">Role</th>
                <th className="py-2 font-semibold">User</th>
              </tr>
            </thead>
            <tbody>
              {recentAudit.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-slate-500">
                    No audit events yet.
                  </td>
                </tr>
              ) : (
                recentAudit.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 text-slate-800">
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {row.createdAt.toLocaleString("en-GB", { timeZone: "Europe/London" })}
                    </td>
                    <td className="py-2 pr-3 font-medium">{row.action}</td>
                    <td className="py-2 pr-3">{row.resource ?? "—"}</td>
                    <td className="py-2 pr-3">{row.actorRole ?? "—"}</td>
                    <td className="py-2 font-mono text-xs">{row.userId ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
