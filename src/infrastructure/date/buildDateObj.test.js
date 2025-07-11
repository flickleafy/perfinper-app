import { buildDateObj } from './buildDateObj';

describe('buildDateObj', () => {
  it('builds a Date from year, month, and day', () => {
    const date = buildDateObj({ year: 2024, month: 3, day: 15 });

    expect(date).toBeInstanceOf(Date);
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(2);
    expect(date.getDate()).toBe(15);
  });
});
