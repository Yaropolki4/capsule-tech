-- AlterTable
ALTER TABLE "public"."chat_messages" ADD COLUMN     "suggestion_wildberries_items" JSONB[] DEFAULT ARRAY[]::JSONB[];
