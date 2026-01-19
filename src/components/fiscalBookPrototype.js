/**
 * Fiscal Book prototype - template for creating new fiscal books
 * Aligned with backend FiscalBookModel schema
 */
export const fiscalBookPrototype = {
  bookName: '',
  bookType: 'Outros',
  bookPeriod: new Date().getFullYear().toString(),
  reference: '',
  status: 'Aberto',
  fiscalData: {
    taxAuthority: '',
    fiscalYear: new Date().getFullYear(),
    fiscalPeriod: 'annual',
    taxRegime: 'Simples Nacional',
    submissionDate: null,
    dueDate: null,
  },
  companyId: null,
  notes: '',
  createdAt: null,
  updatedAt: null,
  closedAt: null,
  // Virtual fields (calculated on backend)
  transactionCount: 0,
  totalIncome: 0,
  totalExpenses: 0,
  netAmount: 0
};

/**
 * Create a new fiscal book object with default values
 * @param {Object} overrides - Properties to override defaults
 * @returns {Object} New fiscal book object
 */
export function createFiscalBook(overrides = {}) {
  return {
    ...fiscalBookPrototype,
    ...overrides,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Create a fiscal book for editing (includes ID)
 * @param {Object} fiscalBook - Existing fiscal book data
 * @returns {Object} Fiscal book object for editing
 */
export function createFiscalBookForEdit(fiscalBook) {
  return {
    _id: fiscalBook._id,
    bookName: fiscalBook.bookName || '',
    bookType: fiscalBook.bookType || 'Outros',
    bookPeriod: fiscalBook.bookPeriod || new Date().getFullYear().toString(),
    reference: fiscalBook.reference || '',
    status: fiscalBook.status || 'Aberto',
    fiscalData: fiscalBook.fiscalData || {
      taxAuthority: '',
      fiscalYear: new Date().getFullYear(),
      fiscalPeriod: 'annual',
      taxRegime: 'Simples Nacional',
      submissionDate: null,
      dueDate: null,
    },
    companyId: fiscalBook.companyId || null,
    notes: fiscalBook.notes || '',
    createdAt: fiscalBook.createdAt,
    updatedAt: new Date().toISOString(),
    closedAt: fiscalBook.closedAt,
    // Virtual fields
    transactionCount: fiscalBook.transactionCount || 0,
    totalIncome: fiscalBook.totalIncome || 0,
    totalExpenses: fiscalBook.totalExpenses || 0,
    netAmount: fiscalBook.netAmount || 0
  };
}

/**
 * Fiscal book status constants - aligned with backend enum
 */
export const FISCAL_BOOK_STATUS_OBJ = {
  ABERTO: 'Aberto',
  FECHADO: 'Fechado',
  EM_REVISAO: 'Em Revisão',
  ARQUIVADO: 'Arquivado'
};

/**
 * Fiscal book status as array for iteration
 */
export const FISCAL_BOOK_STATUS = Object.values(FISCAL_BOOK_STATUS_OBJ);

/**
 * Fiscal book type constants - aligned with backend enum
 */
export const FISCAL_BOOK_TYPES_OBJ = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
  SERVICOS: 'Serviços',
  INVENTARIO: 'Inventário',
  OUTROS: 'Outros'
};

/**
 * Fiscal book types as array for iteration
 */
export const FISCAL_BOOK_TYPES = Object.values(FISCAL_BOOK_TYPES_OBJ);

/**
 * Tax regime constants - aligned with backend enum
 */
export const TAX_REGIMES_OBJ = {
  SIMPLES_NACIONAL: 'Simples Nacional',
  LUCRO_REAL: 'Lucro Real',
  LUCRO_PRESUMIDO: 'Lucro Presumido',
  OUTRO: 'Outro'
};

/**
 * Tax regimes as array for iteration
 */
export const TAX_REGIMES = Object.values(TAX_REGIMES_OBJ);

/**
 * Fiscal period constants - aligned with backend enum
 */
export const FISCAL_PERIODS_OBJ = {
  ANNUAL: 'annual',
  MONTHLY: 'monthly', 
  QUARTERLY: 'quarterly',
  BIANNUAL: 'biannual'
};

/**
 * Fiscal period options with Portuguese labels for UI
 */
export const FISCAL_PERIOD_OPTIONS = [
  { value: FISCAL_PERIODS_OBJ.ANNUAL, label: 'Anual' },
  { value: FISCAL_PERIODS_OBJ.MONTHLY, label: 'Mensal' },
  { value: FISCAL_PERIODS_OBJ.QUARTERLY, label: 'Trimestral' },
  { value: FISCAL_PERIODS_OBJ.BIANNUAL, label: 'Bianual' }
];

/**
 * Fiscal periods as array for iteration
 */
export const FISCAL_PERIODS = Object.values(FISCAL_PERIODS_OBJ);

/**
 * Get fiscal book display status
 * @param {Object} fiscalBook - Fiscal book object
 * @returns {string} Display status
 */
export function getFiscalBookStatus(fiscalBook) {
  return fiscalBook.status || FISCAL_BOOK_STATUS_OBJ.ABERTO;
}

/**
 * Check if fiscal book is editable
 * @param {Object} fiscalBook - Fiscal book object
 * @returns {boolean} True if editable
 */
export function isFiscalBookEditable(fiscalBook) {
  return fiscalBook.status !== FISCAL_BOOK_STATUS_OBJ.ARQUIVADO && 
         fiscalBook.status !== FISCAL_BOOK_STATUS_OBJ.FECHADO;
}

/**
 * Check if fiscal book is archived
 * @param {Object} fiscalBook - Fiscal book object
 * @returns {boolean} True if archived
 */
export function isFiscalBookArchived(fiscalBook) {
  return fiscalBook.status === FISCAL_BOOK_STATUS_OBJ.ARQUIVADO;
}

/**
 * Check if fiscal book is closed
 * @param {Object} fiscalBook - Fiscal book object
 * @returns {boolean} True if closed
 */
export function isFiscalBookClosed(fiscalBook) {
  return fiscalBook.status === FISCAL_BOOK_STATUS_OBJ.FECHADO;
}

/**
 * Format fiscal book for display
 * @param {Object} fiscalBook - Fiscal book object
 * @returns {Object} Formatted fiscal book
 */
export function formatFiscalBookForDisplay(fiscalBook) {
  return {
    ...fiscalBook,
    // Ensure transactionCount has a default value
    transactionCount: fiscalBook.transactionCount ?? 0,
    displayName: `${fiscalBook.bookName} (${fiscalBook.bookPeriod})`,
    status: getFiscalBookStatus(fiscalBook),
    isEditable: isFiscalBookEditable(fiscalBook),
    isArchived: isFiscalBookArchived(fiscalBook),
    isClosed: isFiscalBookClosed(fiscalBook),
    formattedTotalIncome: formatCurrency(fiscalBook.totalIncome || 0),
    formattedTotalExpenses: formatCurrency(fiscalBook.totalExpenses || 0),
    formattedNetAmount: formatCurrency(fiscalBook.netAmount || 0),
    createdAtFormatted: formatDate(fiscalBook.createdAt),
    updatedAtFormatted: formatDate(fiscalBook.updatedAt),
    closedAtFormatted: fiscalBook.closedAt ? formatDate(fiscalBook.closedAt) : null,
    // Extract year from bookPeriod for compatibility
    year: fiscalBook.bookPeriod ? extractYearFromPeriod(fiscalBook.bookPeriod) : (fiscalBook.year || extractYearFromPeriod(null)),
    // Legacy name field for compatibility
    name: fiscalBook.bookName || fiscalBook.name,
    description: fiscalBook.notes || fiscalBook.description,
  };
}

/**
 * Extract year from book period
 * @param {string} bookPeriod - Book period (YYYY or YYYY-MM)
 * @returns {number} Year
 */
function extractYearFromPeriod(bookPeriod) {
  if (!bookPeriod) return new Date().getFullYear();
  return parseInt(bookPeriod.split('-')[0], 10) || new Date().getFullYear();
}

/**
 * Helper function to format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

/**
 * Helper function to format date
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-BR');
}

/**
 * Validate fiscal book name
 * @param {string} bookName - Name to validate
 * @returns {Object} Validation result
 */
export function validateFiscalBookName(bookName) {
  if (!bookName || !bookName.trim()) {
    return { isValid: false, error: 'Nome do livro é obrigatório' };
  }
  if (bookName.length > 100) {
    return { isValid: false, error: 'Nome deve ter menos de 100 caracteres' };
  }
  return { isValid: true, error: null };
}

/**
 * Validate fiscal book period
 * @param {string} bookPeriod - Period to validate (YYYY or YYYY-MM)
 * @returns {Object} Validation result
 */
export function validateFiscalBookPeriod(bookPeriod) {
  if (!bookPeriod) {
    return { isValid: false, error: 'Período é obrigatório' };
  }
  
  // Check if it's YYYY format
  if (/^\d{4}$/.test(bookPeriod)) {
    const year = parseInt(bookPeriod, 10);
    const currentYear = new Date().getFullYear();
    if (year < 2000 || year > currentYear + 1) {
      return { isValid: false, error: `Ano deve estar entre 2000 e ${currentYear + 1}` };
    }
    return { isValid: true, error: null };
  }
  
  // Check if it's YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(bookPeriod)) {
    const [yearStr, monthStr] = bookPeriod.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const currentYear = new Date().getFullYear();
    
    if (year < 2000 || year > currentYear + 1) {
      return { isValid: false, error: `Ano deve estar entre 2000 e ${currentYear + 1}` };
    }
    if (month < 1 || month > 12) {
      return { isValid: false, error: 'Mês deve estar entre 01 e 12' };
    }
    return { isValid: true, error: null };
  }
  
  return { isValid: false, error: 'Formato de período inválido. Use YYYY ou YYYY-MM' };
}

/**
 * Generate fiscal book name suggestions based on existing books
 * @param {Array} existingBooks - Array of existing fiscal books
 * @param {string} bookPeriod - Target period
 * @returns {Array} Array of name suggestions
 */
export function generateFiscalBookNameSuggestions(existingBooks, bookPeriod = new Date().getFullYear().toString()) {
  const year = extractYearFromPeriod(bookPeriod);
  const suggestions = [
    `Livro Fiscal ${year}`,
    `Registros Anuais ${year}`,
    `Livro Financeiro ${year}`,
    `Registros Fiscais ${year}`,
    `Livro Contábil ${year}`
  ];

  // Filter out names that already exist
  const existingNames = existingBooks.map(book => book.bookName?.toLowerCase() || book.name?.toLowerCase());
  return suggestions.filter(suggestion => 
    !existingNames.includes(suggestion.toLowerCase())
  );
}

/**
 * Sort fiscal books by criteria
 * @param {Array} fiscalBooks - Array of fiscal books
 * @param {string} sortBy - Sort criteria ('bookName', 'bookPeriod', 'createdAt', 'updatedAt', 'status')
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted fiscal books
 */
export function sortFiscalBooks(fiscalBooks, sortBy = 'bookPeriod', order = 'desc') {
  return [...fiscalBooks].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle legacy field names
    if (sortBy === 'bookName' && !aValue) aValue = a.name;
    if (sortBy === 'bookName' && !bValue) bValue = b.name;
    if (sortBy === 'bookPeriod' && !aValue) aValue = a.year?.toString();
    if (sortBy === 'bookPeriod' && !bValue) bValue = b.year?.toString();

    // Handle string comparisons
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    // Handle date comparisons
    if (sortBy.includes('At')) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    let comparison = 0;
    if (aValue < bValue) {
      comparison = -1;
    } else if (aValue > bValue) {
      comparison = 1;
    }

    return order === 'desc' ? -comparison : comparison;
  });
}

/**
 * Filter fiscal books by criteria
 * @param {Array} fiscalBooks - Array of fiscal books
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered fiscal books
 */
export function filterFiscalBooks(fiscalBooks, filters = {}) {
  return fiscalBooks.filter(book => {
    // Filter by status
    if (filters.status && book.status !== filters.status) {
      return false;
    }

    // Filter by book type
    if (filters.bookType && book.bookType !== filters.bookType) {
      return false;
    }

    // Filter by period/year
    if (filters.year) {
      const bookYear = extractYearFromPeriod(book.bookPeriod || book.year?.toString());
      if (bookYear !== filters.year) {
        return false;
      }
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableFields = [
        book.bookName || book.name, 
        book.notes || book.description, 
        book.reference
      ].filter(Boolean);
      const matchesSearch = searchableFields.some(field => 
        field.toLowerCase().includes(searchTerm)
      );
      if (!matchesSearch) {
        return false;
      }
    }

    return true;
  });
}
