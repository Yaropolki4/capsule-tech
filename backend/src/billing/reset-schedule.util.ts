import { RESET_TIMEZONE_UTC_OFFSET_HOURS } from './billing.constants';

/**
 * Следующая полночь по Москве строго позже `from` — время сброса дневного
 * лимита. Считается чистой арифметикой над UTC-меткой (без date-lib):
 * сдвигаем `from` на офсет МСК, берём календарную дату в этом сдвинутом
 * "кадре" и берём полночь следующего дня в нём же, затем сдвигаем обратно.
 */
export function nextResetAt(
  from: Date,
  offsetHours = RESET_TIMEZONE_UTC_OFFSET_HOURS,
): Date {
  const offsetMs = offsetHours * 60 * 60 * 1000;
  const shifted = new Date(from.getTime() + offsetMs);

  const nextLocalMidnightShifted = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate() + 1,
    0,
    0,
    0,
    0,
  );

  return new Date(nextLocalMidnightShifted - offsetMs);
}
