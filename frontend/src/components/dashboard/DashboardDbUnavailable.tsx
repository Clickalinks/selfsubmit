import Link from "next/link";

export function DashboardDbUnavailable() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">We could not load your dashboard</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          The database is temporarily unavailable. Wait a minute and try again. If this keeps happening, contact
          support at{" "}
          <a href="mailto:support@selfsubmit.co.uk" className="font-semibold text-brand-green hover:underline">
            support@selfsubmit.co.uk
          </a>
          .
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-brand-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-dark"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
