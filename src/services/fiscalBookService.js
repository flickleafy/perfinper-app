import http from '../infrastructure/http/http-common.js';
import { trackPromise } from 'react-promise-tracker';

/**
 * Service for managing fiscal books
 * Provides methods to interact with the fiscal books API
 */
class FiscalBookService {
  constructor() {
    this.baseUrl = '/api/fiscal-book';
  }

  /**
   * Validate fiscal book ID
   * @param {string} id - Fiscal book ID to validate
   * @throws {Error} If ID is invalid
   */
  validateId(id) {
    if (!id || id === 'undefined' || typeof id !== 'string' || id.trim() === '') {
      throw new Error(`Invalid fiscal book ID: ${id}`);
    }
  }

  /**
   * Get all fiscal books with optional filters
   * @param {Object} filters - Filter options
   * @param {string} filters.type - Filter by book type
   * @param {string} filters.period - Filter by book period
   * @param {string} filters.status - Filter by status
   * @param {string} filters.company - Filter by company ID
   * @param {number} filters.limit - Limit number of results (default: 50)
   * @param {number} filters.skip - Skip number of results (default: 0)
   * @param {string} filters.sort - Sort field (default: '-createdAt')
   * @returns {Promise<Array>} Array of fiscal books
   */
  async getAll(filters = {}) {
    return trackPromise(
      http.get(this.baseUrl, { params: filters })
        .then(response => response.data)
        .catch(error => {
          console.error('Error fetching fiscal books:', error);
          throw new Error('Failed to fetch fiscal books');
        })
    );
  }

  /**
   * Get a fiscal book by ID
   * @param {string} id - Fiscal book ID
   * @returns {Promise<Object>} Fiscal book object
   */
  async getById(id) {
    this.validateId(id);
    return trackPromise(
      http.get(`${this.baseUrl}/${id}`)
        .then(response => response.data)
        .catch(error => {
          console.error(`Error fetching fiscal book ${id}:`, error);
          throw new Error('Failed to fetch fiscal book');
        })
    );
  }

  /**
   * Create a new fiscal book
   * @param {Object} fiscalBookData - Fiscal book data
   * @returns {Promise<Object>} Created fiscal book
   */
  async create(fiscalBookData) {
    return trackPromise(
      http.post(this.baseUrl, fiscalBookData)
        .then(response => response.data)
        .catch(error => {
          console.error('Error creating fiscal book:', error);
          if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
          }
          throw new Error('Failed to create fiscal book');
        })
    );
  }

  /**
   * Update a fiscal book
   * @param {string} id - Fiscal book ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated fiscal book
   */
  async update(id, updateData) {
    this.validateId(id);
    return trackPromise(
      http.put(`${this.baseUrl}/${id}`, updateData)
        .then(response => response.data)
        .catch(error => {
          console.error(`Error updating fiscal book ${id}:`, error);
          if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
          }
          throw new Error('Failed to update fiscal book');
        })
    );
  }

  /**
   * Delete a fiscal book
   * @param {string} id - Fiscal book ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    this.validateId(id);
    try {
      const response = await http.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting fiscal book ${id}:`, error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to delete fiscal book');
    }
  }

  /**
   * Close a fiscal book (archive it)
   * @param {string} id - Fiscal book ID
   * @returns {Promise<Object>} Updated fiscal book
   */
  async close(id) {
    try {
      const response = await http.put(`${this.baseUrl}/${id}/close`);
      return response.data;
    } catch (error) {
      console.error(`Error closing fiscal book ${id}:`, error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to close fiscal book');
    }
  }

  /**
   * Reopen a fiscal book
   * @param {string} id - Fiscal book ID
   * @returns {Promise<Object>} Updated fiscal book
   */
  async reopen(id) {
    try {
      const response = await http.put(`${this.baseUrl}/${id}/reopen`);
      return response.data;
    } catch (error) {
      console.error(`Error reopening fiscal book ${id}:`, error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to reopen fiscal book');
    }
  }

  /**
   * Add transactions to a fiscal book
   * @param {string} id - Fiscal book ID
   * @param {Array<string>} transactionIds - Array of transaction IDs
   * @returns {Promise<Object>} Updated fiscal book
   */
  async addTransactions(id, transactionIds) {
    try {
      const response = await http.post(`${this.baseUrl}/${id}/transactions`, {
        transactionIds
      });
      return response.data;
    } catch (error) {
      console.error(`Error adding transactions to fiscal book ${id}:`, error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to add transactions to fiscal book');
    }
  }

  /**
   * Add a single transaction to a fiscal book
   * @param {string} id - Fiscal book ID
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Updated transaction
   */
  async addTransaction(id, transactionId) {
    try {
      const response = await http.put(`${this.baseUrl}/${id}/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error adding transaction ${transactionId} to fiscal book ${id}:`, error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to add transaction to fiscal book');
    }
  }

  /**
   * Remove transactions from a fiscal book
   * Note: Backend doesn't support bulk removal, so we remove each transaction individually
   * @param {string} id - Fiscal book ID (not used, kept for backward compatibility)
   * @param {Array<string>} transactionIds - Array of transaction IDs
   * @returns {Promise<Object>} Result object
   */
  async removeTransactions(id, transactionIds) {
    try {
      const results = [];
      for (const transactionId of transactionIds) {
        const result = await this.removeTransaction(transactionId);
        results.push(result);
      }
      return { success: true, results };
    } catch (error) {
      console.error(`Error removing transactions from fiscal book ${id}:`, error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to remove transactions from fiscal book');
    }
  }

  /**
   * Remove a single transaction from its fiscal book
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Updated transaction
   */
  async removeTransaction(transactionId) {
    try {
      const response = await http.delete(`${this.baseUrl}/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing transaction ${transactionId} from fiscal book:`, error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to remove transaction from fiscal book');
    }
  }

  /**
   * Transfer transactions between fiscal books
   * This is implemented by removing from source and adding to target
   * @param {string} sourceId - Source fiscal book ID
   * @param {string} targetId - Target fiscal book ID
   * @param {Array<string>} transactionIds - Array of transaction IDs
   * @returns {Promise<Object>} Transfer result
   */
  async transferTransactions(sourceId, targetId, transactionIds) {
    try {
      // First remove transactions from source book (if sourceId is provided)
      if (sourceId) {
        for (const transactionId of transactionIds) {
          await this.removeTransaction(transactionId);
        }
      }
      
      // Then add transactions to target book
      if (targetId) {
        await this.addTransactions(targetId, transactionIds);
      }
      
      return { success: true, message: 'Transactions transferred successfully' };
    } catch (error) {
      console.error(`Error transferring transactions from ${sourceId} to ${targetId}:`, error);
      throw new Error('Failed to transfer transactions');
    }
  }

  /**
   * Get overall fiscal book statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    try {
      const response = await http.get(`${this.baseUrl}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fiscal book statistics:', error);
      throw new Error('Failed to fetch fiscal book statistics');
    }
  }

  /**
   * Export fiscal book data
   * @param {string} id - Fiscal book ID
   * @param {string} format - Export format ('csv' or 'json')
   * @param {boolean} includeTransactions - Whether to include transactions (default: true)
   * @returns {Promise<Blob>} Export file blob
   */
  async export(id, format = 'csv', includeTransactions = true) {
    try {
      const endpoint = format === 'json' ? 'json' : 'csv';
      const response = await http.get(`/api/export/fiscal-book/${id}/${endpoint}`, {
        params: { transactions: includeTransactions },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Error exporting fiscal book ${id}:`, error);
      throw new Error('Failed to export fiscal book');
    }
  }

  /**
   * Get transactions for a fiscal book with pagination
   * @param {string} id - Fiscal book ID
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.sort - Sort field
   * @param {string} options.order - Sort order ('asc' or 'desc')
   * @returns {Promise<Object>} Paginated transactions
   */
  async getTransactions(id, options = {}) {
    this.validateId(id);

    try {
      const response = await http.get(`${this.baseUrl}/${id}/transactions`, {
        params: options
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching transactions for fiscal book ${id}:`, error);
      throw new Error('Failed to fetch fiscal book transactions');
    }
  }

  /**
   * Get filtered fiscal books with comprehensive options
   * @param {Object} options - Filter and pagination options
   * @param {string} options.type - Filter by book type (Entrada, Saída, Serviços, Inventário, Outros)
   * @param {string} options.period - Filter by book period (YYYY or YYYY-MM)
   * @param {string} options.status - Filter by status (Aberto, Fechado, Em Revisão, Arquivado)
   * @param {string} options.company - Filter by company ID
   * @param {number} options.limit - Limit number of results (default: 50)
   * @param {number} options.skip - Skip number of results (default: 0)
   * @param {string} options.sort - Sort field (default: '-createdAt')
   * @returns {Promise<Array>} Array of filtered fiscal books
   */
  async getFiltered(options = {}) {
    const params = {};
    
    // Map filter options to backend parameters
    if (options.type) params.type = options.type;
    if (options.period) params.period = options.period;
    if (options.status) params.status = options.status;
    if (options.company) params.company = options.company;
    if (options.limit) params.limit = options.limit;
    if (options.skip) params.skip = options.skip;
    if (options.sort) params.sort = options.sort;

    return this.getAll(params);
  }

  /**
   * Validate required fields
   * @private
   * @param {Object} fiscalBookData - Fiscal book data
   * @returns {Object} Validation errors
   */
  _validateRequiredFields(fiscalBookData) {
    const errors = {};

    // Validate book name
    const bookName = fiscalBookData.bookName || fiscalBookData.name;
    if (!bookName?.trim()) {
      errors.bookName = 'Nome do livro é obrigatório';
    } else if (bookName.length > 100) {
      errors.bookName = 'Nome deve ter menos de 100 caracteres';
    }

    // Validate book period
    const bookPeriod = fiscalBookData.bookPeriod || fiscalBookData.year?.toString();
    if (!bookPeriod?.trim()) {
      errors.bookPeriod = 'Período é obrigatório';
    } else {
      const periodError = this._validatePeriodFormat(bookPeriod);
      if (periodError) {
        errors.bookPeriod = periodError;
      }
    }

    return errors;
  }

  /**
   * Validate period format and range
   * @private
   * @param {string} bookPeriod - Book period
   * @returns {string|null} Error message or null if valid
   */
  _validatePeriodFormat(bookPeriod) {
    const periodRegex = /^\d{4}(-\d{2})?$/;
    if (!periodRegex.test(bookPeriod)) {
      return 'Período deve estar no formato YYYY ou YYYY-MM';
    }
    
    const year = parseInt(bookPeriod.substring(0, 4));
    if (year < 2000 || year > new Date().getFullYear() + 1) {
      return 'Ano deve estar entre 2000 e o próximo ano';
    }
    
    return null;
  }

  /**
   * Validate optional fields
   * @private
   * @param {Object} fiscalBookData - Fiscal book data
   * @returns {Object} Validation errors
   */
  _validateOptionalFields(fiscalBookData) {
    const errors = {};

    // Validate notes
    const notes = fiscalBookData.notes || fiscalBookData.description;
    if (notes && notes.length > 500) {
      errors.notes = 'Observações devem ter menos de 500 caracteres';
    }

    // Validate reference
    if (fiscalBookData.reference && fiscalBookData.reference.length > 100) {
      errors.reference = 'Referência deve ter menos de 100 caracteres';
    }

    // Validate book type
    const validBookTypes = ['Entrada', 'Saída', 'Serviços', 'Inventário', 'Outros'];
    if (fiscalBookData.bookType && !validBookTypes.includes(fiscalBookData.bookType)) {
      errors.bookType = 'Tipo de livro inválido';
    }

    // Validate status
    const validStatuses = ['Aberto', 'Fechado', 'Em Revisão', 'Arquivado'];
    if (fiscalBookData.status && !validStatuses.includes(fiscalBookData.status)) {
      errors.status = 'Status inválido';
    }

    return errors;
  }

  /**
   * Validate fiscal book data before submission
   * @param {Object} fiscalBookData - Fiscal book data to validate
   * @returns {Object} Validation result
   */
  validateFiscalBook(fiscalBookData) {
    const requiredFieldErrors = this._validateRequiredFields(fiscalBookData);
    const optionalFieldErrors = this._validateOptionalFields(fiscalBookData);
    
    const errors = { ...requiredFieldErrors, ...optionalFieldErrors };

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

const fiscalBookService = new FiscalBookService();
export default fiscalBookService;
