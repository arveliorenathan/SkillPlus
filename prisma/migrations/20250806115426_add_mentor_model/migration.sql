/*
  Warnings:

  - You are about to drop the `leeson` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."leeson" DROP CONSTRAINT "leeson_id_course_fkey";

-- DropForeignKey
ALTER TABLE "public"."module" DROP CONSTRAINT "module_id_lesson_fkey";

-- AlterTable
ALTER TABLE "public"."course" ADD COLUMN     "id_mentor" TEXT;

-- DropTable
DROP TABLE "public"."leeson";

-- CreateTable
CREATE TABLE "public"."lesson" (
    "id_lesson" TEXT NOT NULL,
    "id_course" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "lesson_pkey" PRIMARY KEY ("id_lesson")
);

-- CreateTable
CREATE TABLE "public"."mentor" (
    "id_mentor" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photo_url" TEXT,
    "company" TEXT,
    "specialization" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentor_pkey" PRIMARY KEY ("id_mentor")
);

-- AddForeignKey
ALTER TABLE "public"."course" ADD CONSTRAINT "course_id_mentor_fkey" FOREIGN KEY ("id_mentor") REFERENCES "public"."mentor"("id_mentor") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lesson" ADD CONSTRAINT "lesson_id_course_fkey" FOREIGN KEY ("id_course") REFERENCES "public"."course"("id_course") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."module" ADD CONSTRAINT "module_id_lesson_fkey" FOREIGN KEY ("id_lesson") REFERENCES "public"."lesson"("id_lesson") ON DELETE CASCADE ON UPDATE CASCADE;
