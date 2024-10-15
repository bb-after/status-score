/*
  Warnings:

  - Made the column `response` on table `Report` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sentiment` on table `Report` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Report` MODIFY `response` TEXT NOT NULL,
    MODIFY `sentiment` VARCHAR(191) NOT NULL;
