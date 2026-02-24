-- CreateTable
CREATE TABLE "PotteryEntry" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameZh" TEXT NOT NULL,
    "nameJa" TEXT NOT NULL,
    "nameEn" TEXT,
    "category" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT NOT NULL,
    "positioning" TEXT NOT NULL,
    "signatureFeatures" JSONB NOT NULL,
    "keywords" TEXT[],
    "notableArtists" JSONB NOT NULL,
    "representativeForms" JSONB NOT NULL,
    "images" JSONB,
    "artistId" TEXT,
    "sources" JSONB NOT NULL,
    "instagramHandle" TEXT,
    "instagramFollowers" INTEGER,
    "instagramLastSync" TIMESTAMP(3),
    "priceRange" TEXT,
    "exhibitionCount" INTEGER,
    "popularityScore" INTEGER,
    "relatedProductIds" TEXT[],
    "externalShopUrl" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PotteryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameZh" TEXT NOT NULL,
    "nameJa" TEXT NOT NULL,
    "nameEn" TEXT,
    "bio" TEXT NOT NULL,
    "birthYear" INTEGER,
    "deathYear" INTEGER,
    "instagramHandle" TEXT,
    "instagramFollowers" INTEGER,
    "instagramLastSync" TIMESTAMP(3),
    "websiteUrl" TEXT,
    "exhibitionCount" INTEGER,
    "avgPriceRange" TEXT,
    "avatar" TEXT,
    "images" JSONB,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameZh" TEXT NOT NULL,
    "nameJa" TEXT NOT NULL,
    "nameEn" TEXT,
    "description" TEXT,
    "parentId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PotteryEntry_slug_key" ON "PotteryEntry"("slug");

-- CreateIndex
CREATE INDEX "PotteryEntry_category_region_idx" ON "PotteryEntry"("category", "region");

-- CreateIndex
CREATE INDEX "PotteryEntry_artistId_idx" ON "PotteryEntry"("artistId");

-- CreateIndex
CREATE INDEX "PotteryEntry_slug_idx" ON "PotteryEntry"("slug");

-- CreateIndex
CREATE INDEX "PotteryEntry_published_idx" ON "PotteryEntry"("published");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_slug_key" ON "Artist"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_instagramHandle_key" ON "Artist"("instagramHandle");

-- CreateIndex
CREATE INDEX "Artist_slug_idx" ON "Artist"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "PotteryEntry" ADD CONSTRAINT "PotteryEntry_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
