-- CreateTable
CREATE TABLE "public"."capsules" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "thumbnail_url" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capsules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."capsule_items" (
    "id" TEXT NOT NULL,
    "capsule_id" TEXT NOT NULL,
    "clothes_id" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scale" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "z_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capsule_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "capsule_items_capsule_id_clothes_id_key" ON "public"."capsule_items"("capsule_id", "clothes_id");

-- AddForeignKey
ALTER TABLE "public"."capsules" ADD CONSTRAINT "capsules_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."capsule_items" ADD CONSTRAINT "capsule_items_capsule_id_fkey" FOREIGN KEY ("capsule_id") REFERENCES "public"."capsules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."capsule_items" ADD CONSTRAINT "capsule_items_clothes_id_fkey" FOREIGN KEY ("clothes_id") REFERENCES "public"."clothes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
