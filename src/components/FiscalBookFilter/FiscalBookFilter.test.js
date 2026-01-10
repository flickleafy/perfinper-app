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

  it('maps "Sem Livro Fiscal" to the raw selection value', async () => {
    const onFiscalBookChange = jest.fn();
    render(<FiscalBookFilter selectedFiscalBookId={null} onFiscalBookChange={onFiscalBookChange} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Livro Fiscal')).toBeInTheDocument();
    });

    const selector = screen.getByLabelText('Livro Fiscal');
    fireEvent.mouseDown(selector);

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      const option = options.find((opt) => opt.getAttribute('data-value') === 'none');
      expect(option).toBeTruthy();
      fireEvent.click(option);
    });

    expect(onFiscalBookChange).toHaveBeenCalledWith('none');
  });

  it('renders a fallback when the selected book is missing', async () => {
    render(<FiscalBookFilter selectedFiscalBookId="missing" onFiscalBookChange={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Livro Fiscal')).toBeInTheDocument();
    });

    expect(screen.queryByText('Aberto')).not.toBeInTheDocument();
  });

  it('skips transaction lookups for invalid book ids', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    fiscalBookService.getAll.mockResolvedValueOnce([
      {
        id: undefined,
        bookName: 'Invalid',
        bookPeriod: '2025',
        bookType: 'Mensal',
        status: 'Aberto',
      },
      books[0],
    ]);

    render(<FiscalBookFilter selectedFiscalBookId={null} onFiscalBookChange={jest.fn()} />);

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    expect(fiscalBookService.getTransactions).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('handles transaction count errors per book', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    fiscalBookService.getAll.mockResolvedValueOnce([books[0]]);
    fiscalBookService.getTransactions.mockRejectedValueOnce(new Error('Network'));

    render(<FiscalBookFilter selectedFiscalBookId={null} onFiscalBookChange={jest.fn()} />);

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    consoleWarnSpy.mockRestore();
  });

  it('shows loading feedback while fetching books', async () => {
    fiscalBookService.getAll.mockReturnValueOnce(new Promise(() => {}));

    render(<FiscalBookFilter selectedFiscalBookId={null} onFiscalBookChange={jest.fn()} />);

    expect(await screen.findByText('Carregando...')).toBeInTheDocument();
  });

  it('renders the error menu item when the API fails', async () => {
    fiscalBookService.getAll.mockRejectedValueOnce(new Error('Network'));

    render(<FiscalBookFilter selectedFiscalBookId={null} onFiscalBookChange={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    const selector = screen.getByLabelText('Livro Fiscal');
    fireEvent.mouseDown(selector);

    expect(
      await screen.findByRole('option', { name: 'Erro ao carregar livros fiscais' })
    ).toBeInTheDocument();
  });

  it('renders status chips for review and unknown statuses', async () => {
    fiscalBookService.getAll.mockResolvedValueOnce([
      {
        id: 'fb3',
        bookName: 'Livro C',
        bookPeriod: '2023-01',
        bookType: 'Mensal',
        status: 'Em Revisão',
      },
      {
        id: 'fb4',
        bookName: 'Livro D',
        bookPeriod: '2023-02',
        bookType: 'Mensal',
        status: 'Outro',
      },
    ]);

    render(<FiscalBookFilter selectedFiscalBookId="fb3" onFiscalBookChange={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Livro Fiscal')).toBeInTheDocument();
    });

    expect(await screen.findByText('Em Revisão')).toBeInTheDocument();

    const selector = screen.getByLabelText('Livro Fiscal');
    fireEvent.mouseDown(selector);

    expect(screen.getByText('Outro')).toBeInTheDocument();
  });

  it('renders "Sem Livro Fiscal" when selected value is none', async () => {
    render(<FiscalBookFilter selectedFiscalBookId="none" onFiscalBookChange={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Livro Fiscal')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Sem Livro Fiscal')).toBeInTheDocument();
  });

  it('renders status chip for archived books', async () => {
    fiscalBookService.getAll.mockResolvedValueOnce([
      {
        id: 'fb5',
        bookName: 'Livro E',
        bookPeriod: '2022',
        bookType: 'Mensal',
        status: 'Arquivado',
      },
    ]);

    render(<FiscalBookFilter selectedFiscalBookId="fb5" onFiscalBookChange={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Livro Fiscal')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Arquivado')).toBeInTheDocument();
  });

  it('closes the error toast', async () => {
    fiscalBookService.getAll.mockRejectedValueOnce(new Error('Network'));

    render(<FiscalBookFilter selectedFiscalBookId={null} onFiscalBookChange={jest.fn()} />);

    const alert = await screen.findByRole('alert');
    fireEvent.click(alert.querySelector('button'));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
