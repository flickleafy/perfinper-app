import http from '../infrastructure/http/http-common';
import {
  importFlashTransactions,
  importMercadolivreTransactions,
  importNubankTransactions,
  importNubankCreditTransactions,
  importDigioCreditTransactions,
} from './importService';

jest.mock('../infrastructure/http/http-common');
jest.mock('react-promise-tracker', () => ({
  trackPromise: jest.fn((promise) => promise),
}));

describe('importService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('importNubankTransactions', () => {
    it('should call API without fiscalBookId when not provided', async () => {
      const mockData = [{ id: 1, amount: 100 }];
      http.post.mockResolvedValue({ data: { success: true } });

      await importNubankTransactions(mockData);

      expect(http.post).toHaveBeenCalledWith('/api/import/nubank', mockData, { params: {} });
    });

    it('should call API with fiscalBookId when provided', async () => {
      const mockData = [{ id: 1, amount: 100 }];
      const fiscalBookId = 'fb123';
      http.post.mockResolvedValue({ data: { success: true } });

      await importNubankTransactions(mockData, fiscalBookId);

      expect(http.post).toHaveBeenCalledWith('/api/import/nubank', mockData, {
        params: { fiscalBookId },
      });
    });
  });

  describe('importNubankCreditTransactions', () => {
    it('should call API with correct endpoint and fiscalBookId', async () => {
      const mockData = [{ id: 2, amount: 200 }];
      const fiscalBookId = 'fb456';
      http.post.mockResolvedValue({ data: { success: true } });

      await importNubankCreditTransactions(mockData, fiscalBookId);

      expect(http.post).toHaveBeenCalledWith('/api/import/nubank-credit', mockData, {
        params: { fiscalBookId },
      });
    });
  });

  describe('importDigioCreditTransactions', () => {
    it('should call API with correct endpoint', async () => {
      const mockData = [{ id: 3, amount: 300 }];
      http.post.mockResolvedValue({ data: { success: true } });

      await importDigioCreditTransactions(mockData);

      expect(http.post).toHaveBeenCalledWith('/api/import/digio-credit', mockData, {
        params: {},
      });
    });
  });

  describe('importFlashTransactions', () => {
    it('should call API with correct endpoint and fiscalBookId', async () => {
      const mockData = [{ id: 4, amount: 400 }];
      const fiscalBookId = 'fb789';
      http.post.mockResolvedValue({ data: { success: true } });

      await importFlashTransactions(mockData, fiscalBookId);

      expect(http.post).toHaveBeenCalledWith('/api/import/flash', mockData, {
        params: { fiscalBookId },
      });
    });
  });

  describe('importMercadolivreTransactions', () => {
    it('should call API with correct endpoint', async () => {
      const mockData = [{ id: 5, amount: 500 }];
      http.post.mockResolvedValue({ data: { success: true } });

      await importMercadolivreTransactions(mockData);

      expect(http.post).toHaveBeenCalledWith('/api/import/mercadolivre', mockData, {
        params: {},
      });
    });
  });
});
