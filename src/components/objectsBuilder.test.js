import {
  transactionBuilder,
  companyBuilder,
  personBuilder,
  fiscalBookBuilder,
  buildFiscalBookForCreation,
  buildFiscalBookForEdit,
  buildFiscalBookFromResponse,
} from './objectsBuilder';

jest.mock('../infrastructure/date/formatDatePeriod', () => ({
  __esModule: true,
  formatDatePeriod: jest.fn(() => ({
    transactionDate: 123,
    transactionPeriod: '2024-01',
  })),
}));

describe('objectsBuilder', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-02-01T00:00:00.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('builds a transaction with formatted values and date override', () => {
    const { formatDatePeriod } = require('../infrastructure/date/formatDatePeriod');
    formatDatePeriod.mockReturnValue({
      transactionDate: 123,
      transactionPeriod: '2024-01',
    });

    const result = transactionBuilder(
      {
        transactionValue: 10.5,
        freightValue: 2.3,
        transactionName: 'Test',
      },
      new Date('2024-01-01T00:00:00.000Z')
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: null,
        transactionDate: 123,
        transactionPeriod: '2024-01',
        transactionValue: '10,5',
        freightValue: '2,3',
      })
    );
  });

  it('builds a company with cleaned CNPJ and defaults', () => {
    const result = companyBuilder({
      companyName: ' Acme ',
      companyCnpj: '12.345/0001-99',
      microEntrepreneurOption: 'true',
      simplifiedTaxOption: 1,
    });

    expect(result.companyName).toBe('Acme');
    expect(result.companyCnpj).toBe('12345000199');
    expect(result.status).toBe('Ativa');
    expect(result.microEntrepreneurOption).toBe(true);
    expect(result.simplifiedTaxOption).toBe(true);
    expect(result.contacts).toEqual(
      expect.objectContaining({
        email: '',
        phones: [''],
      })
    );
  });

  it('builds a person with cleaned CPF and defaults', () => {
    const result = personBuilder({
      fullName: ' Jane ',
      cpf: '123.456.789-00',
      notes: ' Note ',
    });

    expect(result.fullName).toBe('Jane');
    expect(result.cpf).toBe('12345678900');
    expect(result.status).toBe('active');
    expect(result.notes).toBe('Note');
    expect(result.contacts.emails).toEqual(['']);
  });

  it('builds a fiscal book with defaults and computed status', () => {
    const result = fiscalBookBuilder({
      bookName: ' Book ',
      bookPeriod: '2024-01',
      isActive: false,
      fiscalData: {
        taxAuthority: ' Receita ',
        fiscalYear: '2023',
      },
      totalIncome: '100',
    });

    expect(result.bookName).toBe('Book');
    expect(result.status).toBe('Arquivado');
    expect(result.fiscalData.taxAuthority).toBe('Receita');
    expect(result.fiscalData.fiscalYear).toBe(2023);
    expect(result.fiscalData.fiscalPeriod).toBe('monthly');
    expect(result.totalIncome).toBe(100);
  });

  it('respects explicit fiscal book status', () => {
    const result = fiscalBookBuilder({
      bookName: 'Book',
      status: 'Fechado',
    });

    expect(result.status).toBe('Fechado');
  });

  it('builds a fiscal book with default status when missing', () => {
    const result = fiscalBookBuilder({
      bookName: 'Book',
      bookPeriod: '2024',
    });

    expect(result.status).toBe('Aberto');
    expect(result.fiscalData.fiscalPeriod).toBe('annual');
  });

  it('builds a fiscal book with fallback fiscalData when invalid', () => {
    const result = fiscalBookBuilder({
      bookName: 'Book',
      fiscalData: 'invalid',
    });

    expect(result.fiscalData.taxRegime).toBe('Simples Nacional');
    expect(result.fiscalData.fiscalYear).toBe(2024);
  });

  it('buildFiscalBookForCreation sets timestamps', () => {
    const result = buildFiscalBookForCreation({ bookName: 'Book' });

    expect(result.createdAt).toBe('2024-02-01T00:00:00.000Z');
    expect(result.updatedAt).toBe('2024-02-01T00:00:00.000Z');
  });

  it('buildFiscalBookForEdit preserves original creation date', () => {
    const existing = { _id: '1', createdAt: '2024-01-01T00:00:00.000Z' };

    const result = buildFiscalBookForEdit(existing, { bookName: 'Book' });

    expect(result._id).toBe('1');
    expect(result.createdAt).toBe('2024-01-01T00:00:00.000Z');
    expect(result.updatedAt).toBe('2024-02-01T00:00:00.000Z');
  });

  it('buildFiscalBookFromResponse normalizes fields', () => {
    const result = buildFiscalBookFromResponse({
      _id: '1',
      bookName: 'Book',
      bookPeriod: '2023',
      status: 'Aberto',
      isActive: false,
    });

    expect(result._id).toBe('1');
    expect(result.bookName).toBe('Book');
    expect(result.year).toBe(2023);
    expect(result.isActive).toBe(true);
  });

  it('buildFiscalBookFromResponse uses legacy fields', () => {
    const result = buildFiscalBookFromResponse({
      _id: '2',
      name: 'Legacy',
      year: 2022,
      status: 'Fechado',
    });

    expect(result.bookName).toBe('');
    expect(result.name).toBe('Legacy');
    expect(result.year).toBe(2022);
    expect(result.isActive).toBe(false);
  });
});
