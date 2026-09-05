-- AlterTable
ALTER TABLE "public"."clothes" ADD COLUMN     "name" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "feedbacks_count" INTEGER;
