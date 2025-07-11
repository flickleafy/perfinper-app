import {
  fiscalBookPrototype,
  createFiscalBook,
  createFiscalBookForEdit,
  FISCAL_BOOK_STATUS_OBJ,
  FISCAL_BOOK_TYPES,
  TAX_REGIMES,
  FISCAL_PERIOD_OPTIONS,
  getFiscalBookStatus,
  isFiscalBookEditable,
  isFiscalBookArchived,
  isFiscalBookClosed,
  formatFiscalBookForDisplay,
  validateFiscalBookName,
  validateFiscalBookPeriod,
  generateFiscalBookNameSuggestions,
  sortFiscalBooks,
  filterFiscalBooks,
} from './fiscalBookPrototype';

describe('fiscalBookPrototype', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-15T10:00:00.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('defines default fiscal book constants', () => {
    expect(fiscalBookPrototype.bookType).toBe('Outros');
    expect(FISCAL_BOOK_TYPES).toContain('Outros');
    expect(TAX_REGIMES).toContain('Simples Nacional');
    expect(FISCAL_PERIOD_OPTIONS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'annual' }),
        expect.objectContaining({ value: 'monthly' }),
      ])
    );
  });

  it('creates a fiscal book with timestamps', () => {
    const result = createFiscalBook({ bookName: 'Book' });

    expect(result.bookName).toBe('Book');
    expect(result.createdAt).toBe('2024-01-15T10:00:00.000Z');
    expect(result.updatedAt).toBe('2024-01-15T10:00:00.000Z');
  });

  it('creates a fiscal book for edit with defaults', () => {
    const result = createFiscalBookForEdit({ _id: '1', bookName: 'Book' });

    expect(result._id).toBe('1');
    expect(result.bookType).toBe('Outros');
    expect(result.updatedAt).toBe('2024-01-15T10:00:00.000Z');
  });

  it('handles status helpers', () => {
    expect(getFiscalBookStatus({})).toBe(FISCAL_BOOK_STATUS_OBJ.ABERTO);
    expect(getFiscalBookStatus({ status: 'Fechado' })).toBe('Fechado');
    expect(isFiscalBookEditable({ status: 'Aberto' })).toBe(true);
    expect(isFiscalBookEditable({ status: 'Fechado' })).toBe(false);
    expect(isFiscalBookArchived({ status: 'Arquivado' })).toBe(true);
    expect(isFiscalBookClosed({ status: 'Fechado' })).toBe(true);
  });

  it('formats fiscal book for display', () => {
    const result = formatFiscalBookForDisplay({
      bookName: 'Book',
      bookPeriod: '2024',
      status: 'Aberto',
      totalIncome: 100,
      totalExpenses: 50,
      netAmount: 50,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      notes: 'Note',
    });

    expect(result.displayName).toBe('Book (2024)');
    expect(result.isEditable).toBe(true);
    expect(result.formattedTotalIncome).toMatch(/R\$/);
    expect(result.createdAtFormatted).not.toBe('');
    expect(result.closedAtFormatted).toBeNull();
    expect(result.year).toBe(2024);
    expect(result.name).toBe('Book');
    expect(result.description).toBe('Note');
  });

  it('formats closed books and falls back to current year when period is missing', () => {
    const result = formatFiscalBookForDisplay({
      bookName: 'Closed Book',
      bookPeriod: '',
      closedAt: '2024-01-20T00:00:00.000Z',
      totalIncome: 0,
      totalExpenses: 0,
      netAmount: 0,
    });

    expect(result.closedAtFormatted).not.toBeNull();
    expect(result.year).toBe(2024);
  });

  it('validates fiscal book name', () => {
    expect(validateFiscalBookName('')).toEqual({
      isValid: false,
      error: 'Nome do livro \u00e9 obrigat\u00f3rio',
    });
    expect(validateFiscalBookName('a'.repeat(101)).isValid).toBe(false);
    expect(validateFiscalBookName('Valid').isValid).toBe(true);
  });

  it('validates fiscal book period', () => {
    expect(validateFiscalBookPeriod('')).toEqual({
      isValid: false,
      error: 'Per\u00edodo \u00e9 obrigat\u00f3rio',
    });
    expect(validateFiscalBookPeriod('1999').isValid).toBe(false);
    expect(validateFiscalBookPeriod('2024-13').isValid).toBe(false);
    expect(validateFiscalBookPeriod('2024').isValid).toBe(true);
    expect(validateFiscalBookPeriod('2024-02').isValid).toBe(true);
    expect(validateFiscalBookPeriod('20-01').isValid).toBe(false);
  });

  it('validates year range in period', () => {
    // YYYY too old
    expect(validateFiscalBookPeriod('1999').isValid).toBe(false);
    // YYYY too future
    expect(validateFiscalBookPeriod('3000').isValid).toBe(false);

    // YYYY-MM too old
    expect(validateFiscalBookPeriod('1999-01').isValid).toBe(false);
    // Month invalid
    expect(validateFiscalBookPeriod('2023-13').isValid).toBe(false);
    expect(validateFiscalBookPeriod('2023-00').isValid).toBe(false);
  });

  it('validates invalid format period', () => {
    const result = validateFiscalBookPeriod('invalid-format');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Formato de período inválido. Use YYYY ou YYYY-MM');
  });

  it('generates name suggestions and filters existing', () => {
    const suggestions = generateFiscalBookNameSuggestions(
      [{ bookName: 'Livro Fiscal 2024' }],
      '2024'
    );

    expect(suggestions).not.toContain('Livro Fiscal 2024');
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('generateFiscalBookNameSuggestions handles legacy fields', () => {
    const existing = [{ name: 'Livro Fiscal 2024' }];
    const suggestions = generateFiscalBookNameSuggestions(existing, '2024');
    expect(suggestions).not.toContain('Livro Fiscal 2024');
  });

  it('sorts fiscal books by name and period', () => {
    const books = [
      { bookName: 'B', bookPeriod: '2024' },
      { bookName: 'A', bookPeriod: '2023' },
    ];

    const sortedByName = sortFiscalBooks(books, 'bookName', 'asc');
    expect(sortedByName[0].bookName).toBe('A');

    const sortedByPeriodDesc = sortFiscalBooks(books, 'bookPeriod', 'desc');
    expect(sortedByPeriodDesc[0].bookPeriod).toBe('2024');
  });

  it('sortFiscalBooks handles legacy fields and various types', () => {
    const books = [
        { bookName: 'B', bookPeriod: '2023' },
        { name: 'A', year: 2024 }, // legacy
    ];
    
    // Sort by name
    let sorted = sortFiscalBooks(books, 'bookName', 'asc');
    expect(sorted[0].name).toBe('A');

    // Sort by period desc
    sorted = sortFiscalBooks(books, 'bookPeriod', 'desc');
    expect(sorted[0].year).toBe(2024);
  });

  it('filters fiscal books by status, type, year, and search', () => {
    const books = [
      {
        bookName: 'Entrada 2024',
        bookType: 'Entrada',
        bookPeriod: '2024',
        status: 'Aberto',
        notes: 'Notas',
        reference: 'REF',
      },
      {
        bookName: 'Saida 2023',
        bookType: 'Sa\u00edda',
        bookPeriod: '2023',
        status: 'Fechado',
      },
    ];

    const filtered = filterFiscalBooks(books, {
      status: 'Aberto',
      bookType: 'Entrada',
      year: 2024,
      search: 'notas',
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].bookName).toBe('Entrada 2024');
  });

  it('excludes fiscal books that do not match filters', () => {
    const books = [
      { bookName: 'Livro A', bookType: 'Entrada', bookPeriod: '2024', status: 'Aberto' },
      { bookName: 'Livro B', bookType: 'Saída', bookPeriod: '2023', status: 'Fechado' },
    ];

    const filtered = filterFiscalBooks(books, { status: 'Arquivado', year: 2024 });

    expect(filtered).toHaveLength(0);
  });

  it('filters by bookType mismatch', () => {
    const books = [
        { id: 1, bookName: 'Book A', bookType: 'type1' },
        { id: 2, bookName: 'Book B', bookType: 'type2' }
    ];
    // Filter expecting 'type1', so book2 (mismatch) should be filtered out
    const result = filterFiscalBooks(books, { bookType: 'type1' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('filters by year mismatch', () => {
    const books = [
        { id: 1, bookPeriod: '2023' },
        { id: 2, bookPeriod: '2024' }
    ];
    // Filter for 2023 (as number to match extractYearFromPeriod return type), expecting book 1.
    const result = filterFiscalBooks(books, { year: 2023 });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('filters by search term mismatch', () => {
    const books = [
        { id: 1, bookName: 'Alpha' },
        { id: 2, bookName: 'Beta' }
    ];
    // Search for 'alp', expecting book 1. Book 2 should be filtered out (hitting line 402)
    const result = filterFiscalBooks(books, { search: 'alp' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('filterFiscalBooks uses fallback fields', () => {
    const books = [
        { year: 2024, description: 'Notes' },
        { bookPeriod: '2023', notes: 'Other' }
    ];

    // Filter by year legacy
    let res = filterFiscalBooks(books, { year: 2024 });
    expect(res).toHaveLength(1);
    
    // Filter by search in description (legacy notes)
    res = filterFiscalBooks(books, { search: 'Notes' });
    expect(res).toHaveLength(1);
  });
});
