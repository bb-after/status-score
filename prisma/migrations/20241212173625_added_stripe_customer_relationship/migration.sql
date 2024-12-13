-- AddForeignKey
ALTER TABLE `StripeCustomer` ADD CONSTRAINT `StripeCustomer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
