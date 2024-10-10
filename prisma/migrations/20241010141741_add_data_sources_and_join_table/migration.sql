/*
  Warnings:

  - You are about to drop the column `score` on the `Keyword` table. All the data in the column will be lost.
  - Added the required column `model` to the `DataSource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prompt` to the `DataSource` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `DataSource` ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `model` VARCHAR(191) NOT NULL,
    ADD COLUMN `prompt` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Keyword` DROP COLUMN `score`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `admin` BOOLEAN NOT NULL DEFAULT false;
