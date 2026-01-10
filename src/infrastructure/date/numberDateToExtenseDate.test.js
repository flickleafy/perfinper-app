import { numberDateToExtenseDate } from './numberDateToExtenseDate';

describe('numberDateToExtenseDate', () => {
  it('formats a year-only period', () => {
    expect(numberDateToExtenseDate('2024')).toBe('Ano de 2024');
  });

  it('formats a year-month period', () => {
    expect(numberDateToExtenseDate('2024-03')).toBe('Mar\u00e7o de 2024');
  });

  it('returns the year even when the month is unknown', () => {
    expect(numberDateToExtenseDate('2024-99')).toBe(' de 2024');
  });
});
