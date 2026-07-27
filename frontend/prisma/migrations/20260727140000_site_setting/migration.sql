-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "announcementEnabled" BOOLEAN NOT NULL DEFAULT false,
    "announcementMessage" TEXT,
    "announcementSeverity" TEXT NOT NULL DEFAULT 'info',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceUntil" TIMESTAMP(3),
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);
