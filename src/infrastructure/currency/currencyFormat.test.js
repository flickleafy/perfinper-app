import { currencyFormat, parseMonetaryValue } from './currencyFormat';

describe('currencyFormat', () => {
  describe('currencyFormat function', () => {
    it('formats empty input to zero value', () => {
      expect(currencyFormat('')).toBe('0,00');
      expect(currencyFormat(null)).toBe('0,00');
    });

    it('strips non-numeric characters and pads decimals', () => {
      expect(currencyFormat('R$ 1.234,5')).toBe('1234,50');
    });

    it('handles leading zeros and missing decimals', () => {
      expect(currencyFormat('00012')).toBe('12,00');
      expect(currencyFormat('00012,3')).toBe('12,30');
    });

    test('should correctly format a number with basic valid input', () => {
      expect(currencyFormat('1234,56')).toBe('1234,56');
    });

    test('should handle input with leading zeros', () => {
      expect(currencyFormat('0001234,56')).toBe('1234,56');
    });

    test('should remove non-numeric characters', () => {
      expect(currencyFormat('abc1234xyz,56')).toBe('1234,56');
    });

    test('should format correctly with no fractional part', () => {
      expect(currencyFormat('1234')).toBe('1234,00');
    });

    test('should truncate a long fractional part', () => {
      expect(currencyFormat('1234,56789')).toBe('1234,56');
    });

    test('should return "0,00" for completely invalid input', () => {
      expect(currencyFormat('abcd')).toBe('0,00');
    });

    test('should also handle numbers without the thousand separators correctly', () => {
      expect(currencyFormat('1234,56')).toBe('1234,56');
      expect(currencyFormat('1234')).toBe('1234,00');
    });
  });

  describe('parseMonetaryValue function', () => {
    test('should return the number if input is a number', () => {
      expect(parseMonetaryValue(100)).toBe(100);
      expect(parseMonetaryValue(100.5)).toBe(100.5);
    });

    test('should return 0 if input is null or undefined', () => {
      expect(parseMonetaryValue(null)).toBe(0);
      expect(parseMonetaryValue(undefined)).toBe(0);
    });

    test('should return 0 if input is empty string', () => {
      expect(parseMonetaryValue('')).toBe(0);
    });

    test('should parse string with comma as decimal separator', () => {
      expect(parseMonetaryValue('100,50')).toBe(100.5);
      expect(parseMonetaryValue('0,99')).toBe(0.99);
    });

    test('should parse string with dot as decimal separator', () => {
      expect(parseMonetaryValue('100.50')).toBe(100.5);
      expect(parseMonetaryValue('0.99')).toBe(0.99);
    });

    test('should return 0 for invalid strings', () => {
      expect(parseMonetaryValue('abc')).toBe(0);
    });
  });
});
