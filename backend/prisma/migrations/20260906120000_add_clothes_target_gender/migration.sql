-- CreateEnum
CREATE TYPE "public"."ClothesGender" AS ENUM ('MALE', 'FEMALE', 'UNISEX');

-- AlterTable
ALTER TABLE "public"."clothes" ADD COLUMN "target_gender" "public"."ClothesGender";
