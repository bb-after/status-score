/*
  Warnings:

  - Added the required column `updatedAt` to the `TeamInvite` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `TeamInvite` DROP FOREIGN KEY `TeamInvite_userId_fkey`;

-- AlterTable
ALTER TABLE `TeamInvite` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
