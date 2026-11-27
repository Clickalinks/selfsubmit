import { prisma } from "@/lib/db";
import { isHmrcQuarterlySubmitEnabled } from "@/lib/hmrc-filing-status";
import { getSiteSettings } from "@/lib/site-settings";

export type ServiceStatus = "operational" | "degraded" | "maintenance" | "outage";

export type StatusServiceId =
  | "website"
  | "auth"
  | "billing"
  | "records"
  | "receipts"
  | "email"
  | "sms"
  | "hmrc";

export type StatusService = {
  id: StatusServiceId;
  name: string;
  description: string;
  status: ServiceStatus;
};

export type SystemHealthSnapshot = {
  ok: boolean;
  checkedAt: string;
  maintenanceMode: boolean;
  database: ServiceStatus;
  services: StatusService[];
};

const DB_PROBE_MS = 4_000;

function pickStatus(options: { maintenance?: boolean; down?: boolean; degraded?: boolean }): ServiceStatus {
  if (options.maintenance) return "maintenance";
  if (options.down) return "outage";
  if (options.degraded) return "degraded";
  return "operational";
}

async function probeDatabase(): Promise<ServiceStatus> {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("database probe timed out")), DB_PROBE_MS);
      }),
    ]);
    return "operational";
  } catch (err) {
    console.error("[system-status] database probe failed", err);
    return "outage";
  }
}

export async function getSystemHealthSnapshot(): Promise<SystemHealthSnapshot> {
  const [database, settings] = await Promise.all([probeDatabase(), getSiteSettings()]);
  const maintenance = settings.maintenanceMode;
  const dbDown = database === "outage";
  const hmrcReady = isHmrcQuarterlySubmitEnabled();
  const productionEnv = process.env.VERCEL_ENV === "production";

  const services: StatusService[] = [
    {
      id: "website",
      name: "Website & dashboard",
      description: "selfsubmit.co.uk and signed-in areas",
      status: pickStatus({ maintenance, down: false }),
    },
    {
      id: "auth",
      name: "Sign-in & accounts",
      description: "Registration, login, and two-step verification",
      status: pickStatus({ maintenance, down: dbDown }),
    },
    {
      id: "billing",
      name: "Subscriptions & billing",
      description: "Stripe checkout and billing portal",
      status: "operational",
    },
    {
      id: "records",
      name: "Record keeping",
      description: "Monthly income and expense forms",
      status: pickStatus({ maintenance, down: dbDown }),
    },
    {
      id: "receipts",
      name: "Receipt uploads",
      description: "Document storage for expense evidence",
      status: pickStatus({ maintenance, down: dbDown }),
    },
    {
      id: "email",
      name: "Email reminders",
      description: "Quarterly deadline notifications",
      status: "operational",
    },
    {
      id: "sms",
      name: "SMS reminders",
      description: "Optional UK mobile reminders",
      status: "operational",
    },
    {
      id: "hmrc",
      name: "HMRC quarterly updates",
      description:
        "Preview and submit cumulative quarterly updates for self-employment and UK property when your HMRC account is connected",
      status: pickStatus({
        maintenance,
        down: dbDown,
        degraded: !dbDown && !maintenance && productionEnv && !hmrcReady,
      }),
    },
  ];

  if (maintenance) {
    const website = services.find((s) => s.id === "website");
    if (website) website.status = "maintenance";
  }

  const ok = services.every((s) => s.status === "operational");

  return {
    ok,
    checkedAt: new Date().toISOString(),
    maintenanceMode: maintenance,
    database,
    services,
  };
}
