-- CreateTable
CREATE TABLE "SmsReminderLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deadlineDate" DATE NOT NULL,
    "daysBefore" INTEGER NOT NULL,
    "twilioSid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsReminderLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SmsReminderLog_userId_createdAt_idx" ON "SmsReminderLog"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SmsReminderLog_userId_deadlineDate_daysBefore_key" ON "SmsReminderLog"("userId", "deadlineDate", "daysBefore");

-- AddForeignKey
ALTER TABLE "SmsReminderLog" ADD CONSTRAINT "SmsReminderLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
