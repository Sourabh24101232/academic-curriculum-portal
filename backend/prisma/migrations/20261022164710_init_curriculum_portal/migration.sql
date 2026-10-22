-- CreateTable
CREATE TABLE `admins` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admins_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_offerings` (
    `id` VARCHAR(191) NOT NULL,
    `course_code` VARCHAR(191) NOT NULL,
    `course_name` VARCHAR(191) NOT NULL,
    `programme` VARCHAR(191) NOT NULL,
    `batch` VARCHAR(191) NOT NULL,
    `branch` VARCHAR(191) NOT NULL,
    `semester` VARCHAR(191) NOT NULL,
    `course_type` ENUM('CORE', 'ELECTIVE') NOT NULL DEFAULT 'CORE',
    `lecture` INTEGER NOT NULL DEFAULT 0,
    `tutorial` INTEGER NOT NULL DEFAULT 0,
    `practical` INTEGER NOT NULL DEFAULT 0,
    `credits` INTEGER NOT NULL DEFAULT 0,
    `course_objectives` TEXT NOT NULL,
    `module_wise_syllabus_text` MEDIUMTEXT NOT NULL,
    `reference_books_text` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `course_offerings_programme_batch_branch_semester_idx`(`programme`, `batch`, `branch`, `semester`),
    INDEX `course_offerings_course_code_idx`(`course_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_documents` (
    `id` VARCHAR(191) NOT NULL,
    `course_offering_id` VARCHAR(191) NOT NULL,
    `original_filename` VARCHAR(191) NOT NULL,
    `storage_path` VARCHAR(191) NOT NULL,
    `mime_type` VARCHAR(191) NOT NULL DEFAULT 'application/pdf',
    `size` INTEGER NOT NULL,
    `checksum` VARCHAR(191) NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `course_documents_course_offering_id_key`(`course_offering_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course_documents` ADD CONSTRAINT `course_documents_course_offering_id_fkey` FOREIGN KEY (`course_offering_id`) REFERENCES `course_offerings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
