-- CreateTable
CREATE TABLE `fitness_item_videos` (
    `id` VARCHAR(191) NOT NULL,
    `fitnessItemId` VARCHAR(191) NOT NULL,
    `videoId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `fitness_item_videos_fitnessItemId_videoId_key`(`fitnessItemId`, `videoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fitness_item_videos` ADD CONSTRAINT `fitness_item_videos_fitnessItemId_fkey` FOREIGN KEY (`fitnessItemId`) REFERENCES `fitness_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fitness_item_videos` ADD CONSTRAINT `fitness_item_videos_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `user_videos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
