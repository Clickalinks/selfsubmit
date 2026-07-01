-- Replace SmsReminderLog with ReminderLog (monthly + quarterly, SMS + email).
DROP TABLE IF EXISTS "SmsReminderLog";

CREATE TABLE "ReminderLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "deadlineDate" DATE NOT NULL,
    "daysBefore" INTEGER NOT NULL,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReminderLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ReminderLog_userId_createdAt_idx" ON "ReminderLog"("userId", "createdAt");

CREATE UNIQUE INDEX "ReminderLog_userId_kind_channel_deadlineDate_daysBefore_key" ON "ReminderLog"("userId", "kind", "channel", "deadlineDate", "daysBefore");

ALTER TABLE "ReminderLog" ADD CONSTRAINT "ReminderLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
