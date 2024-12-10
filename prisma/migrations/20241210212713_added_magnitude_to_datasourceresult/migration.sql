
-- AlterTable
ALTER TABLE `DataSourceResult` ADD COLUMN `magnitude` DOUBLE NOT NULL,
    MODIFY `score` DOUBLE NOT NULL;
