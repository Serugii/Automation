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
});
