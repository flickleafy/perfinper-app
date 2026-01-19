import http from '../infrastructure/http/http-common.js';
import { trackPromise } from 'react-promise-tracker';

/**
 * Service for managing fiscal book snapshots
 * Provides methods to interact with the snapshots API
 */
class SnapshotService {
  /**
   * Create a new snapshot for a fiscal book
   * @param {string} fiscalBookId - Fiscal book ID
   * @param {Object} snapshotData - Snapshot data
   * @param {string} snapshotData.name - Optional snapshot name
   * @param {string} snapshotData.description - Optional description
   * @param {Array<string>} snapshotData.tags - Optional initial tags
   * @returns {Promise<Object>} Created snapshot
   */
  async createSnapshot(fiscalBookId, snapshotData = {}) {
    return trackPromise(
      http.post(`/api/fiscal-book/${fiscalBookId}/snapshots`, snapshotData)
        .then(response => response.data)
        .catch(error => {
          console.error('Error creating snapshot:', error);
          throw new Error(error.response?.data?.message || 'Failed to create snapshot');
        })
    );
  }

  /**
   * Get all snapshots for a fiscal book
   * @param {string} fiscalBookId - Fiscal book ID
   * @param {Object} filters - Filter options
   * @param {Array<string>} filters.tags - Filter by tags
   * @param {number} filters.limit - Pagination limit
   * @param {number} filters.skip - Pagination skip
   * @returns {Promise<Object>} Snapshots list with pagination
   */
  async getSnapshots(fiscalBookId, filters = {}) {
    const params = {};
    if (filters.tags && filters.tags.length > 0) {
      params.tags = filters.tags.join(',');
    }
    if (filters.limit) params.limit = filters.limit;
    if (filters.skip) params.skip = filters.skip;

    return trackPromise(
      http.get(`/api/fiscal-book/${fiscalBookId}/snapshots`, { params })
        .then(response => response.data)
        .catch(error => {
          console.error('Error fetching snapshots:', error);
          throw new Error(error.response?.data?.message || 'Failed to fetch snapshots');
        })
    );
  }

  /**
   * Get snapshot details by ID
   * @param {string} snapshotId - Snapshot ID
   * @returns {Promise<Object>} Snapshot details
   */
  async getSnapshotById(snapshotId) {
    return trackPromise(
      http.get(`/api/snapshots/${snapshotId}`)
        .then(response => response.data)
        .catch(error => {
          console.error('Error fetching snapshot:', error);
          throw new Error(error.response?.data?.message || 'Failed to fetch snapshot');
        })
    );
  }

  /**
   * Get transactions for a snapshot
   * @param {string} snapshotId - Snapshot ID
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Paginated transactions
   */
  async getSnapshotTransactions(snapshotId, pagination = {}) {
    const params = {};
    if (pagination.limit) params.limit = pagination.limit;
    if (pagination.skip) params.skip = pagination.skip;

    return trackPromise(
      http.get(`/api/snapshots/${snapshotId}/transactions`, { params })
        .then(response => response.data)
        .catch(error => {
          console.error('Error fetching snapshot transactions:', error);
          throw new Error(error.response?.data?.message || 'Failed to fetch snapshot transactions');
        })
    );
  }

  /**
   * Delete a snapshot
   * @param {string} snapshotId - Snapshot ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteSnapshot(snapshotId) {
    try {
      const response = await http.delete(`/api/snapshots/${snapshotId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting snapshot:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete snapshot');
    }
  }

  /**
   * Compare snapshot with current fiscal book state
   * @param {string} snapshotId - Snapshot ID
   * @returns {Promise<Object>} Comparison result
   */
  async compareSnapshot(snapshotId) {
    return trackPromise(
      http.get(`/api/snapshots/${snapshotId}/compare`)
        .then(response => response.data)
        .catch(error => {
          console.error('Error comparing snapshot:', error);
          throw new Error(error.response?.data?.message || 'Failed to compare snapshot');
        })
    );
  }

  /**
   * Update snapshot tags
   * @param {string} snapshotId - Snapshot ID
   * @param {Array<string>} tags - New tags array
   * @returns {Promise<Object>} Updated snapshot
   */
  async updateTags(snapshotId, tags) {
    try {
      const response = await http.put(`/api/snapshots/${snapshotId}/tags`, { tags });
      return response.data;
    } catch (error) {
      console.error('Error updating tags:', error);
      throw new Error(error.response?.data?.message || 'Failed to update tags');
    }
  }

  /**
   * Toggle snapshot protection
   * @param {string} snapshotId - Snapshot ID
   * @param {boolean} isProtected - Protection status
   * @returns {Promise<Object>} Updated snapshot
   */
  async toggleProtection(snapshotId, isProtected) {
    try {
      const response = await http.put(`/api/snapshots/${snapshotId}/protection`, { isProtected });
      return response.data;
    } catch (error) {
      console.error('Error toggling protection:', error);
      throw new Error(error.response?.data?.message || 'Failed to toggle protection');
    }
  }

  /**
   * Add annotation to snapshot
   * @param {string} snapshotId - Snapshot ID
   * @param {string} content - Annotation content
   * @param {string} createdBy - User identifier
   * @returns {Promise<Object>} Updated snapshot
   */
  async addSnapshotAnnotation(snapshotId, content, createdBy = 'user') {
    try {
      const response = await http.post(`/api/snapshots/${snapshotId}/annotations`, {
        content,
        createdBy,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding annotation:', error);
      throw new Error(error.response?.data?.message || 'Failed to add annotation');
    }
  }

  /**
   * Add annotation to snapshot transaction
   * @param {string} snapshotId - Snapshot ID
   * @param {string} transactionId - Transaction ID
   * @param {string} content - Annotation content
   * @param {string} createdBy - User identifier
   * @returns {Promise<Object>} Updated transaction
   */
  async addTransactionAnnotation(snapshotId, transactionId, content, createdBy = 'user') {
    try {
      const response = await http.post(
        `/api/snapshots/${snapshotId}/transactions/${transactionId}/annotations`,
        { content, createdBy }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding transaction annotation:', error);
      throw new Error(error.response?.data?.message || 'Failed to add annotation');
    }
  }

  /**
   * Export snapshot
   * @param {string} snapshotId - Snapshot ID
   * @param {string} format - Export format ('csv', 'json', 'pdf')
   * @returns {Promise<Blob>} Export file blob
   */
  async exportSnapshot(snapshotId, format = 'json') {
    try {
      const response = await http.get(`/api/snapshots/${snapshotId}/export`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting snapshot:', error);
      throw new Error('Failed to export snapshot');
    }
  }

  /**
   * Download snapshot export
   * @param {string} snapshotId - Snapshot ID
   * @param {string} format - Export format
   * @param {string} fileName - Optional file name
   */
  async downloadExport(snapshotId, format = 'json', fileName = null) {
    const blob = await this.exportSnapshot(snapshotId, format);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `snapshot-export.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Clone snapshot to new fiscal book
   * @param {string} snapshotId - Snapshot ID
   * @param {Object} newBookData - New fiscal book data overrides
   * @returns {Promise<Object>} Created fiscal book
   */
  async cloneToNewFiscalBook(snapshotId, newBookData = {}) {
    return trackPromise(
      http.post(`/api/snapshots/${snapshotId}/clone`, newBookData)
        .then(response => response.data)
        .catch(error => {
          console.error('Error cloning snapshot:', error);
          throw new Error(error.response?.data?.message || 'Failed to clone snapshot');
        })
    );
  }

  /**
   * Rollback fiscal book to snapshot state
   * @param {string} snapshotId - Snapshot ID
   * @param {Object} options - Rollback options
   * @param {boolean} options.createPreRollbackSnapshot - Create backup before rollback
   * @returns {Promise<Object>} Rollback result
   */
  async rollbackToSnapshot(snapshotId, options = {}) {
    return trackPromise(
      http.post(`/api/snapshots/${snapshotId}/rollback`, options)
        .then(response => response.data)
        .catch(error => {
          console.error('Error rolling back to snapshot:', error);
          throw new Error(error.response?.data?.message || 'Failed to rollback to snapshot');
        })
    );
  }

  /**
   * Get snapshot schedule for a fiscal book
   * @param {string} fiscalBookId - Fiscal book ID
   * @returns {Promise<Object>} Schedule configuration
   */
  async getSchedule(fiscalBookId) {
    return trackPromise(
      http.get(`/api/fiscal-book/${fiscalBookId}/snapshots/schedule`)
        .then(response => response.data)
        .catch(error => {
          console.error('Error fetching schedule:', error);
          throw new Error(error.response?.data?.message || 'Failed to fetch schedule');
        })
    );
  }

  /**
   * Update snapshot schedule for a fiscal book
   * @param {string} fiscalBookId - Fiscal book ID
   * @param {Object} scheduleConfig - Schedule configuration
   * @returns {Promise<Object>} Updated schedule
   */
  async updateSchedule(fiscalBookId, scheduleConfig) {
    try {
      const response = await http.put(
        `/api/fiscal-book/${fiscalBookId}/snapshots/schedule`,
        scheduleConfig
      );
      return response.data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw new Error(error.response?.data?.message || 'Failed to update schedule');
    }
  }
}

const snapshotService = new SnapshotService();
export default snapshotService;
