-- AlterTable
ALTER TABLE `Report` ADD COLUMN `prompt` TEXT NULL,
    ADD COLUMN `response` TEXT NULL,
    ADD COLUMN `sentiment` VARCHAR(191) NULL;
