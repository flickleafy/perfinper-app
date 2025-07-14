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

    test('throws on error', async () => {
      http.put.mockRejectedValue({
        response: { data: { message: 'Schedule update failed' } },
      });

      await expect(snapshotService.updateSchedule('fb1', {})).rejects.toThrow('Schedule update failed');
    });

    test('throws default message when no response message', async () => {
      http.put.mockRejectedValue(new Error('Network error'));

      await expect(snapshotService.updateSchedule('fb1', {})).rejects.toThrow('Failed to update schedule');
    });
  });

  // ===== Error Path Tests =====
  describe('getSnapshots error handling', () => {
    test('throws on error with response message', async () => {
      http.get.mockRejectedValue({
        response: { data: { message: 'Snapshot fetch failed' } },
      });

      await expect(snapshotService.getSnapshots('fb1')).rejects.toThrow('Snapshot fetch failed');
    });

    test('throws default message when no response message', async () => {
      http.get.mockRejectedValue(new Error('Network error'));

      await expect(snapshotService.getSnapshots('fb1')).rejects.toThrow('Failed to fetch snapshots');
    });

    test('handles skip filter parameter', async () => {
      http.get.mockResolvedValue({ data: { success: true, data: [] } });

      await snapshotService.getSnapshots('fb1', { skip: 5 });

      expect(http.get).toHaveBeenCalledWith('/api/fiscal-book/fb1/snapshots', {
        params: { skip: 5 },
      });
    });

    test('handles all filter parameters together', async () => {
      http.get.mockResolvedValue({ data: { success: true, data: [] } });

      await snapshotService.getSnapshots('fb1', { tags: ['a', 'b'], limit: 10, skip: 5 });

      expect(http.get).toHaveBeenCalledWith('/api/fiscal-book/fb1/snapshots', {
        params: { tags: 'a,b', limit: 10, skip: 5 },
      });
    });

    test('ignores empty tags array', async () => {
      http.get.mockResolvedValue({ data: { success: true, data: [] } });

      await snapshotService.getSnapshots('fb1', { tags: [] });

      expect(http.get).toHaveBeenCalledWith('/api/fiscal-book/fb1/snapshots', {
        params: {},
      });
    });
  });

  describe('getSnapshotById error handling', () => {
    test('throws on error with response message', async () => {
      http.get.mockRejectedValue({
        response: { data: { message: 'Snapshot not found' } },
      });

      await expect(snapshotService.getSnapshotById('snap1')).rejects.toThrow('Snapshot not found');
    });

    test('throws default message when no response message', async () => {
      http.get.mockRejectedValue(new Error('Network error'));

      await expect(snapshotService.getSnapshotById('snap1')).rejects.toThrow('Failed to fetch snapshot');
    });
  });

  describe('getSnapshotTransactions error handling', () => {
    test('throws on error with response message', async () => {
      http.get.mockRejectedValue({
        response: { data: { message: 'Transactions fetch failed' } },
      });

      await expect(snapshotService.getSnapshotTransactions('snap1')).rejects.toThrow('Transactions fetch failed');
    });

    test('throws default message when no response message', async () => {
      http.get.mockRejectedValue(new Error('Network error'));

      await expect(snapshotService.getSnapshotTransactions('snap1')).rejects.toThrow('Failed to fetch snapshot transactions');
    });

    test('handles skip pagination parameter', async () => {
      http.get.mockResolvedValue({ data: { success: true, data: [] } });

      await snapshotService.getSnapshotTransactions('snap1', { skip: 10 });

      expect(http.get).toHaveBeenCalledWith('/api/snapshots/snap1/transactions', {
        params: { skip: 10 },
      });
    });

    test('handles both pagination parameters', async () => {
      http.get.mockResolvedValue({ data: { success: true, data: [] } });

      await snapshotService.getSnapshotTransactions('snap1', { limit: 20, skip: 10 });

      expect(http.get).toHaveBeenCalledWith('/api/snapshots/snap1/transactions', {
        params: { limit: 20, skip: 10 },
      });
    });

    test('handles empty pagination', async () => {
      http.get.mockResolvedValue({ data: { success: true, data: [] } });

      await snapshotService.getSnapshotTransactions('snap1');

      expect(http.get).toHaveBeenCalledWith('/api/snapshots/snap1/transactions', {
        params: {},
      });
    });
  });

  describe('deleteSnapshot error handling', () => {
    test('throws default message when no response message', async () => {
      http.delete.mockRejectedValue(new Error('Network error'));

      await expect(snapshotService.deleteSnapshot('snap1')).rejects.toThrow('Failed to delete snapshot');
    });
  });

  describe('compareSnapshot error handling', () => {
    test('throws on error with response message', async () => {
      http.get.mockRejectedValue({
        response: { data: { message: 'Comparison failed' } },
      });

      await expect(snapshotService.compareSnapshot('snap1')).rejects.toThrow('Comparison failed');
    });

    test('throws default message when no response message', async () => {
      http.get.mockRejectedValue(new Error('Network error'));

      await expect(snapshotService.compareSnapshot('snap1')).rejects.toThrow('Failed to compare snapshot');
    });
  });

  describe('updateTags error handling', () => {
    test('throws on error with response message', async () => {
      http.put.mockRejectedValue({
        response: { data: { message: 'Tags update failed' } },
      });

      await expect(snapshotService.updateTags('snap1', ['a'])).rejects.toThrow('Tags update failed');
    });

    test('throws default message when no response message', async () => {
      http.put.mockRejectedValue(new Error('Network error'));

      await expect(snapshotService.updateTags('snap1', ['a'])).rejects.toThrow('Failed to update tags');
    });
  });

  describe('toggleProtection error handling', () => {
    test('throws on error with response message', async () => {
      http.put.mockRejectedValue({
        response: { data: { message: 'Protection toggle failed' } },
      });

      await expect(snapshotService.toggleProtection('snap1', true)).rejects.toThrow('Protection toggle failed');
    });

    test('throws default message when no response message', async () => {
      http.put.mockRejectedValue(new Error('Network error'));

      await expect(snapshotService.toggleProtection('snap1', true)).rejects.toThrow('Failed to toggle protection');
    });
  });

  describe('addSnapshotAnnotation error handling', () => {
    test('throws on error with response message', async () => {
      http.post.mockRejectedValue({
        response: { data: { message: 'Annotation failed' } },
      });

      await expect(snapshotService.addSnapshotAnnotation('snap1', 'note')).rejects.toThrow('Annotation failed');
    });

    test('throws default message when no response message', async () => {
      http.post.mockRejectedValue(new Error('Network error'));

      await expect(snapshotService.addSnapshotAnnotation('snap1', 'note')).rejects.toThrow('Failed to add annotation');
    });

    test('uses default createdBy value', async () => {
      http.post.mockResolvedValue({ data: { success: true } });

      await snapshotService.addSnapshotAnnotation('snap1', 'content');

      expect(http.post).toHaveBeenCalledWith('/api/snapshots/snap1/annotations', {
        content: 'content',
        createdBy: 'user',
      });
    });
  });

  // ===== addTransactionAnnotation =====
  describe('addTransactionAnnotation', () => {
    test('calls API with content', async () => {
      http.post.mockResolvedValue({ data: { success: true } });

      const result = await snapshotService.addTransactionAnnotation('snap1', 'tx1', 'Note', 'user1');

      expect(http.post).toHaveBeenCalledWith(
        '/api/snapshots/snap1/transactions/tx1/annotations',
        { content: 'Note', createdBy: 'user1' }
      );
      expect(result.success).toBe(true);
    });

    test('uses default createdBy value', async () => {
      http.post.mockResolvedValue({ data: { success: true } });

      await snapshotService.addTransactionAnnotation('snap1', 'tx1', 'content');

      expect(http.post).toHaveBeenCalledWith(
        '/api/snapshots/snap1/transactions/tx1/annotations',
        { content: 'content', createdBy: 'user' }
      );
    });

    test('throws on error with response message', async () => {
      http.post.mockRejectedValue({
        response: { data: { message: 'Transaction annotation failed' } },
      });

      await expect(snapshotService.addTransactionAnnotation('snap1', 'tx1', 'note'))
        .rejects.toThrow('Transaction annotation failed');
    });

    test('throws default message when no response message', async () => {
      http.post.mockRejectedValue(new Error('Network error'));

      await expect(snapshotService.addTransactionAnnotation('snap1', 'tx1', 'note'))
        .rejects.toThrow('Failed to add annotation');
    });
  });

  describe('exportSnapshot error handling', () => {
    test('throws on error', async () => {
      http.get.mockRejectedValue(new Error('Export failed'));

      await expect(snapshotService.exportSnapshot('snap1')).rejects.toThrow('Failed to export snapshot');
    });

    test('uses default format', async () => {
      const mockBlob = new Blob(['data']);
      http.get.mockResolvedValue({ data: mockBlob });

      await snapshotService.exportSnapshot('snap1');

      expect(http.get).toHaveBeenCalledWith('/api/snapshots/snap1/export', {
        params: { format: 'json' },
        responseType: 'blob',
      });
    });

    test('accepts csv format', async () => {
      const mockBlob = new Blob(['data']);
      http.get.mockResolvedValue({ data: mockBlob });

      await snapshotService.exportSnapshot('snap1', 'csv');

      expect(http.get).toHaveBeenCalledWith('/api/snapshots/snap1/export', {
        params: { format: 'csv' },
        responseType: 'blob',
      });
    });

    test('accepts pdf format', async () => {
      const mockBlob = new Blob(['data']);
      http.get.mockResolvedValue({ data: mockBlob });

      await snapshotService.exportSnapshot('snap1', 'pdf');

      expect(http.get).toHaveBeenCalledWith('/api/snapshots/snap1/export', {
        params: { format: 'pdf' },
        responseType: 'blob',
      });
    });
  });

  // ===== downloadExport =====
  describe('downloadExport', () => {
    let mockAnchor;
    let originalCreateObjectURL;
    let originalRevokeObjectURL;
    let originalCreateElement;
    let originalAppendChild;
    let originalRemoveChild;

    beforeEach(() => {
      mockAnchor = {
        href: '',
        download: '',
        click: jest.fn(),
      };

      // Store originals
      originalCreateObjectURL = window.URL.createObjectURL;
      originalRevokeObjectURL = window.URL.revokeObjectURL;
      originalCreateElement = document.createElement.bind(document);
      originalAppendChild = document.body.appendChild.bind(document.body);
      originalRemoveChild = document.body.removeChild.bind(document.body);

      // Mock window.URL methods
      window.URL.createObjectURL = jest.fn().mockReturnValue('blob:url');
      window.URL.revokeObjectURL = jest.fn();

      // Mock document methods
      document.createElement = jest.fn().mockReturnValue(mockAnchor);
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
    });

    afterEach(() => {
      // Restore originals
      window.URL.createObjectURL = originalCreateObjectURL;
      window.URL.revokeObjectURL = originalRevokeObjectURL;
      document.createElement = originalCreateElement;
      document.body.appendChild = originalAppendChild;
      document.body.removeChild = originalRemoveChild;
    });

    test('downloads with default format and filename', async () => {
      const mockBlob = new Blob(['data']);
      http.get.mockResolvedValue({ data: mockBlob });

      await snapshotService.downloadExport('snap1');

      expect(http.get).toHaveBeenCalledWith('/api/snapshots/snap1/export', {
        params: { format: 'json' },
        responseType: 'blob',
      });
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockAnchor.href).toBe('blob:url');
      expect(mockAnchor.download).toBe('snapshot-export.json');
      expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor);
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:url');
      expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchor);
    });

    test('downloads with custom format', async () => {
      const mockBlob = new Blob(['data']);
      http.get.mockResolvedValue({ data: mockBlob });

      await snapshotService.downloadExport('snap1', 'csv');

      expect(mockAnchor.download).toBe('snapshot-export.csv');
    });

    test('downloads with custom filename', async () => {
      const mockBlob = new Blob(['data']);
      http.get.mockResolvedValue({ data: mockBlob });

      await snapshotService.downloadExport('snap1', 'json', 'my-export.json');

      expect(mockAnchor.download).toBe('my-export.json');
    });

    test('downloads with pdf format', async () => {
      const mockBlob = new Blob(['data']);
      http.get.mockResolvedValue({ data: mockBlob });

      await snapshotService.downloadExport('snap1', 'pdf');

      expect(mockAnchor.download).toBe('snapshot-export.pdf');
    });
  });

  describe('cloneToNewFiscalBook error handling', () => {
    test('throws on error with response message', async () => {
      http.post.mockRejectedValue({
        response: { data: { message: 'Clone failed' } },
      });

      await expect(snapshotService.cloneToNewFiscalBook('snap1')).rejects.toThrow('Clone failed');
    });

    test('throws default message when no response message', async () => {
      http.post.mockRejectedValue(new Error('Network error'));

      await expect(snapshotService.cloneToNewFiscalBook('snap1')).rejects.toThrow('Failed to clone snapshot');
    });

    test('handles empty newBookData', async () => {
      http.post.mockResolvedValue({ data: { success: true, data: { _id: 'fb2' } } });

      await snapshotService.cloneToNewFiscalBook('snap1');

      expect(http.post).toHaveBeenCalledWith('/api/snapshots/snap1/clone', {});
    });
  });

  describe('rollbackToSnapshot error handling', () => {
    test('throws on error with response message', async () => {
      http.post.mockRejectedValue({
        response: { data: { message: 'Rollback failed' } },
      });

      await expect(snapshotService.rollbackToSnapshot('snap1')).rejects.toThrow('Rollback failed');
    });

    test('throws default message when no response message', async () => {
      http.post.mockRejectedValue(new Error('Network error'));

      await expect(snapshotService.rollbackToSnapshot('snap1')).rejects.toThrow('Failed to rollback to snapshot');
    });

    test('handles empty options', async () => {
      http.post.mockResolvedValue({ data: { success: true } });

      await snapshotService.rollbackToSnapshot('snap1');

      expect(http.post).toHaveBeenCalledWith('/api/snapshots/snap1/rollback', {});
    });
  });

  describe('getSchedule error handling', () => {
    test('throws on error with response message', async () => {
      http.get.mockRejectedValue({
        response: { data: { message: 'Schedule fetch failed' } },
      });

      await expect(snapshotService.getSchedule('fb1')).rejects.toThrow('Schedule fetch failed');
    });

    test('throws default message when no response message', async () => {
      http.get.mockRejectedValue(new Error('Network error'));

      await expect(snapshotService.getSchedule('fb1')).rejects.toThrow('Failed to fetch schedule');
    });
  });

  describe('createSnapshot error handling', () => {
    test('throws default message when no response message', async () => {
      http.post.mockRejectedValue(new Error('Network error'));

      await expect(snapshotService.createSnapshot('fb1', {})).rejects.toThrow('Failed to create snapshot');
    });

    test('handles empty snapshotData', async () => {
      http.post.mockResolvedValue({ data: { success: true } });

      await snapshotService.createSnapshot('fb1');

      expect(http.post).toHaveBeenCalledWith('/api/fiscal-book/fb1/snapshots', {});
    });
  });
});
