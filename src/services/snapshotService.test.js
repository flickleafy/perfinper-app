import http from '../infrastructure/http/http-common';
import snapshotService from './snapshotService';

jest.mock('../infrastructure/http/http-common', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('react-promise-tracker', () => ({
  trackPromise: (promise) => promise,
}));

describe('snapshotService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== createSnapshot =====
  describe('createSnapshot', () => {
    test('calls API and returns data', async () => {
      http.post.mockResolvedValue({ data: { success: true, data: { _id: 'snap1' } } });

      const result = await snapshotService.createSnapshot('fb1', { name: 'Test' });

      expect(http.post).toHaveBeenCalledWith('/api/fiscal-book/fb1/snapshots', { name: 'Test' });
      expect(result.data._id).toBe('snap1');
    });

    test('throws on error', async () => {
      http.post.mockRejectedValue({
        response: { data: { message: 'Create failed' } },
      });

      await expect(snapshotService.createSnapshot('fb1', {})).rejects.toThrow('Create failed');
    });
  });

  // ===== getSnapshots =====
  describe('getSnapshots', () => {
    test('calls API with filters', async () => {
      http.get.mockResolvedValue({ data: { success: true, data: [] } });

      const result = await snapshotService.getSnapshots('fb1', { tags: ['audit'], limit: 10 });

      expect(http.get).toHaveBeenCalledWith('/api/fiscal-book/fb1/snapshots', {
        params: { tags: 'audit', limit: 10 },
      });
      expect(result.data).toEqual([]);
    });

    test('handles empty filters', async () => {
      http.get.mockResolvedValue({ data: { success: true, data: [] } });

      await snapshotService.getSnapshots('fb1');

      expect(http.get).toHaveBeenCalledWith('/api/fiscal-book/fb1/snapshots', { params: {} });
    });
  });

  // ===== getSnapshotById =====
  describe('getSnapshotById', () => {
    test('returns snapshot details', async () => {
      http.get.mockResolvedValue({ data: { success: true, data: { _id: 'snap1' } } });

      const result = await snapshotService.getSnapshotById('snap1');

      expect(http.get).toHaveBeenCalledWith('/api/snapshots/snap1');
      expect(result.data._id).toBe('snap1');
    });
  });

  // ===== getSnapshotTransactions =====
  describe('getSnapshotTransactions', () => {
    test('returns paginated transactions', async () => {
      http.get.mockResolvedValue({ data: { success: true, data: [] } });

      const result = await snapshotService.getSnapshotTransactions('snap1', { limit: 20 });

      expect(http.get).toHaveBeenCalledWith('/api/snapshots/snap1/transactions', {
        params: { limit: 20 },
      });
      expect(result.data).toEqual([]);
    });
  });

  // ===== deleteSnapshot =====
  describe('deleteSnapshot', () => {
    test('calls delete API', async () => {
      http.delete.mockResolvedValue({ data: { success: true } });

      const result = await snapshotService.deleteSnapshot('snap1');

      expect(http.delete).toHaveBeenCalledWith('/api/snapshots/snap1');
      expect(result.success).toBe(true);
    });

    test('throws on error', async () => {
      http.delete.mockRejectedValue({
        response: { data: { message: 'Cannot delete protected' } },
      });

      await expect(snapshotService.deleteSnapshot('snap1')).rejects.toThrow('Cannot delete protected');
    });
  });

  // ===== compareSnapshot =====
  describe('compareSnapshot', () => {
    test('returns comparison data', async () => {
      http.get.mockResolvedValue({
        data: { success: true, data: { counts: { added: 1 } } },
      });

      const result = await snapshotService.compareSnapshot('snap1');

      expect(http.get).toHaveBeenCalledWith('/api/snapshots/snap1/compare');
      expect(result.data.counts.added).toBe(1);
    });
  });

  // ===== updateTags =====
  describe('updateTags', () => {
    test('calls API with tags', async () => {
      http.put.mockResolvedValue({ data: { success: true } });

      const result = await snapshotService.updateTags('snap1', ['audit', 'test']);

      expect(http.put).toHaveBeenCalledWith('/api/snapshots/snap1/tags', { tags: ['audit', 'test'] });
      expect(result.success).toBe(true);
    });
  });

  // ===== toggleProtection =====
  describe('toggleProtection', () => {
    test('calls API', async () => {
      http.put.mockResolvedValue({ data: { success: true } });

      const result = await snapshotService.toggleProtection('snap1', true);

      expect(http.put).toHaveBeenCalledWith('/api/snapshots/snap1/protection', { isProtected: true });
      expect(result.success).toBe(true);
    });
  });

  // ===== addSnapshotAnnotation =====
  describe('addSnapshotAnnotation', () => {
    test('calls API with content', async () => {
      http.post.mockResolvedValue({ data: { success: true } });

      const result = await snapshotService.addSnapshotAnnotation('snap1', 'Note content', 'user1');

      expect(http.post).toHaveBeenCalledWith('/api/snapshots/snap1/annotations', {
        content: 'Note content',
        createdBy: 'user1',
      });
      expect(result.success).toBe(true);
    });
  });

  // ===== exportSnapshot =====
  describe('exportSnapshot', () => {
    test('returns blob', async () => {
      const mockBlob = new Blob(['data']);
      http.get.mockResolvedValue({ data: mockBlob });

      const result = await snapshotService.exportSnapshot('snap1', 'json');

      expect(http.get).toHaveBeenCalledWith('/api/snapshots/snap1/export', {
        params: { format: 'json' },
        responseType: 'blob',
      });
      expect(result).toBe(mockBlob);
    });
  });

  // ===== cloneToNewFiscalBook =====
  describe('cloneToNewFiscalBook', () => {
    test('calls API', async () => {
      http.post.mockResolvedValue({ data: { success: true, data: { _id: 'fb2' } } });

      const result = await snapshotService.cloneToNewFiscalBook('snap1', { bookName: 'Copy' });

      expect(http.post).toHaveBeenCalledWith('/api/snapshots/snap1/clone', { bookName: 'Copy' });
      expect(result.data._id).toBe('fb2');
    });
  });

  // ===== rollbackToSnapshot =====
  describe('rollbackToSnapshot', () => {
    test('calls API', async () => {
      http.post.mockResolvedValue({ data: { success: true } });

      const result = await snapshotService.rollbackToSnapshot('snap1', { createPreRollbackSnapshot: true });

      expect(http.post).toHaveBeenCalledWith('/api/snapshots/snap1/rollback', { createPreRollbackSnapshot: true });
      expect(result.success).toBe(true);
    });
  });

  // ===== getSchedule =====
  describe('getSchedule', () => {
    test('returns schedule', async () => {
      http.get.mockResolvedValue({ data: { success: true, data: { enabled: true } } });

      const result = await snapshotService.getSchedule('fb1');

      expect(http.get).toHaveBeenCalledWith('/api/fiscal-book/fb1/snapshots/schedule');
      expect(result.data.enabled).toBe(true);
    });
  });

  // ===== updateSchedule =====
  describe('updateSchedule', () => {
    test('calls API', async () => {
      http.put.mockResolvedValue({ data: { success: true } });

      const result = await snapshotService.updateSchedule('fb1', { enabled: true, frequency: 'weekly' });

      expect(http.put).toHaveBeenCalledWith('/api/fiscal-book/fb1/snapshots/schedule', {
        enabled: true,
        frequency: 'weekly',
      });
      expect(result.success).toBe(true);
    });
  });
});
