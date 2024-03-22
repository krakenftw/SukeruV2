/*
  Warnings:

  - You are about to alter the column `level` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "level" SET DEFAULT 1,
ALTER COLUMN "level" SET DATA TYPE INTEGER,
ALTER COLUMN "lastMessage" SET DATA TYPE BIGINT;
