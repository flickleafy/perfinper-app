import { currencyFormat } from './currencyFormat';

describe('currencyFormat', () => {
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
});

describe('currencyFormat function', () => {

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
