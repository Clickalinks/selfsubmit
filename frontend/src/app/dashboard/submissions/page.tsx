import type { Metadata } from "next";

import { DashboardCard } from "@/components/dashboard/DashboardCard";

export const metadata: Metadata = {
  title: "Submissions — SelfSubmit",
};

export default function SubmissionsPage() {
  return (
    <DashboardCard title="Submission history" description="Filter and search your past submissions.">
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                No submissions yet. Your history will appear here after you file returns.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
