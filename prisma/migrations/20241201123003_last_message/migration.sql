/*
  Warnings:

  - A unique constraint covering the columns `[chatLastId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chatLastId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Message` ADD COLUMN `chatLastId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Message_chatLastId_key` ON `Message`(`chatLastId`);

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chatLastId_fkey` FOREIGN KEY (`chatLastId`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
