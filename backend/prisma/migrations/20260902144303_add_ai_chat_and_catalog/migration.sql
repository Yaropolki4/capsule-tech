-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "public"."ClothesSource" AS ENUM ('USER_UPLOAD', 'CATALOG', 'WEB');

-- CreateEnum
CREATE TYPE "public"."ChatMessageRole" AS ENUM ('USER', 'ASSISTANT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ClothesCategory" ADD VALUE 'TSHIRT';
ALTER TYPE "public"."ClothesCategory" ADD VALUE 'TOP';
ALTER TYPE "public"."ClothesCategory" ADD VALUE 'HOODIE';
ALTER TYPE "public"."ClothesCategory" ADD VALUE 'SWEATSHIRT';
ALTER TYPE "public"."ClothesCategory" ADD VALUE 'SWEATER';
ALTER TYPE "public"."ClothesCategory" ADD VALUE 'LONGSLEEVE';
ALTER TYPE "public"."ClothesCategory" ADD VALUE 'BLAZER';

-- AlterTable
ALTER TABLE "public"."clothes" ADD COLUMN     "description" TEXT,
ADD COLUMN     "embedding" vector(1536),
ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "generation_prompt" TEXT,
ADD COLUMN     "source" "public"."ClothesSource" NOT NULL DEFAULT 'USER_UPLOAD',
ADD COLUMN     "source_url" TEXT;

-- CreateTable
CREATE TABLE "public"."chat_threads" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_messages" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "role" "public"."ChatMessageRole" NOT NULL,
    "text" TEXT NOT NULL,
    "suggestion_clothes_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clothes_external_id_key" ON "public"."clothes"("external_id");

-- CreateIndex (approximate nearest-neighbor search over item embeddings)
CREATE INDEX "clothes_embedding_hnsw_idx" ON "public"."clothes" USING hnsw ("embedding" vector_cosine_ops);

-- AddForeignKey
ALTER TABLE "public"."chat_threads" ADD CONSTRAINT "chat_threads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_messages" ADD CONSTRAINT "chat_messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."chat_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
