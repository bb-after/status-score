/*
  Warnings:

  - Made the column `prompt` on table `Report` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Report` MODIFY `prompt` TEXT NOT NULL;
