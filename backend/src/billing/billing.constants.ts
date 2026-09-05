import { TokenBucket } from '@prisma/client';

// 1 наш токен = $0.001 — курс общий для обоих пулов: 250 токенов чата = $0.25,
// 1000 токенов фото = $1, то есть 1000 токенов на доллар в обоих случаях.
export const USD_PER_TOKEN = 0.001;

export const BUCKET_LIMITS: Record<TokenBucket, number> = {
  CHAT: 250,
  PHOTO: 1000,
};

// Полночь по Москве без перевода стрелок (фиксированный UTC+3) — достаточно
// для дневного сброса лимитов, отдельная библиотека таймзон не нужна.
export const RESET_TIMEZONE_UTC_OFFSET_HOURS = 3;
