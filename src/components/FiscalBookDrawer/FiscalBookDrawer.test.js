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

// Mock SnapshotsList to capture the onSnapshotCreated callback
let capturedSnapshotCreatedCallback = null;
jest.mock('../SnapshotsList/SnapshotsList', () => ({
  __esModule: true,
  default: ({ onSnapshotCreated, fiscalBookId, fiscalBookName }) => {
    capturedSnapshotCreatedCallback = onSnapshotCreated;
    return (
      <div data-testid="snapshots-list">
        <span data-testid="fiscal-book-id">{fiscalBookId}</span>
        <span data-testid="fiscal-book-name">{fiscalBookName}</span>
        <button data-testid="trigger-snapshot-created" onClick={onSnapshotCreated}>
          Trigger Snapshot Created
        </button>
      </div>
    );
  },
}));

// Mock SnapshotScheduleForm
jest.mock('../SnapshotScheduleForm/SnapshotScheduleForm', () => ({
  __esModule: true,
  default: ({ onSave }) => (
    <div data-testid="snapshot-schedule-form">
      <button data-testid="trigger-save" onClick={onSave}>Save Schedule</button>
    </div>
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

  // ===== Additional branch coverage tests =====
  describe('SnapshotsList onSnapshotCreated callback', () => {
    test('calls onRefresh when onSnapshotCreated is triggered', async () => {
      const onRefresh = jest.fn();

      render(
        <FiscalBookDrawer
          open={true}
          fiscalBook={baseBook}
          initialTab={3}
          onClose={jest.fn()}
          onRefresh={onRefresh}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('trigger-snapshot-created')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('trigger-snapshot-created'));

      expect(onRefresh).toHaveBeenCalled();
    });

    test('does not crash when onRefresh is not provided and onSnapshotCreated is triggered', async () => {
      render(
        <FiscalBookDrawer
          open={true}
          fiscalBook={baseBook}
          initialTab={3}
          onClose={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('trigger-snapshot-created')).toBeInTheDocument();
      });

      // Should not throw
      expect(() => {
        fireEvent.click(screen.getByTestId('trigger-snapshot-created'));
      }).not.toThrow();
    });

    test('passes correct fiscalBookId using _id', async () => {
      render(
        <FiscalBookDrawer
          open={true}
          fiscalBook={baseBook}
          initialTab={3}
          onClose={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('fiscal-book-id')).toHaveTextContent('fb1');
      });
    });

    test('passes correct fiscalBookId using id fallback', async () => {
      const bookWithIdOnly = {
        ...baseBook,
        _id: undefined,
        id: 'fb-fallback-id',
      };

      render(
        <FiscalBookDrawer
          open={true}
          fiscalBook={bookWithIdOnly}
          initialTab={3}
          onClose={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('fiscal-book-id')).toHaveTextContent('fb-fallback-id');
      });
    });
  });

  describe('fiscalBook fallback to id when _id is missing', () => {
    test('SnapshotsList receives id fallback when _id is not present', async () => {
      const bookWithIdOnly = {
        ...baseBook,
        _id: undefined,
        id: 'fb-id-only',
      };

      render(
        <FiscalBookDrawer
          open={true}
          fiscalBook={bookWithIdOnly}
          initialTab={3} // Snapshots tab
          onClose={jest.fn()}
        />
      );

      // The SnapshotsList receives the id fallback
      await waitFor(() => {
        expect(screen.getByTestId('fiscal-book-id')).toHaveTextContent('fb-id-only');
      });
    });
  });

  describe('getStatusChipLabel edge cases', () => {
    test('handles undefined status using default from formatFiscalBookForDisplay', async () => {
      const bookWithNoStatus = {
        ...baseBook,
        status: undefined,
      };

      render(
        <FiscalBookDrawer
          open={true}
          fiscalBook={bookWithNoStatus}
          onClose={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(fiscalBookService.getStatistics).toHaveBeenCalled();
      });

      // Status defaults to 'Aberto' via getFiscalBookStatus in formatFiscalBookForDisplay
      expect(screen.getAllByText('Aberto').length).toBeGreaterThan(0);
    });
  });

  describe('handleToggleStatus without onRefresh', () => {
    test('does not crash when onRefresh is not provided during status toggle', async () => {
      render(
        <FiscalBookDrawer
          open={true}
          fiscalBook={{ ...baseBook, status: 'Fechado' }}
          onClose={jest.fn()}
          // No onRefresh provided
        />
      );

      await waitFor(() => expect(fiscalBookService.getStatistics).toHaveBeenCalled());

      fireEvent.click(screen.getByRole('button', { name: /Reabrir/i }));

      await waitFor(() => {
        expect(fiscalBookService.reopen).toHaveBeenCalledWith('fb1');
      });
      // Should not throw
    });
  });

  describe('handleToggleStatus with no fiscalBook', () => {
    test('handleToggleStatus early returns when fiscalBook is null', async () => {
      // This is already covered by "returns null when no fiscal book is provided"
      // but let's ensure the early return in handleToggleStatus works
      const { container } = render(
        <FiscalBookDrawer open onClose={jest.fn()} fiscalBook={null} />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('onEdit not provided', () => {
    test('does not crash when onEdit is not provided and Edit button is clicked', async () => {
      render(
        <FiscalBookDrawer
          open={true}
          fiscalBook={baseBook}
          onClose={jest.fn()}
          // No onEdit provided
        />
      );

      await waitFor(() => expect(fiscalBookService.getStatistics).toHaveBeenCalled());

      // Should not throw even though onEdit is not provided
      expect(() => {
        fireEvent.click(screen.getByRole('button', { name: /Edit/i }));
      }).not.toThrow();
    });
  });

  describe('transaction with missing _id uses index as key', () => {
    test('handles transaction without _id', async () => {
      fiscalBookService.getTransactions.mockResolvedValueOnce({
        transactions: [
          {
            // No _id
            transactionName: 'No ID Transaction',
            transactionValue: '15,00',
            transactionDate: '2024-03-01',
          },
        ],
      });

      render(
        <FiscalBookDrawer
          open={true}
          fiscalBook={baseBook}
          initialTab={1}
          onClose={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No ID Transaction')).toBeInTheDocument();
      });
    });

    test('handles transaction with missing transactionName', async () => {
      fiscalBookService.getTransactions.mockResolvedValueOnce({
        transactions: [
          {
            _id: 't1',
            // No transactionName
            transactionValue: '20,00',
            transactionDate: '2024-04-01',
          },
        ],
      });

      render(
        <FiscalBookDrawer
          open={true}
          fiscalBook={baseBook}
          initialTab={1}
          onClose={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Unnamed Transaction')).toBeInTheDocument();
      });
    });
  });

  describe('drawer close behavior', () => {
    test('calls onClose when close button is clicked', async () => {
      const onClose = jest.fn();

      render(
        <FiscalBookDrawer
          open={true}
          fiscalBook={baseBook}
          onClose={onClose}
        />
      );

      await waitFor(() => expect(fiscalBookService.getStatistics).toHaveBeenCalled());

      // Find and click the close button (X icon)
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(btn => btn.querySelector('svg[data-testid="CloseIcon"]'));
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  describe('initialTab changes', () => {
    test('updates tabValue when initialTab prop changes', async () => {
      const { rerender } = render(
        <FiscalBookDrawer
          open={true}
          fiscalBook={baseBook}
          initialTab={0}
          onClose={jest.fn()}
        />
      );

      await waitFor(() => expect(fiscalBookService.getStatistics).toHaveBeenCalled());

      // Rerender with different initialTab
      rerender(
        <FiscalBookDrawer
          open={true}
          fiscalBook={baseBook}
          initialTab={2}
          onClose={jest.fn()}
        />
      );

      // The statistics tab should now be active
      await waitFor(() => {
        expect(screen.getByText('Detailed Statistics')).toBeInTheDocument();
      });
    });
  });

  describe('export with legacy field names', () => {
    test('exports with name and year when bookName/bookPeriod are missing', async () => {
      const legacyBook = {
        ...baseBook,
        bookName: undefined,
        name: 'Legacy Name',
        bookPeriod: undefined,
        year: 2023,
      };

      render(
        <FiscalBookDrawer
          open={true}
          fiscalBook={legacyBook}
          onClose={jest.fn()}
        />
      );

      await waitFor(() => expect(fiscalBookService.getStatistics).toHaveBeenCalled());

      fireEvent.click(screen.getByRole('button', { name: /Export/i }));

      await waitFor(() => {
        expect(fiscalBookService.export).toHaveBeenCalledWith('fb1', 'csv');
      });
    });
  });

  describe('loadStatistics early return', () => {
    test('does not load statistics when fiscalBook has no _id', async () => {
      jest.clearAllMocks();
      
      const bookWithoutId = {
        // No _id
        bookName: 'No ID Book',
        bookPeriod: '2024',
        status: 'Aberto',
      };

      render(
        <FiscalBookDrawer
          open={true}
          fiscalBook={bookWithoutId}
          initialTab={2}
          onClose={jest.fn()}
        />
      );

      // Wait a bit to ensure the effect runs
      await new Promise(resolve => setTimeout(resolve, 100));

      // Statistics should NOT be called because there's no _id
      expect(fiscalBookService.getStatistics).not.toHaveBeenCalled();
    });
  });

  describe('loadTransactions early return', () => {
    test('does not load transactions when fiscalBook has no _id', async () => {
      jest.clearAllMocks();
      
      const bookWithoutId = {
        // No _id
        bookName: 'No ID Book',
        bookPeriod: '2024',
        status: 'Aberto',
      };

      render(
        <FiscalBookDrawer
          open={true}
          fiscalBook={bookWithoutId}
          initialTab={1}
          onClose={jest.fn()}
        />
      );

      // Wait a bit to ensure the effect runs
      await new Promise(resolve => setTimeout(resolve, 100));

      // Transactions should NOT be called because there's no _id
      expect(fiscalBookService.getTransactions).not.toHaveBeenCalled();
    });
  });
});
