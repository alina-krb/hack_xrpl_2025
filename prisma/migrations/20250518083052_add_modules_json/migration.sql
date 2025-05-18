/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Masterclass` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Module` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NftMint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Purchase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Resource` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `modules` to the `Masterclass` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resources` to the `Masterclass` table without a default value. This is not possible if the table is not empty.
  - Made the column `web3Provider` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_masterclassId_fkey";

-- DropForeignKey
ALTER TABLE "NftMint" DROP CONSTRAINT "NftMint_masterclassId_fkey";

-- DropForeignKey
ALTER TABLE "NftMint" DROP CONSTRAINT "NftMint_userId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_masterclassId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_userId_fkey";

-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_masterclassId_fkey";

-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "Masterclass" DROP COLUMN "createdAt",
ADD COLUMN     "modules" JSONB NOT NULL,
ADD COLUMN     "resources" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
ALTER COLUMN "web3Provider" SET NOT NULL;

-- DropTable
DROP TABLE "Module";

-- DropTable
DROP TABLE "NftMint";

-- DropTable
DROP TABLE "Purchase";

-- DropTable
DROP TABLE "Resource";
