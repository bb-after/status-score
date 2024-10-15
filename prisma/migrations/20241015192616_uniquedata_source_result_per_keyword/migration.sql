-- CreateTable
CREATE TABLE `DataSourceResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reportId` INTEGER NOT NULL,
    `dataSourceId` INTEGER NOT NULL,
    `sentiment` VARCHAR(191) NOT NULL,
    `response` TEXT NOT NULL,
    `score` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DataSourceResult` ADD CONSTRAINT `DataSourceResult_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `Report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DataSourceResult` ADD CONSTRAINT `DataSourceResult_dataSourceId_fkey` FOREIGN KEY (`dataSourceId`) REFERENCES `DataSource`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
