/*
  Warnings:

  - You are about to drop the column `email` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Store` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Store` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Store_email_key` ON `Store`;

-- AlterTable
ALTER TABLE `Store` DROP COLUMN `email`,
    DROP COLUMN `password`,
    DROP COLUMN `role`,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Store_userId_key` ON `Store`(`userId`);

-- AddForeignKey
ALTER TABLE `Store` ADD CONSTRAINT `Store_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
