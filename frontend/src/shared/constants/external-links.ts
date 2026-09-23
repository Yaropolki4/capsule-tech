/**
 * The Telegram bot is a second entrance to Capsule with its own chat and its own history, so the
 * link is an alternative, not a duplicate of the site's AI stylist. The address is hardcoded so
 * that no deploy has to be configured for it; the variable is left as an escape hatch, and
 * setting it to an empty string removes the entry point.
 */
export const TELEGRAM_BOT_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? "https://t.me/capsule_ai_bot";
