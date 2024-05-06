/*
  Warnings:

  - You are about to drop the column `coutnry` on the `property` table. All the data in the column will be lost.
  - Added the required column `country` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `property` DROP COLUMN `coutnry`,
    ADD COLUMN `country` VARCHAR(191) NOT NULL;
