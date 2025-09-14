-- AlterTable
ALTER TABLE `Review` ADD COLUMN `mediaKind` ENUM('IMAGE', 'VIDEO') NULL,
    ADD COLUMN `mediaUrl` VARCHAR(2048) NULL;
