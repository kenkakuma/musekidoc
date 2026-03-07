-- Add studio and kiln information fields to Artist model
ALTER TABLE "Artist" ADD COLUMN "kilnName" TEXT;
ALTER TABLE "Artist" ADD COLUMN "studioName" TEXT;
ALTER TABLE "Artist" ADD COLUMN "locationCity" TEXT;
ALTER TABLE "Artist" ADD COLUMN "locationPrefecture" TEXT;
ALTER TABLE "Artist" ADD COLUMN "locationArea" TEXT;
ALTER TABLE "Artist" ADD COLUMN "kilnType" TEXT;
ALTER TABLE "Artist" ADD COLUMN "studioInfo" JSONB;
