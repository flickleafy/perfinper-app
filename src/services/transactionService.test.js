import http from '../infrastructure/http/http-common';
import {
  insertTransaction,
  findTransactionById,
  updateTransactionById,
  deleteTransactionById,
  separateTransactionById,
  findAllTransactionsInPeriod,
  removeAllTransactionsInPeriod,
  findUniquePeriods,
  findUniqueYears,
} from './transactionService';

jest.mock('../infrastructure/http/http-common');
jest.mock('react-promise-tracker', () => ({
  trackPromise: jest.fn((promise) => promise),
}));

describe('transactionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('insertTransaction', () => {
    it('should post transaction data', async () => {
      const mockData = { amount: 100, description: 'Test' };
      http.post.mockResolvedValue({ data: { id: '1', ...mockData } });

      await insertTransaction(mockData);

      expect(http.post).toHaveBeenCalledWith('/api/transaction/', mockData);
    });
  });

  describe('findTransactionById', () => {
    it('should get transaction by id', async () => {
      const id = 'txn123';
      http.get.mockResolvedValue({ data: { id, amount: 100 } });

      await findTransactionById(id);

      expect(http.get).toHaveBeenCalledWith(`/api/transaction/${id}`);
    });
  });

  describe('updateTransactionById', () => {
    it('should update transaction by id', async () => {
      const id = 'txn123';
      const updateData = { amount: 200 };
      http.put.mockResolvedValue({ data: { id, ...updateData } });

      await updateTransactionById(id, updateData);

      expect(http.put).toHaveBeenCalledWith(`/api/transaction/${id}`, updateData);
    });
  });

  describe('deleteTransactionById', () => {
    it('should delete transaction by id', async () => {
      const id = 'txn123';
      http.delete.mockResolvedValue({ data: { success: true } });

      await deleteTransactionById(id);

      expect(http.delete).toHaveBeenCalledWith(`/api/transaction/${id}`);
    });
  });

  describe('separateTransactionById', () => {
    it('should separate transaction by id', async () => {
      const id = 'txn123';
      http.post.mockResolvedValue({ data: { success: true } });

      await separateTransactionById(id);

      expect(http.post).toHaveBeenCalledWith(`/api/transaction/separate/${id}`);
    });
  });

  describe('findAllTransactionsInPeriod', () => {
    it('should get all transactions in a period', async () => {
      const period = '2023-12';
      http.get.mockResolvedValue({ data: [{ id: '1' }, { id: '2' }] });

      await findAllTransactionsInPeriod(period);

      expect(http.get).toHaveBeenCalledWith(`/api/transaction/period/${period}`);
    });
  });

  describe('removeAllTransactionsInPeriod', () => {
    it('should delete all transactions in a period', async () => {
      const period = '2023-12';
      http.delete.mockResolvedValue({ data: { success: true } });

      await removeAllTransactionsInPeriod(period);

      expect(http.delete).toHaveBeenCalledWith(`/api/transaction/period/${period}`);
    });
  });

  describe('findUniquePeriods', () => {
    it('should get unique periods', async () => {
      http.post.mockResolvedValue({ data: ['2023-01', '2023-02', '2023-03'] });

      await findUniquePeriods();

      expect(http.post).toHaveBeenCalledWith('/api/transaction/periods/');
    });
  });

  describe('findUniqueYears', () => {
    it('should get unique years', async () => {
      http.post.mockResolvedValue({ data: ['2022', '2023', '2024'] });

      await findUniqueYears();

      expect(http.post).toHaveBeenCalledWith('/api/transaction/years/');
    });
  });
});
