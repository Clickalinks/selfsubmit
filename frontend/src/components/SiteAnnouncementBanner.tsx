import { AlertTriangle, Info, Wrench } from "lucide-react";

import { getSiteSettings, type AnnouncementSeverity } from "@/lib/site-settings";

const STYLES: Record<AnnouncementSeverity, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  maintenance: "border-orange-300 bg-orange-50 text-orange-950",
};

function Icon({ severity }: { severity: AnnouncementSeverity }) {
  if (severity === "maintenance") return <Wrench className="h-4 w-4 shrink-0" aria-hidden />;
  if (severity === "warning") return <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />;
  return <Info className="h-4 w-4 shrink-0" aria-hidden />;
}

export async function SiteAnnouncementBanner() {
  const settings = await getSiteSettings();
  if (!settings.announcementEnabled || !settings.announcementMessage?.trim()) {
    return null;
  }

  const until =
    settings.maintenanceUntil && !Number.isNaN(settings.maintenanceUntil.getTime())
      ? settings.maintenanceUntil.toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Europe/London",
        })
      : null;

  return (
    <div
      className={`border-b px-3 py-2 ${STYLES[settings.announcementSeverity]}`}
      role="status"
      aria-live="polite"
    >
      <p className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-2 px-2 text-center text-xs font-semibold leading-snug sm:text-sm">
        <Icon severity={settings.announcementSeverity} />
        <span>{settings.announcementMessage}</span>
        {until ? <span className="font-normal opacity-90">Until {until} (UK time).</span> : null}
      </p>
    </div>
  );
}
