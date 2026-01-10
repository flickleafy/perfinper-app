import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import FiscalBookDrawer from './FiscalBookDrawer';
import fiscalBookService from '../../services/fiscalBookService';

jest.mock('../../services/fiscalBookService', () => ({
  __esModule: true,
  default: {
    getStatistics: jest.fn(),
    getTransactions: jest.fn(),
    reopen: jest.fn(),
    close: jest.fn(),
    export: jest.fn(),
  },
}));

jest.mock('../../ui/LoadingIndicator', () => ({
  __esModule: true,
  default: ({ message }) => (
    <div data-testid="loading-indicator">{message || 'Loading...'}</div>
  ),
}));

describe('FiscalBookDrawer', () => {
  const baseBook = {
    _id: 'fb1',
    bookName: 'Livro 1',
    bookPeriod: '2024',
    status: 'Aberto',
    transactionCount: 2,
    totalIncome: 1000,
    totalExpenses: 500,
    netAmount: 500,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z',
  };

  beforeAll(() => {
    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = jest.fn(() => 'blob:mock');
    }
    if (!window.URL.revokeObjectURL) {
      window.URL.revokeObjectURL = jest.fn();
    }
    if (!HTMLAnchorElement.prototype.click) {
      HTMLAnchorElement.prototype.click = jest.fn();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    fiscalBookService.getStatistics.mockResolvedValue({});
    fiscalBookService.getTransactions.mockResolvedValue({ transactions: [] });
    fiscalBookService.reopen.mockResolvedValue({});
    fiscalBookService.close.mockResolvedValue({});
    fiscalBookService.export.mockResolvedValue(new Blob(['data']));
  });

  it('returns null when no fiscal book is provided', () => {
    const { container } = render(
      <FiscalBookDrawer open onClose={jest.fn()} fiscalBook={null} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders statistics when available', async () => {
    fiscalBookService.getStatistics.mockResolvedValueOnce({ total: 10 });

    render(
      <FiscalBookDrawer
        open
        onClose={jest.fn()}
        fiscalBook={baseBook}
        initialTab={2}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getStatistics).toHaveBeenCalled();
    });

    expect(
      await screen.findByText('Detailed Statistics')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Detailed statistics feature is coming soon.')
    ).toBeInTheDocument();
  });

  it('shows an error when statistics fail to load', async () => {
    fiscalBookService.getStatistics.mockRejectedValueOnce(new Error('boom'));

    render(
      <FiscalBookDrawer
        open
        onClose={jest.fn()}
        fiscalBook={baseBook}
        initialTab={2}
      />
    );

    expect(
      await screen.findByText('Failed to load statistics')
    ).toBeInTheDocument();
  });

  it('shows a fallback when no statistics are available', async () => {
    fiscalBookService.getStatistics.mockResolvedValueOnce(null);

    render(
      <FiscalBookDrawer
        open
        onClose={jest.fn()}
        fiscalBook={baseBook}
        initialTab={2}
      />
    );

    expect(
      await screen.findByText('No statistics available')
    ).toBeInTheDocument();
  });

  it('renders a transactions list for the transactions tab', async () => {
    fiscalBookService.getTransactions.mockResolvedValueOnce({
      transactions: [
        {
          _id: 't1',
          transactionName: 'Compra',
          transactionValue: '10,00',
          transactionDate: '2024-02-01',
        },
      ],
    });

    render(
      <FiscalBookDrawer
        open
        onClose={jest.fn()}
        fiscalBook={baseBook}
        initialTab={1}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getTransactions).toHaveBeenCalledWith(
        'fb1',
        expect.any(Object)
      );
    });

    expect(await screen.findByText('Compra')).toBeInTheDocument();
  });

  it('shows errors when transactions fail to load', async () => {
    fiscalBookService.getTransactions.mockRejectedValueOnce(new Error('boom'));

    render(
      <FiscalBookDrawer
        open
        onClose={jest.fn()}
        fiscalBook={baseBook}
        initialTab={1}
      />
    );

    expect(
      await screen.findByText('Failed to load transactions')
    ).toBeInTheDocument();
  });

  it('shows a fallback when there are no transactions', async () => {
    fiscalBookService.getTransactions.mockResolvedValueOnce({ transactions: [] });

    render(
      <FiscalBookDrawer
        open
        onClose={jest.fn()}
        fiscalBook={baseBook}
        initialTab={1}
      />
    );

    expect(
      await screen.findByText('No transactions found in this fiscal book')
    ).toBeInTheDocument();
  });

  it('handles missing transactions property in response', async () => {
    fiscalBookService.getTransactions.mockResolvedValue({}); // no transactions array

    render(
      <FiscalBookDrawer
        open={true}
        onClose={jest.fn()}
        fiscalBook={baseBook}
        initialTab={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No transactions found in this fiscal book')).toBeInTheDocument();
    });
  });

  it('handles status toggle for closed books', async () => {
    const onRefresh = jest.fn();

    render(
      <FiscalBookDrawer
        open
        onClose={jest.fn()}
        fiscalBook={{ ...baseBook, status: 'Fechado' }}
        onRefresh={onRefresh}
      />
    );

    await waitFor(() => expect(fiscalBookService.getStatistics).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /Reabrir/i }));

    await waitFor(() => {
      expect(fiscalBookService.reopen).toHaveBeenCalledWith('fb1');
    });
    expect(onRefresh).toHaveBeenCalled();
  });

  it('handles status toggle for open books', async () => {
    render(
      <FiscalBookDrawer
        open
        onClose={jest.fn()}
        fiscalBook={baseBook}
      />
    );

    await waitFor(() => expect(fiscalBookService.getStatistics).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /Fechar/i }));

    await waitFor(() => {
      expect(fiscalBookService.close).toHaveBeenCalledWith('fb1');
    });
  });

  it('exports fiscal book data as csv', async () => {
    render(
      <FiscalBookDrawer
        open
        onClose={jest.fn()}
        fiscalBook={baseBook}
      />
    );

    await waitFor(() => expect(fiscalBookService.getStatistics).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /Export/i }));

    await waitFor(() => {
      expect(fiscalBookService.export).toHaveBeenCalledWith('fb1', 'csv');
    });

    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('switches tabs and loads transactions', async () => {
    render(
      <FiscalBookDrawer
        open
        onClose={jest.fn()}
        fiscalBook={baseBook}
        initialTab={0}
      />
    );

    await waitFor(() => expect(fiscalBookService.getStatistics).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('tab', { name: /Transactions/i }));

    await waitFor(() => {
      expect(fiscalBookService.getTransactions).toHaveBeenCalledWith(
        'fb1',
        expect.any(Object)
      );
    });
  });

  it('invokes onEdit when the edit button is clicked', async () => {
    const onEdit = jest.fn();

    render(
      <FiscalBookDrawer
        open
        onClose={jest.fn()}
        fiscalBook={baseBook}
        onEdit={onEdit}
      />
    );

    await waitFor(() => expect(fiscalBookService.getStatistics).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /Edit/i }));

    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ bookName: 'Livro 1' })
    );
  });

  it('logs errors when closing fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    fiscalBookService.close.mockRejectedValueOnce(new Error('boom'));

    render(
      <FiscalBookDrawer
        open
        onClose={jest.fn()}
        fiscalBook={baseBook}
      />
    );

    await waitFor(() => expect(fiscalBookService.getStatistics).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /Fechar/i }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('logs errors when export fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    fiscalBookService.export.mockRejectedValueOnce(new Error('boom'));

    render(
      <FiscalBookDrawer
        open
        onClose={jest.fn()}
        fiscalBook={baseBook}
      />
    );

    await waitFor(() => expect(fiscalBookService.getStatistics).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /Export/i }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('renders status chips for review, archived, and unknown statuses', async () => {
    render(
      <>
        <FiscalBookDrawer
          open
          onClose={jest.fn()}
          fiscalBook={{ ...baseBook, status: 'Em Revisão' }}
        />
        <FiscalBookDrawer
          open
          onClose={jest.fn()}
          fiscalBook={{ ...baseBook, _id: 'fb2', status: 'Arquivado' }}
        />
        <FiscalBookDrawer
          open
          onClose={jest.fn()}
          fiscalBook={{ ...baseBook, _id: 'fb3', status: 'Outro' }}
        />
      </>
    );

    await waitFor(() => expect(fiscalBookService.getStatistics).toHaveBeenCalledTimes(3));

    expect((await screen.findAllByText('Em Revisão')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('Arquivado')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('Outro')).length).toBeGreaterThan(0);
  });

  it('renders overview details with description and closed date', async () => {
    const bookWithNotes = {
      ...baseBook,
      notes: 'Detalhe importante',
      closedAt: '2024-02-01T00:00:00.000Z',
    };

    render(
      <FiscalBookDrawer
        open
        onClose={jest.fn()}
        fiscalBook={bookWithNotes}
        initialTab={0}
      />
    );

    await waitFor(() => expect(fiscalBookService.getStatistics).toHaveBeenCalled());

    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Detalhe importante')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('shows loading feedback while transactions are loading', async () => {
    fiscalBookService.getTransactions.mockReturnValueOnce(new Promise(() => {}));

    render(
      <FiscalBookDrawer
        open
        onClose={jest.fn()}
        fiscalBook={baseBook}
        initialTab={1}
      />
    );

    expect(await screen.findByText('Loading transactions...')).toBeInTheDocument();
  });

  it('shows loading feedback while statistics are loading', async () => {
    fiscalBookService.getStatistics.mockReturnValueOnce(new Promise(() => {}));

    render(
      <FiscalBookDrawer
        open
        onClose={jest.fn()}
        fiscalBook={baseBook}
        initialTab={2}
      />
    );

    expect(await screen.findByTestId('loading-indicator')).toHaveTextContent(
      'Loading statistics...'
    );
  });

  test('loads statistics on mount for statistics tab', async () => {
    fiscalBookService.getStatistics.mockResolvedValue({ total: 1000 });
    
    await act(async () => {
      render(
        <FiscalBookDrawer
          open={true}
          fiscalBook={baseBook}
          initialTab={2}
          onClose={jest.fn()}
        />
      );
    });

    // Expect loading state or result
    await waitFor(() => {
      expect(fiscalBookService.getStatistics).toHaveBeenCalled();
    });
  });

  test('handles error when loading statistics', async () => {
    fiscalBookService.getStatistics.mockRejectedValue(new Error('Stats fail'));
    
    await act(async () => {
      render(
        <FiscalBookDrawer
          open={true}
          fiscalBook={baseBook}
          initialTab={2}
          onClose={jest.fn()}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to load statistics')).toBeInTheDocument();
    });
  });

  test('displays loading state for transactions', async () => {
    // Create a promise to control resolution
    let resolvePromise;
    const promise = new Promise(r => { resolvePromise = r; });
    fiscalBookService.getTransactions.mockReturnValue(promise);

    render(
      <FiscalBookDrawer
        open={true}
        fiscalBook={baseBook}
        initialTab={1}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText(/loading transactions/i)).toBeInTheDocument();
    
    await act(async () => {
      resolvePromise({ transactions: [] });
    });
  });

  test('displays error state for transactions', async () => {
    fiscalBookService.getTransactions.mockRejectedValue(new Error('Trans fail'));

    await act(async () => {
      render(
        <FiscalBookDrawer
          open={true}
          fiscalBook={baseBook}
          initialTab={1}
          onClose={jest.fn()}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to load transactions')).toBeInTheDocument();
    });
  });
});
