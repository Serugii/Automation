import { describe, it, expect } from 'vitest';
import { calcPenalty } from '../src/penalty';

describe('calcPenalty', () => {
  it.each([-1, -0.01, NaN, Infinity])(
    'відхиляє некоректну суму боргу %s',
    (debt) => {
      expect(() => calcPenalty(debt, 10)).toThrow('INVALID_DEBT');
    },
  );
  it.each([-1, 2.5, NaN, Infinity])(
    'відхиляє некоректну кількість днів %s',
    (days) => {
      expect(() => calcPenalty(1000, days)).toThrow('INVALID_DAYS');
    },
  );
  it.each([0, 1, 3])('пільговий період: %i дн. → пеня 0', (days) => {
    expect(calcPenalty(1000, days)).toBe(0);
  });
  it.each([
    { debt: 1000, days: 4, expected: 1 },
    { debt: 1000, days: 5, expected: 2 },
    { debt: 1000, days: 10, expected: 7 },
    { debt: 2000, days: 13, expected: 20 },
    { debt: 500, days: 33, expected: 15 },
  ])('борг $debt, $days дн. → пеня $expected', ({ debt, days, expected }) => {
    expect(calcPenalty(debt, days)).toBeCloseTo(expected, 2);
  });
  it.each([
    { debt: 1000, days: 502, expected: 499 },
    { debt: 1000, days: 503, expected: 500 },
    { debt: 1000, days: 504, expected: 500 },
    { debt: 1000, days: 10000, expected: 500 },
    { debt: 200, days: 503, expected: 100 },
    { debt: 0, days: 1000, expected: 0 },
  ])(
    'обмеження 50 %: борг $debt, $days дн. → $expected',
    ({ debt, days, expected }) => {
      expect(calcPenalty(debt, days)).toBeCloseTo(expected, 2);
    },
  );
  it.each([
    { debt: 123.45, days: 4, expected: 0.12 },
    { debt: 126, days: 4, expected: 0.13 },
    { debt: 999.99, days: 5, expected: 2 },
    { debt: 1234.56, days: 10, expected: 8.64 },
    { debt: 777.77, days: 7, expected: 3.11 },
  ])(
    'заокруглення до копійок: борг $debt, $days дн. → $expected',
    ({ debt, days, expected }) => {
      expect(calcPenalty(debt, days)).toBe(expected);
    },
  );
});
