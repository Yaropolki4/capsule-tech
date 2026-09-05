-- DropIndex
DROP INDEX "public"."clothes_embedding_hnsw_idx";

-- CreateTable
CREATE TABLE "public"."user_photos" (
    "id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."try_ons" (
    "id" TEXT NOT NULL,
    "result_image_url" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_photo_id" TEXT NOT NULL,
    "capsule_id" TEXT,
    "clothes_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "try_ons_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."user_photos" ADD CONSTRAINT "user_photos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."try_ons" ADD CONSTRAINT "try_ons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."try_ons" ADD CONSTRAINT "try_ons_user_photo_id_fkey" FOREIGN KEY ("user_photo_id") REFERENCES "public"."user_photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."try_ons" ADD CONSTRAINT "try_ons_capsule_id_fkey" FOREIGN KEY ("capsule_id") REFERENCES "public"."capsules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."try_ons" ADD CONSTRAINT "try_ons_clothes_id_fkey" FOREIGN KEY ("clothes_id") REFERENCES "public"."clothes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
