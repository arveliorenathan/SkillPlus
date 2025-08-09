/*
  Warnings:

  - Made the column `photo_url` on table `mentor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."mentor" ALTER COLUMN "photo_url" SET NOT NULL;
