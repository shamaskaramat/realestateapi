-- CreateTable
CREATE TABLE `Media` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `images` VARCHAR(191) NOT NULL,
    `property` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Media` ADD CONSTRAINT `Media_property_fkey` FOREIGN KEY (`property`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
