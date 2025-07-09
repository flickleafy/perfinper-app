import { sortPeriods } from './sortPeriods';

describe('sortPeriods', () => {
  it('keeps empty option first and sorts newest year first with months descending', () => {
    const input = [
      '2023-01',
      '2025-02',
      '2024',
      '2025',
      '2024-12',
      '',
      '2025-12',
      '2024-01',
      '2023',
      '2023-11',
    ];

    expect(sortPeriods(input)).toEqual([
      '',
      '2025',
      '2025-12',
      '2025-02',
      '2024',
      '2024-12',
      '2024-01',
      '2023',
      '2023-11',
      '2023-01',
    ]);
  });

  it('pushes unknown formats to the end (after known year/month)', () => {
    const input = ['2024-01', '2024', 'foo', '2023-12', 'bar', ''];

    expect(sortPeriods(input)).toEqual(['', '2024', '2024-01', '2023-12', 'foo', 'bar']);
  });
});
