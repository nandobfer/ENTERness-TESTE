/*
  Warnings:

  - Added the required column `createdAt` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Chat` ADD COLUMN `createdAt` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Message` ADD COLUMN `createdAt` VARCHAR(191) NOT NULL;
