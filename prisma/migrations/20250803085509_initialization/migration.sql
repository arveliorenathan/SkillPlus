-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('CANCELED', 'PENDING', 'PAID', 'FAILED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id_user" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT,
    "photo_url" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id_order" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "id_course" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'PENDING',
    "ammount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id_order")
);

-- CreateTable
CREATE TABLE "public"."enrollment" (
    "id_enrollment" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "id_course" TEXT NOT NULL,
    "enroll_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollment_pkey" PRIMARY KEY ("id_enrollment")
);

-- CreateTable
CREATE TABLE "public"."course" (
    "id_course" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "thumbnail" TEXT NOT NULL,

    CONSTRAINT "course_pkey" PRIMARY KEY ("id_course")
);

-- CreateTable
CREATE TABLE "public"."leeson" (
    "id_lesson" TEXT NOT NULL,
    "id_course" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "leeson_pkey" PRIMARY KEY ("id_lesson")
);

-- CreateTable
CREATE TABLE "public"."module" (
    "id_module" TEXT NOT NULL,
    "id_lesson" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "video_url" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "module_pkey" PRIMARY KEY ("id_module")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_id_user_id_course_key" ON "public"."enrollment"("id_user", "id_course");

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_id_course_fkey" FOREIGN KEY ("id_course") REFERENCES "public"."course"("id_course") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enrollment" ADD CONSTRAINT "enrollment_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enrollment" ADD CONSTRAINT "enrollment_id_course_fkey" FOREIGN KEY ("id_course") REFERENCES "public"."course"("id_course") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leeson" ADD CONSTRAINT "leeson_id_course_fkey" FOREIGN KEY ("id_course") REFERENCES "public"."course"("id_course") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."module" ADD CONSTRAINT "module_id_lesson_fkey" FOREIGN KEY ("id_lesson") REFERENCES "public"."leeson"("id_lesson") ON DELETE CASCADE ON UPDATE CASCADE;
