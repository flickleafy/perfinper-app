import { monthNameByNumber } from './monthNameByNumber';

describe('monthNameByNumber', () => {
  it('returns month name for valid month numbers', () => {
    expect(monthNameByNumber('01')).toBe('Janeiro');
    expect(monthNameByNumber('02')).toBe('Fevereiro');
    expect(monthNameByNumber('03')).toBe('Mar\u00e7o');
    expect(monthNameByNumber('04')).toBe('Abril');
    expect(monthNameByNumber('05')).toBe('Maio');
    expect(monthNameByNumber('06')).toBe('Junho');
    expect(monthNameByNumber('07')).toBe('Julho');
    expect(monthNameByNumber('08')).toBe('Agosto');
    expect(monthNameByNumber('09')).toBe('Setembro');
    expect(monthNameByNumber('10')).toBe('Outubro');
    expect(monthNameByNumber('11')).toBe('Novembro');
    expect(monthNameByNumber('12')).toBe('Dezembro');
  });

  it('returns empty string for invalid month numbers', () => {
    expect(monthNameByNumber('00')).toBe('');
    expect(monthNameByNumber('13')).toBe('');
  });
});
