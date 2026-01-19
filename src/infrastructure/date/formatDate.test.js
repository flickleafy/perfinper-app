import { formatDate } from './formatDate';

describe('formatDate', () => {
  let dateTimeFormatSpy;

  afterEach(() => {
    if (dateTimeFormatSpy) {
      dateTimeFormatSpy.mockRestore();
      dateTimeFormatSpy = null;
    }
  });

  it('formats the date using the resolved timezone', () => {
    dateTimeFormatSpy = jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: 'UTC' }),
      format: () => '05/02',
    }));

    const result = formatDate('2024-02-05T00:00:00.000Z');

    expect(result).toBe('05/02');
    expect(dateTimeFormatSpy).toHaveBeenCalledWith();
    expect(dateTimeFormatSpy).toHaveBeenCalledWith('pt-BR', {
      month: '2-digit',
      day: '2-digit',
      timeZone: 'UTC',
    });
  });
});
