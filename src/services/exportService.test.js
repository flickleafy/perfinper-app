import http from '../infrastructure/http/http-common';
import { exportTransactions } from './exportService';

jest.mock('../infrastructure/http/http-common');
jest.mock('react-promise-tracker', () => ({
  trackPromise: jest.fn((promise) => promise),
}));

describe('exportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exports transactions for a given year', async () => {
    http.get.mockResolvedValue({ data: 'ok' });

    await exportTransactions('2024');

    expect(http.get).toHaveBeenCalledWith('/api/export/transactions/2024');
  });
});
