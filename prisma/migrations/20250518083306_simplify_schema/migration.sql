/*
  Warnings:

  - You are about to drop the column `collectionId` on the `Masterclass` table. All the data in the column will be lost.
  - You are about to drop the `Collection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CollectionNFT` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nftTokenIds` to the `Masterclass` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CollectionNFT" DROP CONSTRAINT "CollectionNFT_masterclassId_fkey";

-- DropForeignKey
ALTER TABLE "Masterclass" DROP CONSTRAINT "Masterclass_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "Masterclass" DROP CONSTRAINT "Masterclass_creatorId_fkey";

-- AlterTable
ALTER TABLE "Masterclass" DROP COLUMN "collectionId",
ADD COLUMN     "nftTokenIds" JSONB NOT NULL;

-- DropTable
DROP TABLE "Collection";

-- DropTable
DROP TABLE "CollectionNFT";
