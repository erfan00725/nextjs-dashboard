-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Customer_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Revenue` (
    `month` VARCHAR(191) NOT NULL,
    `revenue` INTEGER NOT NULL,

    PRIMARY KEY (`month`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
