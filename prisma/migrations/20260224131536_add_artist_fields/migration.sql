/*
  Warnings:

  - You are about to drop the column `avgPriceRange` on the `Artist` table. All the data in the column will be lost.
  - Added the required column `sources` to the `Artist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Artist" DROP COLUMN "avgPriceRange",
ADD COLUMN     "awards" JSONB,
ADD COLUMN     "exhibitions" JSONB,
ADD COLUMN     "priceRange" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "sources" JSONB NOT NULL,
ADD COLUMN     "style" TEXT;
