-- Link local SelfSubmit businesses to HMRC income-source business IDs for MTD filing.
ALTER TABLE "Business" ADD COLUMN "hmrcBusinessId" TEXT;

CREATE INDEX "Business_userId_hmrcBusinessId_idx" ON "Business"("userId", "hmrcBusinessId");
