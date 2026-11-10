-- Persist HMRC income-source type so UK property IDs are never sent to the self-employment API.
ALTER TABLE "Business" ADD COLUMN "hmrcTypeOfBusiness" TEXT;
