jest.mock('../infrastructure/http/http-common.js', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock('react-promise-tracker', () => ({
  __esModule: true,
  trackPromise: jest.fn((promise) => promise),
}));

let http;
let fiscalBookService;

describe('fiscalBookService', () => {
  beforeEach(() => {
    jest.resetModules();
    http = require('../infrastructure/http/http-common.js').default;
    fiscalBookService = require('./fiscalBookService').default;
    jest.clearAllMocks();
  });

  describe('validateId', () => {
    it('should throw error for invalid IDs', () => {
      expect(() => fiscalBookService.validateId(null)).toThrow('Invalid fiscal book ID');
      expect(() => fiscalBookService.validateId('undefined')).toThrow('Invalid fiscal book ID');
      expect(() => fiscalBookService.validateId('')).toThrow('Invalid fiscal book ID');
      expect(() => fiscalBookService.validateId('  ')).toThrow('Invalid fiscal book ID');
    });

    it('should not throw error for valid ID', () => {
      expect(() => fiscalBookService.validateId('fb123')).not.toThrow();
    });
  });

  describe('getAll', () => {
    it('should fetch all fiscal books without filters', async () => {
      const mockBooks = [{ id: 'fb1', bookName: 'Book 1' }];
      http.get.mockResolvedValue({ data: mockBooks });

      const result = await fiscalBookService.getAll();

      expect(http.get).toHaveBeenCalledWith('/api/fiscal-book', { params: {} });
      expect(result).toEqual(mockBooks);
    });

    it('should fetch fiscal books with filters', async () => {
      const filters = { status: 'Aberto', period: '2023' };
      const mockBooks = [{ id: 'fb1', bookName: 'Book 1', status: 'Aberto' }];
      http.get.mockResolvedValue({ data: mockBooks });

      const result = await fiscalBookService.getAll(filters);

      expect(http.get).toHaveBeenCalledWith('/api/fiscal-book', { params: filters });
      expect(result).toEqual(mockBooks);
    });

    it('should handle errors when fetching fiscal books', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      http.get.mockRejectedValue(new Error('Network error'));

      try {
        await expect(fiscalBookService.getAll()).rejects.toThrow('Failed to fetch fiscal books');
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe('getById', () => {
    it('should fetch fiscal book by id', async () => {
      const id = 'fb123';
      const mockBook = { id, bookName: 'Test Book' };
      http.get.mockResolvedValue({ data: mockBook });

      const result = await fiscalBookService.getById(id);

      expect(http.get).toHaveBeenCalledWith(`/api/fiscal-book/${id}`);
      expect(result).toEqual(mockBook);
    });

    it('should throw error for invalid id', async () => {
      await expect(fiscalBookService.getById(null)).rejects.toThrow('Invalid fiscal book ID');
    });

    it('should throw default error when fetching fiscal book fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      http.get.mockRejectedValue(new Error('Network error'));

      try {
        await expect(fiscalBookService.getById('fb123')).rejects.toThrow(
          'Failed to fetch fiscal book'
        );
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe('create', () => {
    it('should create a new fiscal book', async () => {
      const bookData = { bookName: 'New Book', bookPeriod: '2023' };
      const mockResponse = { id: 'fb123', ...bookData };
      http.post.mockResolvedValue({ data: mockResponse });

      const result = await fiscalBookService.create(bookData);

      expect(http.post).toHaveBeenCalledWith('/api/fiscal-book', bookData);
      expect(result).toEqual(mockResponse);
    });

    it('should surface API error message when creating fiscal book fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      http.post.mockRejectedValue({ response: { data: { message: 'Create failed' } } });

      try {
        await expect(fiscalBookService.create({})).rejects.toThrow('Create failed');
      } finally {
        consoleSpy.mockRestore();
      }
    });

    it('should throw default error when create fails without message', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      http.post.mockRejectedValue(new Error('Network error'));

      try {
        await expect(fiscalBookService.create({})).rejects.toThrow('Failed to create fiscal book');
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe('update', () => {
    it('should update fiscal book', async () => {
      const id = 'fb123';
      const updateData = { bookName: 'Updated Book' };
      const mockResponse = { id, ...updateData };
      http.put.mockResolvedValue({ data: mockResponse });

      const result = await fiscalBookService.update(id, updateData);

      expect(http.put).toHaveBeenCalledWith(`/api/fiscal-book/${id}`, updateData);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error for invalid id', async () => {
      await expect(fiscalBookService.update('', {})).rejects.toThrow('Invalid fiscal book ID');
    });

    it('should surface API error message when updating fiscal book fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      http.put.mockRejectedValue({ response: { data: { message: 'Update failed' } } });

      try {
        await expect(fiscalBookService.update('fb123', {})).rejects.toThrow('Update failed');
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe('delete', () => {
    it('should delete fiscal book', async () => {
      const id = 'fb123';
      http.delete.mockResolvedValue({ data: { success: true } });

      const result = await fiscalBookService.delete(id);

      expect(http.delete).toHaveBeenCalledWith(`/api/fiscal-book/${id}`);
      expect(result).toEqual({ success: true });
    });

    it('should throw error for invalid id', async () => {
      await expect(fiscalBookService.delete(null)).rejects.toThrow('Invalid fiscal book ID');
    });

    it('should surface API error message when deleting fiscal book fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      http.delete.mockRejectedValue({ response: { data: { message: 'Delete failed' } } });

      try {
        await expect(fiscalBookService.delete('fb123')).rejects.toThrow('Delete failed');
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe('close and reopen', () => {
    it('should close fiscal book', async () => {
      http.put.mockResolvedValue({ data: { status: 'Closed' } });

      const result = await fiscalBookService.close('fb123');

      expect(http.put).toHaveBeenCalledWith('/api/fiscal-book/fb123/close');
      expect(result).toEqual({ status: 'Closed' });
    });

    it('should reopen fiscal book', async () => {
      http.put.mockResolvedValue({ data: { status: 'Open' } });

      const result = await fiscalBookService.reopen('fb123');

      expect(http.put).toHaveBeenCalledWith('/api/fiscal-book/fb123/reopen');
      expect(result).toEqual({ status: 'Open' });
    });

    it('should surface API error message when closing fiscal book fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      http.put.mockRejectedValue({ response: { data: { message: 'Close failed' } } });

      try {
        await expect(fiscalBookService.close('fb123')).rejects.toThrow('Close failed');
      } finally {
        consoleSpy.mockRestore();
      }
    });

    it('should surface API error message when reopening fiscal book fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      http.put.mockRejectedValue({ response: { data: { message: 'Reopen failed' } } });

      try {
        await expect(fiscalBookService.reopen('fb123')).rejects.toThrow('Reopen failed');
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe('transactions operations', () => {
    it('should add transactions to a fiscal book', async () => {
      const transactionIds = ['t1', 't2'];
      http.post.mockResolvedValue({ data: { success: true } });

      const result = await fiscalBookService.addTransactions('fb123', transactionIds);

      expect(http.post).toHaveBeenCalledWith('/api/fiscal-book/fb123/transactions', {
        transactionIds,
      });
      expect(result).toEqual({ success: true });
    });

    it('should surface API error message when adding transactions fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      http.post.mockRejectedValue({ response: { data: { message: 'Add failed' } } });

      try {
        await expect(
          fiscalBookService.addTransactions('fb123', ['t1'])
        ).rejects.toThrow('Add failed');
      } finally {
        consoleSpy.mockRestore();
      }
    });

    it('should add a single transaction to a fiscal book', async () => {
      http.put.mockResolvedValue({ data: { success: true } });

      const result = await fiscalBookService.addTransaction('fb123', 't1');

      expect(http.put).toHaveBeenCalledWith('/api/fiscal-book/fb123/transactions/t1');
      expect(result).toEqual({ success: true });
    });

    it('should surface API error message when adding a transaction fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      http.put.mockRejectedValue({ response: { data: { message: 'Add single failed' } } });

      try {
        await expect(fiscalBookService.addTransaction('fb123', 't1')).rejects.toThrow(
          'Add single failed'
        );
      } finally {
        consoleSpy.mockRestore();
      }
    });

    it('should remove a single transaction', async () => {
      http.delete.mockResolvedValue({ data: { success: true } });

      const result = await fiscalBookService.removeTransaction('t1');

      expect(http.delete).toHaveBeenCalledWith('/api/fiscal-book/transactions/t1');
      expect(result).toEqual({ success: true });
    });

    it('should surface API error message when removing a transaction fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      http.delete.mockRejectedValue({ response: { data: { message: 'Remove failed' } } });

      try {
        await expect(fiscalBookService.removeTransaction('t1')).rejects.toThrow('Remove failed');
      } finally {
        consoleSpy.mockRestore();
      }
    });

    it('should remove transactions in bulk', async () => {
      const removeSpy = jest
        .spyOn(fiscalBookService, 'removeTransaction')
        .mockResolvedValue({ success: true });

      const result = await fiscalBookService.removeTransactions('fb123', ['t1', 't2']);

      expect(removeSpy).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ success: true, results: [{ success: true }, { success: true }] });

      removeSpy.mockRestore();
    });

    it('should throw default error when removing transactions fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const removeSpy = jest
        .spyOn(fiscalBookService, 'removeTransaction')
        .mockRejectedValue(new Error('Remove failed'));

      try {
        await expect(
          fiscalBookService.removeTransactions('fb123', ['t1'])
        ).rejects.toThrow('Failed to remove transactions from fiscal book');
      } finally {
        removeSpy.mockRestore();
        consoleSpy.mockRestore();
      }
    });

    it('should surface API error message when removing transactions fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const removeSpy = jest
        .spyOn(fiscalBookService, 'removeTransaction')
        .mockRejectedValue({ response: { data: { message: 'Bulk remove failed' } } });

      try {
        await expect(
          fiscalBookService.removeTransactions('fb123', ['t1'])
        ).rejects.toThrow('Bulk remove failed');
      } finally {
        removeSpy.mockRestore();
        consoleSpy.mockRestore();
      }
    });

    it('should transfer transactions between fiscal books', async () => {
      const removeSpy = jest
        .spyOn(fiscalBookService, 'removeTransaction')
        .mockResolvedValue({ success: true });
      const addSpy = jest
        .spyOn(fiscalBookService, 'addTransactions')
        .mockResolvedValue({ success: true });

      const result = await fiscalBookService.transferTransactions('source', 'target', [
        't1',
        't2',
      ]);

      expect(removeSpy).toHaveBeenCalledTimes(2);
      expect(addSpy).toHaveBeenCalledWith('target', ['t1', 't2']);
      expect(result).toEqual({ success: true, message: 'Transactions transferred successfully' });

      removeSpy.mockRestore();
      addSpy.mockRestore();
    });

    it('should transfer transactions to target only when source is missing', async () => {
      const removeSpy = jest.spyOn(fiscalBookService, 'removeTransaction');
      const addSpy = jest
        .spyOn(fiscalBookService, 'addTransactions')
        .mockResolvedValue({ success: true });

      const result = await fiscalBookService.transferTransactions(null, 'target', ['t1']);

      expect(removeSpy).not.toHaveBeenCalled();
      expect(addSpy).toHaveBeenCalledWith('target', ['t1']);
      expect(result).toEqual({ success: true, message: 'Transactions transferred successfully' });

      removeSpy.mockRestore();
      addSpy.mockRestore();
    });

    it('should remove transactions only when target is missing', async () => {
      const removeSpy = jest
        .spyOn(fiscalBookService, 'removeTransaction')
        .mockResolvedValue({ success: true });
      const addSpy = jest.spyOn(fiscalBookService, 'addTransactions');

      const result = await fiscalBookService.transferTransactions('source', null, ['t1']);

      expect(removeSpy).toHaveBeenCalledWith('t1');
      expect(addSpy).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: 'Transactions transferred successfully' });

      removeSpy.mockRestore();
      addSpy.mockRestore();
    });

    it('should throw default error when transferring transactions fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const removeSpy = jest
        .spyOn(fiscalBookService, 'removeTransaction')
        .mockRejectedValue(new Error('Remove failed'));

      try {
        await expect(
          fiscalBookService.transferTransactions('source', 'target', ['t1'])
        ).rejects.toThrow('Failed to transfer transactions');
      } finally {
        removeSpy.mockRestore();
        consoleSpy.mockRestore();
      }
    });
  });

  describe('getTransactions', () => {
    it('should fetch transactions for fiscal book', async () => {
      const id = 'fb123';
      const mockTransactions = [{ id: 't1' }, { id: 't2' }];
      http.get.mockResolvedValue({ data: mockTransactions });

      const result = await fiscalBookService.getTransactions(id);

      expect(http.get).toHaveBeenCalledWith(`/api/fiscal-book/${id}/transactions`, { params: {} });
      expect(result).toEqual(mockTransactions);
    });

    it('should throw error for invalid id', async () => {
      await expect(fiscalBookService.getTransactions('')).rejects.toThrow('Invalid fiscal book ID');
    });

    it('should throw default error when fetching transactions fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      http.get.mockRejectedValue(new Error('Network error'));

      try {
        await expect(fiscalBookService.getTransactions('fb123')).rejects.toThrow(
          'Failed to fetch fiscal book transactions'
        );
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe('getStatistics', () => {
    it('should fetch fiscal book statistics', async () => {
      const stats = { count: 2 };
      http.get.mockResolvedValue({ data: stats });

      const result = await fiscalBookService.getStatistics();

      expect(http.get).toHaveBeenCalledWith('/api/fiscal-book/statistics');
      expect(result).toEqual(stats);
    });

    it('should throw default error when fetching statistics fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      http.get.mockRejectedValue(new Error('Network error'));

      try {
        await expect(fiscalBookService.getStatistics()).rejects.toThrow(
          'Failed to fetch fiscal book statistics'
        );
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe('export', () => {
    it('should export fiscal book as csv by default', async () => {
      http.get.mockResolvedValue({ data: 'blob' });

      const result = await fiscalBookService.export('fb123');

      expect(http.get).toHaveBeenCalledWith('/api/export/fiscal-book/fb123/csv', {
        params: { transactions: true },
        responseType: 'blob',
      });
      expect(result).toBe('blob');
    });

    it('should export fiscal book as json without transactions', async () => {
      http.get.mockResolvedValue({ data: 'blob' });

      const result = await fiscalBookService.export('fb123', 'json', false);

      expect(http.get).toHaveBeenCalledWith('/api/export/fiscal-book/fb123/json', {
        params: { transactions: false },
        responseType: 'blob',
      });
      expect(result).toBe('blob');
    });

    it('should throw default error when export fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      http.get.mockRejectedValue(new Error('Network error'));

      try {
        await expect(fiscalBookService.export('fb123')).rejects.toThrow(
          'Failed to export fiscal book'
        );
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe('getFiltered', () => {
    it('should map filters to params', async () => {
      const filters = {
        type: 'Entrada',
        period: '2024',
        status: 'Aberto',
        company: 'c1',
        limit: 10,
        skip: 5,
        sort: '-createdAt',
      };
      http.get.mockResolvedValue({ data: [] });

      await fiscalBookService.getFiltered(filters);

      expect(http.get).toHaveBeenCalledWith('/api/fiscal-book', { params: filters });
    });

    it('should call getAll with empty params when no filters are provided', async () => {
      http.get.mockResolvedValue({ data: [] });

      await fiscalBookService.getFiltered();

      expect(http.get).toHaveBeenCalledWith('/api/fiscal-book', { params: {} });
    });
  });

  describe('validateFiscalBook', () => {
    it('should report missing required fields', () => {
      const result = fiscalBookService.validateFiscalBook({});

      expect(result.isValid).toBe(false);
      expect(result.errors.bookName).toBeTruthy();
      expect(result.errors.bookPeriod).toBeTruthy();
    });

    it('should report invalid period format', () => {
      const result = fiscalBookService.validateFiscalBook({ bookName: 'Book', bookPeriod: '20-1' });

      expect(result.isValid).toBe(false);
      expect(result.errors.bookPeriod).toBeTruthy();
    });

    it('should report out-of-range period year', () => {
      const futureYear = new Date().getFullYear() + 2;
      const result = fiscalBookService.validateFiscalBook({
        bookName: 'Book',
        bookPeriod: `${futureYear}`,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.bookPeriod).toBeTruthy();
    });

    it('should report invalid optional fields', () => {
      const result = fiscalBookService.validateFiscalBook({
        bookName: 'Book',
        bookPeriod: '2024',
        notes: 'a'.repeat(501),
        reference: 'b'.repeat(101),
        bookType: 'Invalid',
        status: 'Unknown',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.notes).toBeTruthy();
      expect(result.errors.reference).toBeTruthy();
      expect(result.errors.bookType).toBeTruthy();
      expect(result.errors.status).toBeTruthy();
    });

    it('should report name length violations', () => {
      const result = fiscalBookService.validateFiscalBook({
        bookName: 'a'.repeat(101),
        bookPeriod: '2024',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.bookName).toBeTruthy();
    });

    it('should accept valid fiscal book data', () => {
      const result = fiscalBookService.validateFiscalBook({
        name: 'Book',
        year: 2024,
        notes: 'ok',
        bookType: 'Entrada',
        status: 'Aberto',
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });
});
