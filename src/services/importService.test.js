import {
  importNubankTransactions,
  importNubankCreditTransactions,
  importDigioCreditTransactions,
  importFlashTransactions,
  importMercadolivreTransactions,
} from './importService';
import http from '../infrastructure/http/http-common.js';
import { trackPromise } from 'react-promise-tracker';

jest.mock('../infrastructure/http/http-common.js', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

jest.mock('react-promise-tracker', () => ({
  __esModule: true,
  trackPromise: jest.fn((promise) => promise),
}));

describe('importService', () => {
  const data = [{ id: 1 }];

  beforeEach(() => {
    jest.clearAllMocks();
    http.post.mockResolvedValue({ data: { ok: true } });
  });

  const cases = [
    ['nubank', importNubankTransactions, '/api/import/nubank'],
    ['nubank-credit', importNubankCreditTransactions, '/api/import/nubank-credit'],
    ['digio-credit', importDigioCreditTransactions, '/api/import/digio-credit'],
    ['flash', importFlashTransactions, '/api/import/flash'],
    ['mercadolivre', importMercadolivreTransactions, '/api/import/mercadolivre'],
  ];

  it.each(cases)('posts %s imports without fiscal book', async (_, fn, url) => {
    await fn(data);

    expect(http.post).toHaveBeenCalledWith(url, data, { params: {} });
    expect(trackPromise).toHaveBeenCalled();
  });

  it.each(cases)('posts %s imports with fiscal book', async (_, fn, url) => {
    await fn(data, 'fb1');

    expect(http.post).toHaveBeenCalledWith(url, data, { params: { fiscalBookId: 'fb1' } });
    expect(trackPromise).toHaveBeenCalled();
  });
});
