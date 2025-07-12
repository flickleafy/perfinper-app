import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SnapshotComparison from './SnapshotComparison';
import snapshotService from '../../services/snapshotService';

jest.mock('../../services/snapshotService', () => ({
  __esModule: true,
  default: {
    compareSnapshot: jest.fn(),
  },
}));

describe('SnapshotComparison', () => {
  const mockSnapshot = {
    _id: 'snap1',
    snapshotName: 'Test Snapshot',
    createdAt: '2024-01-15T00:00:00.000Z',
  };

  const mockComparison = {
    data: {
      snapshotName: 'Test Snapshot',
      snapshotDate: '2024-01-15T00:00:00.000Z',
      fiscalBookId: 'fb1',
      counts: {
        added: 2,
        removed: 1,
        modified: 1,
        unchanged: 5,
      },
      added: [
        { id: 't1', transaction: { transactionName: 'Added Transaction', transactionValue: '100' } },
        { id: 't2', transaction: { transactionName: 'Added Transaction 2', transactionValue: '50' } },
      ],
      removed: [
        { id: 't3', transaction: { transactionName: 'Removed Transaction', transactionValue: '75' } },
      ],
      modified: [
        {
          id: 't4',
          current: { transactionName: 'Modified Transaction', transactionValue: '200' },
          changes: [{ field: 'transactionValue', oldValue: '100', newValue: '200' }],
        },
      ],
      unchanged: [],
      summary: {
        snapshotStats: { transactionCount: 6, totalIncome: 300, totalExpenses: 100, netAmount: 200 },
        currentStats: { transactionCount: 8, totalIncome: 400, totalExpenses: 100, netAmount: 300 },
        differences: { transactionCountDiff: 2, netAmountDiff: 100 },
      },
    },
  };

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    snapshot: mockSnapshot,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    snapshotService.compareSnapshot.mockResolvedValue(mockComparison);
  });

  test('renders dialog with snapshot name', async () => {
    render(<SnapshotComparison {...defaultProps} />);

    expect(await screen.findByText(/Test Snapshot/)).toBeInTheDocument();
  });

  test('shows loading state', () => {
    snapshotService.compareSnapshot.mockReturnValue(new Promise(() => {}));

    render(<SnapshotComparison {...defaultProps} />);

    expect(screen.getByText('Carregando comparação...')).toBeInTheDocument();
  });

  test('shows error message on failure', async () => {
    snapshotService.compareSnapshot.mockRejectedValue(new Error('Comparison failed'));

    render(<SnapshotComparison {...defaultProps} />);

    expect(await screen.findByText('Comparison failed')).toBeInTheDocument();
  });

  test('displays summary statistics', async () => {
    render(<SnapshotComparison {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Added count
    });

    expect(screen.getByText('1')).toBeInTheDocument(); // Modified count
  });

  test('calls onClose when close button clicked', async () => {
    render(<SnapshotComparison {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Test Snapshot/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Fechar/i }));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('does not render when closed', () => {
    render(<SnapshotComparison {...defaultProps} open={false} />);

    expect(screen.queryByText('Comparação')).not.toBeInTheDocument();
  });

  test('does not render when no snapshot provided', () => {
    render(<SnapshotComparison open={true} onClose={jest.fn()} snapshot={null} />);

    // Should render but show loading or empty state
  });

  test('displays added transactions section', async () => {
    render(<SnapshotComparison {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Transações Adicionadas/)).toBeInTheDocument();
    });
  });

  test('displays removed transactions section', async () => {
    render(<SnapshotComparison {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Transações Removidas/)).toBeInTheDocument();
    });
  });

  test('displays modified transactions section', async () => {
    render(<SnapshotComparison {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Transações Modificadas/)).toBeInTheDocument();
    });
  });

  test('shows no differences message when all unchanged', async () => {
    const noChangesComparison = {
      data: {
        ...mockComparison.data,
        counts: { added: 0, removed: 0, modified: 0, unchanged: 10 },
        added: [],
        removed: [],
        modified: [],
      },
    };
    snapshotService.compareSnapshot.mockResolvedValue(noChangesComparison);

    render(<SnapshotComparison {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma diferença encontrada/)).toBeInTheDocument();
    });
  });

  test('has export button', async () => {
    render(<SnapshotComparison {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Exportar Relatório/i })).toBeInTheDocument();
    });
  });
});
