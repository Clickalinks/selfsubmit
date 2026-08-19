-- Lock UTR / NI after the user confirms them.
ALTER TABLE "ClientProfile" ADD COLUMN "taxIdsConfirmedAt" TIMESTAMP(3);
