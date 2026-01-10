import { enUS } from 'date-fns/locale/en-US';
import { AdapterDateFns } from './AdapterDateFnsCompat';

jest.mock('date-fns', () => {
  const actual = jest.requireActual('date-fns');
  return {
    ...actual,
    getWeek: jest.fn((date, options) => {
      if (
        date.getFullYear() === 2024 &&
        date.getMonth() === 0 &&
        date.getDate() === 15
      ) {
        return actual.getWeek(date, options) + 1;
      }
      return actual.getWeek(date, options);
    }),
  };
});

describe('AdapterDateFnsCompat', () => {
  it('parses, formats, and validates dates', () => {
    const adapter = new AdapterDateFns();
    const adapterWithLocale = new AdapterDateFns({ locale: enUS });

    expect(adapter.parse('', 'yyyy-MM-dd')).toBeNull();

    const parsed = adapter.parse('2024-02-10', 'yyyy-MM-dd');
    const parsedWithLocale = adapterWithLocale.parse(
      '2024-02-10',
      'yyyy-MM-dd'
    );
    expect(parsed).toBeInstanceOf(Date);
    expect(adapter.isValid(parsed)).toBe(true);
    expect(adapterWithLocale.isValid(parsedWithLocale)).toBe(true);
    expect(adapter.isValid(null)).toBe(false);

    expect(adapter.isEqual(null, null)).toBe(true);
    expect(adapter.isEqual(null, parsed)).toBe(false);
    expect(adapter.isEqual(parsed, parsed)).toBe(true);

    expect(adapter.formatByString(parsed, 'yyyy-MM-dd')).toBe('2024-02-10');
    expect(adapter.format(parsed, 'keyboardDate')).toEqual(expect.any(String));
  });

  it('compares and checks ranges', () => {
    const adapter = new AdapterDateFns();
    const base = new Date(2024, 0, 10, 10, 0, 0, 0);
    const later = new Date(2024, 0, 11, 10, 0, 0, 0);
    const sameHour = new Date(2024, 0, 10, 10, 30, 0, 0);

    expect(adapter.isSameYear(base, later)).toBe(true);
    expect(adapter.isSameMonth(base, later)).toBe(true);
    expect(adapter.isSameDay(base, later)).toBe(false);
    expect(adapter.isSameHour(base, sameHour)).toBe(true);

    expect(adapter.isAfter(later, base)).toBe(true);
    expect(adapter.isAfterDay(later, base)).toBe(true);
    expect(adapter.isBefore(base, later)).toBe(true);
    expect(adapter.isBeforeDay(base, later)).toBe(true);

    const nextYear = new Date(2025, 0, 1);
    const prevYear = new Date(2023, 11, 31);
    expect(adapter.isAfterYear(nextYear, base)).toBe(true);
    expect(adapter.isBeforeYear(prevYear, base)).toBe(true);

    expect(
      adapter.isWithinRange(base, [
        new Date(2024, 0, 1),
        new Date(2024, 0, 31),
      ])
    ).toBe(true);
  });

  it('handles getters, setters, and math helpers', () => {
    const adapter = new AdapterDateFns();
    const date = new Date(2024, 0, 15, 8, 30, 45, 123);

    expect(adapter.getYear(date)).toBe(2024);
    expect(adapter.getMonth(date)).toBe(0);
    expect(adapter.getDate(date)).toBe(15);
    expect(adapter.getHours(date)).toBe(8);
    expect(adapter.getMinutes(date)).toBe(30);
    expect(adapter.getSeconds(date)).toBe(45);
    expect(adapter.getMilliseconds(date)).toBe(123);

    expect(adapter.addDays(date, 5).getDate()).toBe(20);
    expect(adapter.addWeeks(date, 1)).toBeInstanceOf(Date);
    expect(adapter.addMonths(date, 1).getMonth()).toBe(1);
    expect(adapter.addYears(date, 1).getFullYear()).toBe(2025);
    expect(adapter.addHours(date, 1)).toBeInstanceOf(Date);
    expect(adapter.addMinutes(date, 1)).toBeInstanceOf(Date);
    expect(adapter.addSeconds(date, 1)).toBeInstanceOf(Date);

    expect(adapter.setYear(date, 2030).getFullYear()).toBe(2030);
    expect(adapter.setMonth(date, 5).getMonth()).toBe(5);
    expect(adapter.setDate(date, 22).getDate()).toBe(22);
    expect(adapter.setHours(date, 12).getHours()).toBe(12);
    expect(adapter.setMinutes(date, 5).getMinutes()).toBe(5);
    expect(adapter.setSeconds(date, 6).getSeconds()).toBe(6);
    expect(adapter.setMilliseconds(date, 456).getMilliseconds()).toBe(456);

    expect(adapter.getDaysInMonth(new Date(2024, 1, 1))).toBe(29);
    expect(adapter.getNextMonth(date).getMonth()).toBe(1);
    expect(adapter.getPreviousMonth(date).getMonth()).toBe(11);
  });

  it('builds week arrays and year ranges', () => {
    const adapter = new AdapterDateFns();
    const weeks = adapter.getWeekArray(new Date(2024, 0, 15));

    expect(weeks.length).toBeGreaterThan(3);
    expect(weeks[0]).toHaveLength(7);

    const flatWeeks = weeks.flat();
    expect(flatWeeks.every((day) => day === null || day instanceof Date)).toBe(
      true
    );
    expect(
      flatWeeks.some(
        (day) => day && day.getFullYear() === 2024 && day.getMonth() === 0
      )
    ).toBe(true);

    const years = adapter.getYearRange(
      new Date(2020, 0, 1),
      new Date(2023, 0, 1)
    );
    expect(years.map((date) => date.getFullYear())).toEqual([
      2020,
      2021,
      2022,
      2023,
    ]);
  });
});
