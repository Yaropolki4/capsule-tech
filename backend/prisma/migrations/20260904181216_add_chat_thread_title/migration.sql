-- AlterTable
ALTER TABLE "public"."chat_threads" ADD COLUMN     "title" TEXT;

-- CreateIndex
CREATE INDEX "chat_threads_user_id_updated_at_idx" ON "public"."chat_threads"("user_id", "updated_at");
