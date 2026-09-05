-- AlterTable
ALTER TABLE "public"."chat_messages" ADD COLUMN     "capsule_concepts" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "capsule_proposal" JSONB;
