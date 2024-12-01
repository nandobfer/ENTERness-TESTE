/*
  Warnings:

  - You are about to drop the column `lastMessageId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `chatLastId` on the `Message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_chatLastId_fkey`;

-- DropIndex
DROP INDEX `Message_chatLastId_key` ON `Message`;

-- AlterTable
ALTER TABLE `Chat` DROP COLUMN `lastMessageId`;

-- AlterTable
ALTER TABLE `Message` DROP COLUMN `chatLastId`;
