import { formatDatePeriod } from './formatDatePeriod';

describe('formatDatePeriod', () => {
  it('returns the timestamp and period string', () => {
    const date = new Date(2024, 2, 5, 12, 0, 0);

    const result = formatDatePeriod(date);

    expect(result.transactionDate).toBe(date.getTime());
    expect(result.transactionPeriod).toBe('2024-03');
  });
});
