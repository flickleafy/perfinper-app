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

  test('should handle input with and without thousand separators', () => {
    // Assuming the thousand separator logic is commented back in and works correctly:
    // Uncomment the following line in your function to enable thousand separators
    // whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    expect(currencyFormat('1234567,89')).toBe('1.234.567,89');
    expect(currencyFormat('1234567')).toBe('1.234.567,00');
  });

  test('should also handle numbers without the thousand separators correctly', () => {
    expect(currencyFormat('1234,56')).toBe('1234,56');
    expect(currencyFormat('1234')).toBe('1234,00');
  });
});
