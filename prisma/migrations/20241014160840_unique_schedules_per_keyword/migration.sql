/*
  Warnings:

  - A unique constraint covering the columns `[keywordId,userId]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Schedule_keywordId_userId_key` ON `Schedule`(`keywordId`, `userId`);
