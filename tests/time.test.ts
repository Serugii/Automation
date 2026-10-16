import { describe, it, expect } from 'vitest';
import { secondsToTime } from '../src/time';

describe('secondsToTime', () => {
  describe('коректні дані', () => {
    it('форматує 3661 секунду як 01:01:01', () => {
      // Arrange
      const totalSeconds = 3661;

      // Act
      const result = secondsToTime(totalSeconds);

      // Assert
      expect(result).toBe('01:01:01');
    });

    it('форматує 45296 секунд як 12:34:56', () => {
      expect(secondsToTime(45296)).toBe('12:34:56');
    });

    it('форматує менше хвилини лише з секунд із ведучими нулями', () => {
      expect(secondsToTime(59)).toBe('00:00:59');
    });

    it('форматує рівно одну хвилину як 00:01:00', () => {
      expect(secondsToTime(60)).toBe('00:01:00');
    });

    it('форматує 86399 секунд як 23:59:59', () => {
      expect(secondsToTime(86399)).toBe('23:59:59');
    });

    it('не обмежує години добою: 86400 секунд дає 24:00:00', () => {
      expect(secondsToTime(86400)).toBe('24:00:00');
    });

    it('розширює поле годин, коли їх понад 99', () => {
      expect(secondsToTime(360000)).toBe('100:00:00');
    });
  });

  describe('межові значення', () => {
    it('перетворює нуль секунд на 00:00:00', () => {
      expect(secondsToTime(0)).toBe('00:00:00');
    });

    it('переходить на наступну хвилину після 59 секунд', () => {
      expect(secondsToTime(59)).toBe('00:00:59');
      expect(secondsToTime(60)).toBe('00:01:00');
    });

    it('переходить на наступну годину після 3599 секунд', () => {
      expect(secondsToTime(3599)).toBe('00:59:59');
      expect(secondsToTime(3600)).toBe('01:00:00');
    });
  });

  describe('некоректні дані', () => {
    it('відхиляє від’ємне значення з помилкою NEGATIVE_SECONDS', () => {
      expect(() => secondsToTime(-1)).toThrow('NEGATIVE_SECONDS');
    });

    it('відхиляє велике від’ємне значення з помилкою NEGATIVE_SECONDS', () => {
      expect(() => secondsToTime(-3600)).toThrow('NEGATIVE_SECONDS');
    });

    it('відхиляє NaN з помилкою INVALID_SECONDS', () => {
      expect(() => secondsToTime(NaN)).toThrow('INVALID_SECONDS');
    });

    it('відхиляє нескінченність з помилкою INVALID_SECONDS', () => {
      expect(() => secondsToTime(Infinity)).toThrow('INVALID_SECONDS');
    });

    it('відхиляє дробове значення з помилкою INVALID_SECONDS', () => {
      expect(() => secondsToTime(1.5)).toThrow('INVALID_SECONDS');
    });
  });
});
