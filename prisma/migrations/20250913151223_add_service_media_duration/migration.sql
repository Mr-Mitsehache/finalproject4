-- AlterTable
ALTER TABLE `Service` ADD COLUMN `durationMinutes` INTEGER NULL,
    ADD COLUMN `imageUrl` VARCHAR(2048) NULL,
    ADD COLUMN `videoUrl` VARCHAR(2048) NULL;
