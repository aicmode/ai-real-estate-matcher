-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prefecture" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "rent" INTEGER NOT NULL,
    "managementFee" INTEGER NOT NULL DEFAULT 0,
    "deposit" INTEGER NOT NULL DEFAULT 0,
    "keyMoney" INTEGER NOT NULL DEFAULT 0,
    "layout" TEXT NOT NULL,
    "sizeSqm" DOUBLE PRECISION NOT NULL,
    "buildingAge" INTEGER NOT NULL,
    "floor" INTEGER NOT NULL DEFAULT 1,
    "structure" TEXT NOT NULL DEFAULT '鉄筋コンクリート造',
    "nearestLine" TEXT NOT NULL,
    "nearestStation" TEXT NOT NULL,
    "walkMinutes" INTEGER NOT NULL,
    "hasParking" BOOLEAN NOT NULL DEFAULT false,
    "petAllowed" BOOLEAN NOT NULL DEFAULT false,
    "remoteWorkScore" INTEGER NOT NULL DEFAULT 3,
    "internet" TEXT NOT NULL DEFAULT '光回線対応',
    "hasAutoLock" BOOLEAN NOT NULL DEFAULT false,
    "hasBathToilet" BOOLEAN NOT NULL DEFAULT true,
    "appealPoints" TEXT NOT NULL DEFAULT '[]',
    "cautionPoints" TEXT NOT NULL DEFAULT '[]',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "description" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Property_prefecture_city_idx" ON "Property"("prefecture", "city");

-- CreateIndex
CREATE INDEX "Property_rent_idx" ON "Property"("rent");

