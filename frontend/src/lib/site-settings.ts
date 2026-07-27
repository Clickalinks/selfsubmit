import { prisma } from "@/lib/db";

export type AnnouncementSeverity = "info" | "warning" | "maintenance";

export type SiteSettingsPublic = {
  announcementEnabled: boolean;
  announcementMessage: string | null;
  announcementSeverity: AnnouncementSeverity;
  maintenanceMode: boolean;
  maintenanceUntil: Date | null;
};

const DEFAULTS: SiteSettingsPublic = {
  announcementEnabled: false,
  announcementMessage: null,
  announcementSeverity: "info",
  maintenanceMode: false,
  maintenanceUntil: null,
};

function normalizeSeverity(value: string | null | undefined): AnnouncementSeverity {
  if (value === "warning" || value === "maintenance") return value;
  return "info";
}

export async function getSiteSettings(): Promise<SiteSettingsPublic> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { id: "default" } });
    if (!row) return { ...DEFAULTS };
    return {
      announcementEnabled: row.announcementEnabled,
      announcementMessage: row.announcementMessage,
      announcementSeverity: normalizeSeverity(row.announcementSeverity),
      maintenanceMode: row.maintenanceMode,
      maintenanceUntil: row.maintenanceUntil,
    };
  } catch (err) {
    console.error("[site-settings] load failed", err);
    return { ...DEFAULTS };
  }
}

export type UpdateSiteSettingsInput = {
  announcementEnabled: boolean;
  announcementMessage: string | null;
  announcementSeverity: AnnouncementSeverity;
  maintenanceMode: boolean;
  maintenanceUntil: Date | null;
  updatedByUserId: string;
};

export async function upsertSiteSettings(input: UpdateSiteSettingsInput): Promise<SiteSettingsPublic> {
  const message = input.announcementMessage?.trim() || null;
  const row = await prisma.siteSetting.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      announcementEnabled: input.announcementEnabled,
      announcementMessage: message,
      announcementSeverity: input.announcementSeverity,
      maintenanceMode: input.maintenanceMode,
      maintenanceUntil: input.maintenanceUntil,
      updatedByUserId: input.updatedByUserId,
    },
    update: {
      announcementEnabled: input.announcementEnabled,
      announcementMessage: message,
      announcementSeverity: input.announcementSeverity,
      maintenanceMode: input.maintenanceMode,
      maintenanceUntil: input.maintenanceUntil,
      updatedByUserId: input.updatedByUserId,
    },
  });

  return {
    announcementEnabled: row.announcementEnabled,
    announcementMessage: row.announcementMessage,
    announcementSeverity: normalizeSeverity(row.announcementSeverity),
    maintenanceMode: row.maintenanceMode,
    maintenanceUntil: row.maintenanceUntil,
  };
}
