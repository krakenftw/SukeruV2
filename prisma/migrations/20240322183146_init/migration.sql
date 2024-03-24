/*
  Warnings:

  - Made the column `earnxp` on table `ChannelXP` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ChannelXP" ALTER COLUMN "earnxp" SET NOT NULL;
