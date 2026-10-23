import { describe, it, expect } from 'vitest';
import {
  calcSubtotal,
  calcDiscountRate,
  calcShipping,
  calcOrderTotal,
  validateCoupon,
  type OrderItem,
} from '../src/order';

const item = (price: number, qty = 1): OrderItem => ({
  sku: 'SKU-1',
  price,
  qty,
});

describe('calcSubtotal', () => {
  it('підсумовує вартість позицій з урахуванням кількості', () => {
    // Arrange
    const items = [item(100, 2), { sku: 'SKU-2', price: 50, qty: 3 }];

    // Act
    const result = calcSubtotal(items);

    // Assert
    expect(result).toBe(350);
  });

  it('приймає нульову ціну', () => {
    expect(calcSubtotal([item(0)])).toBe(0);
  });

  it('приймає мінімальну коректну кількість — одну одиницю', () => {
    expect(calcSubtotal([item(100, 1)])).toBe(100);
  });

  it('відхиляє порожнє замовлення', () => {
    expect(() => calcSubtotal([])).toThrow('EMPTY_ORDER');
  });

  it('відхиляє від’ємну ціну', () => {
    expect(() => calcSubtotal([item(-1)])).toThrow('NEGATIVE_PRICE');
  });

  it('відхиляє ціну, що ледь менша за нуль', () => {
    expect(() => calcSubtotal([item(-0.01)])).toThrow('NEGATIVE_PRICE');
  });

  it.each([0, -1, 1.5])('відхиляє кількість %s', (qty) => {
    expect(() => calcSubtotal([item(100, qty)])).toThrow('INVALID_QTY');
  });
});

describe('calcDiscountRate', () => {
  it.each([
    { tier: 'basic' as const, subtotal: 500, expected: 0 },
    { tier: 'silver' as const, subtotal: 500, expected: 0.05 },
    { tier: 'gold' as const, subtotal: 500, expected: 0.1 },
    { tier: 'basic' as const, subtotal: 2000, expected: 0.05 },
    { tier: 'gold' as const, subtotal: 2000, expected: 0.15 },
  ])(
    'рівень $tier із сумою $subtotal дає ставку $expected',
    ({ tier, subtotal, expected }) => {
      expect(calcDiscountRate(tier, subtotal)).toBeCloseTo(expected, 4);
    },
  );

  it.each([
    { subtotal: 1999, expected: 0 },
    { subtotal: 2000, expected: 0.05 },
    { subtotal: 2001, expected: 0.05 },
  ])('межа великого замовлення: $subtotal', ({ subtotal, expected }) => {
    expect(calcDiscountRate('basic', subtotal)).toBeCloseTo(expected, 4);
  });

  it.each([
    { promo: 0.09, expected: 0.24 },
    { promo: 0.1, expected: 0.25 },
    { promo: 0.15, expected: 0.25 },
  ])(
    'межа максимальної знижки: gold, 2000, промокод $promo → $expected',
    ({ promo, expected }) => {
      expect(calcDiscountRate('gold', 2000, promo)).toBeCloseTo(expected, 4);
    },
  );

  it('обмежує сумарну знижку максимальним значенням', () => {
    expect(calcDiscountRate('gold', 2000, 0.5)).toBe(0.25);
  });

  it('відхиляє від’ємний промокод', () => {
    expect(() => calcDiscountRate('basic', 500, -0.1)).toThrow('INVALID_PROMO');
  });
});

describe('calcShipping', () => {
  it.each([
    [999, 60],
    [1000, 0],
    [1001, 0],
  ])('сума %i → доставка %i', (amount, expected) => {
    expect(calcShipping(amount)).toBe(expected);
  });
});

describe('calcOrderTotal', () => {
  it('додає доставку до замовлення нижче порога', () => {
    const total = calcOrderTotal([item(500)], 'basic');
    expect(total).toBeCloseTo(560, 2);
  });

  it('не додає доставку, якщо сума після знижки сягає порога', () => {
    // 1200 − 10 % = 1080 ≥ 1000, доставка безкоштовна
    const total = calcOrderTotal([item(1200)], 'gold');
    expect(total).toBeCloseTo(1080, 2);
  });

  it('не додає доставку, якщо сума після знижки рівно на порозі', () => {
    // basic без знижки: 1000 ≥ 1000
    const total = calcOrderTotal([item(1000)], 'basic');
    expect(total).toBeCloseTo(1000, 2);
  });

  it('знижка може опустити суму нижче порога доставки', () => {
    // 1050 − 10 % = 945 < 1000, тому доставка платна
    const total = calcOrderTotal([item(1050)], 'gold');
    expect(total).toBeCloseTo(1005, 2);
  });

  it('застосовує промокод та обмеження максимальної знижки', () => {
    // 2000 × (1 − 0.25) = 1500, доставка безкоштовна
    const total = calcOrderTotal([item(2000)], 'gold', 0.5);
    expect(total).toBeCloseTo(1500, 2);
  });

  it('передає виняток із нижнього рівня', () => {
    expect(() => calcOrderTotal([], 'gold')).toThrow('EMPTY_ORDER');
  });
});

describe('validateCoupon', () => {
  it.each(['ABC-1234', 'AAA-0000', 'ZZZ-9999', 'XYZ-0042'])(
    'приймає коректний промокод %s',
    (code) => {
      expect(validateCoupon(code)).toBe(true);
    },
  );

  // Межі за правилом «межа − 1, межа, межа + 1»:
  // кількість літер (2 / 3 / 4) і кількість цифр (3 / 4 / 5)
  it.each([
    { code: 'AB-1234', expected: false, case: 'дві літери (межа − 1)' },
    { code: 'ABC-1234', expected: true, case: 'три літери (межа)' },
    { code: 'ABCD-1234', expected: false, case: 'чотири літери (межа + 1)' },
    { code: 'ABC-123', expected: false, case: 'три цифри (межа − 1)' },
    { code: 'ABC-1234', expected: true, case: 'чотири цифри (межа)' },
    { code: 'ABC-12345', expected: false, case: 'п’ять цифр (межа + 1)' },
  ])('межа довжини: $case → $expected', ({ code, expected }) => {
    expect(validateCoupon(code)).toBe(expected);
  });

  it.each([
    ['abc-1234', 'малі літери'],
    ['AbC-1234', 'змішаний регістр'],
    ['ABC-12a4', 'літера серед цифр'],
    ['A1C-1234', 'цифра серед літер'],
    ['1234-ABC', 'цифри й літери поміняно місцями'],
  ])('відхиляє %s: %s', (code) => {
    expect(validateCoupon(code)).toBe(false);
  });

  it.each([
    ['ABC1234', 'без дефіса'],
    ['ABC_1234', 'підкреслення замість дефіса'],
    ['ABC 1234', 'пробіл замість дефіса'],
    ['ABC–1234', 'тире замість дефіса'],
    ['ABC--1234', 'подвійний дефіс'],
  ])('відхиляє %s: %s', (code) => {
    expect(validateCoupon(code)).toBe(false);
  });

  it.each([
    ['', 'порожній рядок'],
    [' ABC-1234', 'пробіл на початку'],
    ['ABC-1234 ', 'пробіл у кінці'],
    ['ABC-1234\n', 'перенесення рядка у кінці'],
    ['ABC-1234ABC-1234', 'два коди підряд'],
  ])('відхиляє %j: %s', (code) => {
    expect(validateCoupon(code)).toBe(false);
  });

  it.each([
    ['АВС-1234', 'кириличні літери, схожі на латинські'],
    ['ABC-١٢٣٤', 'арабсько-індійські цифри'],
  ])('відхиляє %s: %s', (code) => {
    expect(validateCoupon(code)).toBe(false);
  });

  it.each([null, undefined, 1234, {}, [], true])(
    'викидає INVALID_COUPON_TYPE для нерядкового значення %j',
    (value) => {
      expect(() => validateCoupon(value as unknown as string)).toThrow(
        'INVALID_COUPON_TYPE',
      );
    },
  );
});

// it('виклик без перевірки результату', () => {
//   calcOrderTotal([item(100)], 'silver');
// });
