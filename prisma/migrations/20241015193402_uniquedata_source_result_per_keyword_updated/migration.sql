/*
  Warnings:

  - Added the required column `payload` to the `DataSourceResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prompt` to the `DataSourceResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `DataSourceResult` ADD COLUMN `payload` JSON NOT NULL,
    ADD COLUMN `prompt` TEXT NOT NULL;
