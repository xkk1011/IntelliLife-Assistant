-- CreateTable
CREATE TABLE `glow_plan_areas` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `areaId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `glow_plan_areas_planId_areaId_key`(`planId`, `areaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `glow_plan_devices` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `glow_plan_devices_planId_deviceId_key`(`planId`, `deviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `glow_history_areas` (
    `id` VARCHAR(191) NOT NULL,
    `historyId` VARCHAR(191) NOT NULL,
    `areaId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `glow_history_areas_historyId_areaId_key`(`historyId`, `areaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `glow_history_devices` (
    `id` VARCHAR(191) NOT NULL,
    `historyId` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `glow_history_devices_historyId_deviceId_key`(`historyId`, `deviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migrate existing data from glow_plans to glow_plan_areas and glow_plan_devices
INSERT INTO `glow_plan_areas` (`id`, `planId`, `areaId`)
SELECT CONCAT('migrated_', UUID()), `id`, `areaId`
FROM `glow_plans`
WHERE `areaId` IS NOT NULL;

INSERT INTO `glow_plan_devices` (`id`, `planId`, `deviceId`)
SELECT CONCAT('migrated_', UUID()), `id`, `deviceId`
FROM `glow_plans`
WHERE `deviceId` IS NOT NULL;

-- Migrate existing data from glow_history to glow_history_areas and glow_history_devices
INSERT INTO `glow_history_areas` (`id`, `historyId`, `areaId`)
SELECT CONCAT('migrated_', UUID()), `id`, `areaId`
FROM `glow_history`
WHERE `areaId` IS NOT NULL;

INSERT INTO `glow_history_devices` (`id`, `historyId`, `deviceId`)
SELECT CONCAT('migrated_', UUID()), `id`, `deviceId`
FROM `glow_history`
WHERE `deviceId` IS NOT NULL;

-- AddForeignKey
ALTER TABLE `glow_plan_areas` ADD CONSTRAINT `glow_plan_areas_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `glow_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `glow_plan_areas` ADD CONSTRAINT `glow_plan_areas_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `glow_areas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `glow_plan_devices` ADD CONSTRAINT `glow_plan_devices_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `glow_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `glow_plan_devices` ADD CONSTRAINT `glow_plan_devices_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `glow_devices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `glow_history_areas` ADD CONSTRAINT `glow_history_areas_historyId_fkey` FOREIGN KEY (`historyId`) REFERENCES `glow_history`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `glow_history_areas` ADD CONSTRAINT `glow_history_areas_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `glow_areas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `glow_history_devices` ADD CONSTRAINT `glow_history_devices_historyId_fkey` FOREIGN KEY (`historyId`) REFERENCES `glow_history`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `glow_history_devices` ADD CONSTRAINT `glow_history_devices_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `glow_devices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE `glow_plans` DROP FOREIGN KEY `glow_plans_areaId_fkey`;

-- DropForeignKey
ALTER TABLE `glow_plans` DROP FOREIGN KEY `glow_plans_deviceId_fkey`;

-- DropForeignKey
ALTER TABLE `glow_history` DROP FOREIGN KEY `glow_history_areaId_fkey`;

-- DropForeignKey
ALTER TABLE `glow_history` DROP FOREIGN KEY `glow_history_deviceId_fkey`;

-- AlterTable
ALTER TABLE `glow_plans` DROP COLUMN `areaId`,
    DROP COLUMN `deviceId`;

-- AlterTable
ALTER TABLE `glow_history` DROP COLUMN `areaId`,
    DROP COLUMN `deviceId`;
