-- CreateEnum
CREATE TYPE "public"."TokenBucket" AS ENUM ('CHAT', 'PHOTO');

-- CreateTable
CREATE TABLE "public"."token_balances" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bucket" "public"."TokenBucket" NOT NULL,
    "remaining" INTEGER NOT NULL,
    "limit" INTEGER NOT NULL,
    "reset_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."token_usage_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bucket" "public"."TokenBucket" NOT NULL,
    "action" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "provider_cost_usd" DOUBLE PRECISION NOT NULL,
    "tokens_charged" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_usage_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_balances_user_id_bucket_key" ON "public"."token_balances"("user_id", "bucket");

-- CreateIndex
CREATE INDEX "token_usage_events_user_id_created_at_idx" ON "public"."token_usage_events"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "public"."token_balances" ADD CONSTRAINT "token_balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."token_usage_events" ADD CONSTRAINT "token_usage_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
