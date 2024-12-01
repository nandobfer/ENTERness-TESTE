/*
  Warnings:

  - Added the required column `authorUsername` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Message` ADD COLUMN `authorUsername` VARCHAR(191) NOT NULL;
