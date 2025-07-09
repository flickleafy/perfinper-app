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
  });
});
