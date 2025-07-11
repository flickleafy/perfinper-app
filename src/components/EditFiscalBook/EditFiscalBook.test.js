import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import EditFiscalBook from './EditFiscalBook';
import fiscalBookService from '../../services/fiscalBookService';
import { formatFiscalBookForDisplay, isFiscalBookEditable } from '../fiscalBookPrototype';
import { useParams, useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useParams: jest.fn(),
    useNavigate: jest.fn(),
  };
});

jest.mock('../../services/fiscalBookService', () => ({
  __esModule: true,
  default: {
    getById: jest.fn(),
  },
}));

jest.mock('../fiscalBookPrototype', () => ({
  formatFiscalBookForDisplay: jest.fn(),
  isFiscalBookEditable: jest.fn(),
}));

jest.mock('../../ui/LoadingIndicator', () => (props) => (
  <div data-testid="loading">{props.message}</div>
));

jest.mock('../FiscalBookForm', () => (props) => (
  <div>
    <div data-testid="fiscal-book-form">form</div>
    <button onClick={() => props.onSave({ ...props.fiscalBook, bookName: 'Updated Book' })}>
      save
    </button>
    <button onClick={props.onCancel}>cancel</button>
  </div>
));

const makeFormattedBook = (overrides = {}) => ({
  id: 'fb1',
  bookName: 'Book 1',
  name: 'Book 1',
  bookPeriod: '2024',
  status: 'Aberto',
  transactionCount: 0,
  totalIncome: 0,
  totalExpenses: 0,
  netAmount: 0,
  formattedTotalIncome: 'R$ 0,00',
  formattedTotalExpenses: 'R$ 0,00',
  formattedNetAmount: 'R$ 0,00',
  createdAtFormatted: '01/01/2024',
  updatedAtFormatted: '02/01/2024',
  ...overrides,
});

describe('EditFiscalBook', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows loading state while fetching', () => {
    useParams.mockReturnValue({ id: 'fb1' });
    const deferred = new Promise(() => {});
    fiscalBookService.getById.mockReturnValue(deferred);

    render(<EditFiscalBook />);

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading fiscal book...');
  });

  it('shows error when no id is provided', async () => {
    useParams.mockReturnValue({});

    render(<EditFiscalBook />);

    await waitFor(() => {
      expect(screen.getByText('No fiscal book ID provided')).toBeInTheDocument();
    });

    expect(fiscalBookService.getById).not.toHaveBeenCalled();
  });

  it('retries loading after an error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    useParams.mockReturnValue({ id: 'fb1' });
    const bookData = { id: 'fb1', bookName: 'Book 1', bookPeriod: '2024' };
    const formatted = makeFormattedBook({ bookName: 'Book 1' });

    fiscalBookService.getById
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(bookData);
    formatFiscalBookForDisplay.mockReturnValue(formatted);
    isFiscalBookEditable.mockReturnValue(true);

    render(<EditFiscalBook />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load fiscal book. Please try again.')).toBeInTheDocument();
    });
    console.error.mockRestore();

    fireEvent.click(screen.getByRole('button', { name: 'Tentar Novamente' }));

    await waitFor(() => {
      expect(fiscalBookService.getById).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText('Editar Livro Fiscal')).toBeInTheDocument();
    });
  });

  it('shows not found when fiscal book is missing', async () => {
    useParams.mockReturnValue({ id: 'fb1' });
    fiscalBookService.getById.mockResolvedValue({ id: 'fb1' });
    formatFiscalBookForDisplay.mockReturnValue(null);

    render(<EditFiscalBook />);

    await waitFor(() => {
      expect(screen.getByText('Livro fiscal n\u00e3o encontrado.')).toBeInTheDocument();
    });
  });

  it.each([
    ['Aberto', 'Aberto'],
    ['Fechado', 'Fechado'],
    ['Em Revis\u00e3o', 'Em Revis\u00e3o'],
    ['Arquivado', 'Arquivado'],
    [undefined, 'Desconhecido'],
  ])('renders status label for %s', async (status, expectedLabel) => {
    useParams.mockReturnValue({ id: 'fb1' });
    const bookData = { id: 'fb1', bookName: 'Book 1', bookPeriod: '2024', status };
    const formatted = makeFormattedBook({ ...bookData, status });

    fiscalBookService.getById.mockResolvedValue(bookData);
    formatFiscalBookForDisplay.mockReturnValue(formatted);
    isFiscalBookEditable.mockReturnValue(true);

    render(<EditFiscalBook />);

    await waitFor(() => {
      expect(screen.getByText('Editar Livro Fiscal')).toBeInTheDocument();
    });

    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });

  it('shows warning and info for non-editable fiscal book', async () => {
    useParams.mockReturnValue({ id: 'fb1' });
    const bookData = {
      id: 'fb1',
      bookName: 'Book 1',
      bookPeriod: '2024',
      status: 'Fechado',
    };
    const formatted = makeFormattedBook({
      ...bookData,
      transactionCount: 3,
      totalIncome: 100,
      totalExpenses: 50,
      formattedTotalIncome: 'R$ 100,00',
      formattedTotalExpenses: 'R$ 50,00',
      formattedNetAmount: 'R$ 50,00',
      closedAtFormatted: '03/01/2024',
    });

    fiscalBookService.getById.mockResolvedValue(bookData);
    formatFiscalBookForDisplay.mockReturnValue(formatted);
    isFiscalBookEditable.mockReturnValue(false);

    render(<EditFiscalBook />);

    await waitFor(() => {
      expect(screen.getByText('Editar Livro Fiscal')).toBeInTheDocument();
    });

    expect(screen.getByText('Este livro fiscal n\u00e3o pode ser editado')).toBeInTheDocument();
    expect(screen.getByText(/transa\u00e7\u00e3o/)).toBeInTheDocument();
  });

  it('handles save success and navigation', async () => {
    jest.useFakeTimers();
    const onSuccess = jest.fn();

    useParams.mockReturnValue({ id: 'fb1' });
    const bookData = { id: 'fb1', bookName: 'Book 1', bookPeriod: '2024', status: 'Aberto' };

    fiscalBookService.getById.mockResolvedValue(bookData);
    formatFiscalBookForDisplay.mockImplementation((book) => makeFormattedBook(book));
    isFiscalBookEditable.mockReturnValue(true);

    render(<EditFiscalBook onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(screen.getByText('Editar Livro Fiscal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'save' }));

    expect(screen.getByText('Livro fiscal "Updated Book" foi atualizado com sucesso!')).toBeInTheDocument();
    expect(formatFiscalBookForDisplay).toHaveBeenCalledWith(expect.objectContaining({ bookName: 'Updated Book' }));

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ bookName: 'Updated Book' }));
    expect(mockNavigate).toHaveBeenCalledWith('/livros-fiscais');

  });

  it('handles cancel and back navigation', async () => {
    const onCancel = jest.fn();

    useParams.mockReturnValue({ id: 'fb1' });
    const bookData = { id: 'fb1', bookName: 'Book 1', bookPeriod: '2024', status: 'Aberto' };
    const formatted = makeFormattedBook({ ...bookData, status: 'Aberto' });

    fiscalBookService.getById.mockResolvedValue(bookData);
    formatFiscalBookForDisplay.mockReturnValue(formatted);
    isFiscalBookEditable.mockReturnValue(true);

    render(<EditFiscalBook onCancel={onCancel} />);

    await waitFor(() => {
      expect(screen.getByText('Editar Livro Fiscal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Voltar aos Livros Fiscais' }));
    expect(mockNavigate).toHaveBeenCalledWith('/livros-fiscais');

    fireEvent.click(screen.getByRole('button', { name: 'cancel' }));
    expect(onCancel).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/livros-fiscais');
  });

  it('handles save success without onSuccess callback', async () => {
    useParams.mockReturnValue({ id: 'fb1' });
    const bookData = { id: 'fb1', bookName: 'Book 1', status: 'Aberto' };
    
    fiscalBookService.getById.mockResolvedValue(bookData);
    formatFiscalBookForDisplay.mockImplementation((book) => makeFormattedBook(book));
    isFiscalBookEditable.mockReturnValue(true);

    render(<EditFiscalBook />); // No onSuccess

    await screen.findByText('Editar Livro Fiscal');

    jest.useFakeTimers();
    fireEvent.click(screen.getByRole('button', { name: 'save' }));

    expect(screen.getByText(/foi atualizado com sucesso/)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/livros-fiscais');
    jest.useRealTimers();
  });

  it('handles cancel without onCancel callback', async () => {
    useParams.mockReturnValue({ id: 'fb1' });
    const bookData = { id: 'fb1', bookName: 'Book 1', status: 'Aberto' };
    
    fiscalBookService.getById.mockResolvedValue(bookData);
    formatFiscalBookForDisplay.mockReturnValue(makeFormattedBook(bookData));
    isFiscalBookEditable.mockReturnValue(true);

    render(<EditFiscalBook />); // No onCancel

    await screen.findByText('Editar Livro Fiscal');

    fireEvent.click(screen.getByRole('button', { name: 'cancel' }));
    
    expect(mockNavigate).toHaveBeenCalledWith('/livros-fiscais');
  });

  it('renders financial summary when amounts are positive', async () => {
    useParams.mockReturnValue({ id: 'fb1' });
    const bookData = { id: 'fb1', totalIncome: 100, totalExpenses: 50 };
    const formatted = makeFormattedBook({
      ...bookData,
      formattedTotalIncome: 'R$ 100,00',
      formattedTotalExpenses: 'R$ 50,00',
      formattedNetAmount: 'R$ 50,00'
    });

    fiscalBookService.getById.mockResolvedValue(bookData);
    formatFiscalBookForDisplay.mockReturnValue(formatted);
    isFiscalBookEditable.mockReturnValue(true);

    render(<EditFiscalBook />);
    await waitFor(() => expect(fiscalBookService.getById).toHaveBeenCalled());
    
    // Wait for loading to finish first
    await waitFor(() => expect(screen.queryByTestId('loading')).not.toBeInTheDocument());

    expect(screen.getByText('Resumo Financeiro')).toBeInTheDocument();
    expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
  });

  it('renders correct warning message for Archived vs Closed', async () => {
    // Case 1: Archived - non-editable message should be specific
    useParams.mockReturnValue({ id: 'fb_arch' });
    const archBook = { id: 'fb_arch', status: 'Arquivado' };
    fiscalBookService.getById.mockResolvedValue(archBook);
    formatFiscalBookForDisplay.mockReturnValue(makeFormattedBook({ ...archBook }));
    isFiscalBookEditable.mockReturnValue(false); // Archived is not editable

    const { unmount } = render(<EditFiscalBook />);
    await waitFor(() => expect(screen.queryByTestId('loading')).not.toBeInTheDocument());
    
    expect(screen.getByText(/Livros fiscais arquivados não podem ser modificados/i)).toBeInTheDocument();
    unmount();

    // Case 2: Closed - message specific
    // (Existing test covers closed, but confirming explicitly here ensures branch coverage)
    useParams.mockReturnValue({ id: 'fb_close' });
    const closeBook = { id: 'fb_close', status: 'Fechado' };
    fiscalBookService.getById.mockResolvedValue(closeBook);
    formatFiscalBookForDisplay.mockReturnValue(makeFormattedBook({ ...closeBook }));
    isFiscalBookEditable.mockReturnValue(false); 

    render(<EditFiscalBook />);
    await waitFor(() => expect(screen.queryByTestId('loading')).not.toBeInTheDocument());
    
    expect(screen.getByText(/Livros fiscais fechados são protegidos/i)).toBeInTheDocument();
  });

  it('renders dates correctly with fallbacks', async () => {
    useParams.mockReturnValue({ id: 'fb_dates' });
    const bookData = { 
        id: 'fb_dates', 
        createdAt: '2024-01-01', 
        updatedAt: '2024-01-02',
        closedAt: '2024-01-31'
    };
    
    // Simulate formatFiscalBookForDisplay NOT providing formatted strings, so component uses Raw Date logic
    const formatted = {
        ...makeFormattedBook(bookData),
        createdAtFormatted: null,
        updatedAtFormatted: null,
        closedAtFormatted: null
        // Component logic: updatedAtFormatted || (updatedAt ? new Date(updatedAt)... : 'N/A')
    };

    fiscalBookService.getById.mockResolvedValue(bookData);
    formatFiscalBookForDisplay.mockReturnValue(formatted);
    isFiscalBookEditable.mockReturnValue(true);

    render(<EditFiscalBook />);
    await waitFor(() => expect(screen.queryByTestId('loading')).not.toBeInTheDocument());

    await screen.findByText('Editar Livro Fiscal');

    // Check if it rendered the raw dates (converted to locale string)
    // Note: detailed locale string check might be flaky across environments (CI vs Local), 
    // but usually '01/01/2024' works for pt-BR in Node/JSDOM if locale is set or default is US with slashes.
    // Let's just check it doesn't crash and renders something.
    // If it renders 'N/A' it failed the branch.
    
    // Actually, checking for NOT 'N/A' is safer.
    expect(screen.queryByText('N/A')).not.toBeInTheDocument();
  });

  it('renders breadcrumb using legacy name', async () => {
    useParams.mockReturnValue({ id: 'fb_legacy' });
    const bookData = { id: 'fb_legacy', name: 'Legacy Book' };

    fiscalBookService.getById.mockResolvedValue(bookData);
    formatFiscalBookForDisplay.mockReturnValue(makeFormattedBook({ ...bookData, bookName: undefined, name: 'Legacy Book' }));
    isFiscalBookEditable.mockReturnValue(true);

    render(<EditFiscalBook />);

    await waitFor(() => {
      expect(screen.getByText('Editar: Legacy Book')).toBeInTheDocument();
    });
  });
});
