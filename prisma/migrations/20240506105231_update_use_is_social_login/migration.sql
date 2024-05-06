-- AlterTable
ALTER TABLE `user` ADD COLUMN `isSocialLogin` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `password` VARCHAR(191) NULL;
