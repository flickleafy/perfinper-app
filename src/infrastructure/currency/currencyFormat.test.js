describe('currencyFormat function', () => {
  const { currencyFormat } = require('./currencyFormat.js');

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
