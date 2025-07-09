import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import FiscalBookFilter from './FiscalBookFilter';
import fiscalBookService from '../../services/fiscalBookService.js';

jest.mock('../../services/fiscalBookService.js', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(),
    getTransactions: jest.fn(),
  },
}));

describe('FiscalBookFilter', () => {
  const books = [
    {
      id: 'fb1',
      bookName: 'Livro A',
      bookPeriod: '2025',
      bookType: 'Mensal',
      status: 'Aberto',
    },
    {
      id: 'fb2',
      bookName: 'Livro B',
      bookPeriod: '2024-12',
      bookType: 'Mensal',
      status: 'Fechado',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    fiscalBookService.getAll.mockResolvedValue(books);
    fiscalBookService.getTransactions.mockImplementation(async (id) => {
      if (id === 'fb1') return [{ id: 't1' }, { id: 't2' }];
      if (id === 'fb2') return [{ id: 't3' }];
      return [];
    });
  });

  it('renders the filter control', async () => {
    render(<FiscalBookFilter selectedFiscalBookId={null} onFiscalBookChange={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Livro Fiscal')).toBeInTheDocument();
    });

    expect(fiscalBookService.getAll).toHaveBeenCalled();
  });

  it('calls onFiscalBookChange when selecting a specific book', async () => {
    const onFiscalBookChange = jest.fn();
    render(<FiscalBookFilter selectedFiscalBookId={null} onFiscalBookChange={onFiscalBookChange} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Livro Fiscal')).toBeInTheDocument();
    });

    const selector = screen.getByLabelText('Livro Fiscal');
    fireEvent.mouseDown(selector);

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      const option = options.find((opt) => opt.getAttribute('data-value') === 'fb1');
      expect(option).toBeTruthy();
      fireEvent.click(option);
    });

    expect(onFiscalBookChange).toHaveBeenCalledWith('fb1');
  });

  it('maps "Todos os Livros" to null', async () => {
    const onFiscalBookChange = jest.fn();
    render(<FiscalBookFilter selectedFiscalBookId="fb1" onFiscalBookChange={onFiscalBookChange} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Livro Fiscal')).toBeInTheDocument();
    });

    const selector = screen.getByLabelText('Livro Fiscal');
    fireEvent.mouseDown(selector);

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      const option = options.find((opt) => opt.getAttribute('data-value') === 'all');
      expect(option).toBeTruthy();
      fireEvent.click(option);
    });

    expect(onFiscalBookChange).toHaveBeenCalledWith(null);
  });

  it('renders a status chip for the selected fiscal book', async () => {
    render(<FiscalBookFilter selectedFiscalBookId="fb1" onFiscalBookChange={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Livro Fiscal')).toBeInTheDocument();
    });

    expect(screen.getByText('Aberto')).toBeInTheDocument();
  });

  it('shows a toast error when failing to load fiscal books', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    fiscalBookService.getAll.mockRejectedValueOnce(new Error('Network'));

    render(<FiscalBookFilter selectedFiscalBookId={null} onFiscalBookChange={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText('Erro ao carregar livros fiscais')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
