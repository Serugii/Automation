const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 3600;

/**
 * Перетворює кількість секунд на рядок формату «гг:хх:сс».
 *
 * Кожен компонент доповнюється нулем до двох цифр. Якщо годин більше
 * ніж 99, їхнє поле розширюється (наприклад, 360000 секунд -> «100:00:00»).
 *
 * @param totalSeconds невід’ємна кількість секунд (ціле число)
 * @throws Error('NEGATIVE_SECONDS') для від’ємного значення
 * @throws Error('INVALID_SECONDS') для NaN, Infinity та дробових значень
 */
export function secondsToTime(totalSeconds: number): string {
  if (!Number.isInteger(totalSeconds)) {
    throw new Error('INVALID_SECONDS');
  }
  if (totalSeconds < 0) {
    throw new Error('NEGATIVE_SECONDS');
  }

  const hours = Math.floor(totalSeconds / SECONDS_IN_HOUR);
  const minutes = Math.floor(
    (totalSeconds % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE,
  );
  const seconds = totalSeconds % SECONDS_IN_MINUTE;

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
}
