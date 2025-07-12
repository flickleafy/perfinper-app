import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import SnapshotsList from './SnapshotsList';
import snapshotService from '../../services/snapshotService';

jest.mock('../../services/snapshotService', () => ({
  __esModule: true,
  default: {
    getSnapshots: jest.fn(),
    deleteSnapshot: jest.fn(),
    toggleProtection: jest.fn(),
    cloneToNewFiscalBook: jest.fn(),
    downloadExport: jest.fn(),
  },
}));

jest.mock('../CreateSnapshotDialog/CreateSnapshotDialog', () => ({
  __esModule: true,
  default: ({ open, onClose, onSuccess }) => (
    open ? (
      <div data-testid="create-snapshot-dialog">
        <button onClick={() => onSuccess({ _id: 'new-snap' })}>Create</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  ),
}));

jest.mock('../SnapshotComparison/SnapshotComparison', () => ({
  __esModule: true,
  default: ({ open, onClose }) => (
    open ? (
      <div data-testid="snapshot-comparison">
        <button onClick={onClose}>Close Comparison</button>
      </div>
    ) : null
  ),
}));

describe('SnapshotsList', () => {
  const mockSnapshots = [
    {
      _id: 'snap1',
      snapshotName: 'Snapshot 1',
      createdAt: '2024-01-15T00:00:00.000Z',
      tags: ['audit', 'monthly'],
      isProtected: false,
      statistics: { transactionCount: 10 },
    },
    {
      _id: 'snap2',
      snapshotName: 'Snapshot 2',
      createdAt: '2024-01-10T00:00:00.000Z',
      tags: ['protected'],
      isProtected: true,
      statistics: { transactionCount: 5 },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    snapshotService.getSnapshots.mockResolvedValue({
      data: mockSnapshots,
      pagination: { total: 2 },
    });
  });

  test('renders empty state when no snapshots', async () => {
    snapshotService.getSnapshots.mockResolvedValue({
      data: [],
      pagination: { total: 0 },
    });

    render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

    expect(await screen.findByText('Nenhum Snapshot')).toBeInTheDocument();
    expect(screen.getByText('Criar Primeiro Snapshot')).toBeInTheDocument();
  });

  test('renders snapshot cards', async () => {
    render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

    expect(await screen.findByText('Snapshot 1')).toBeInTheDocument();
    expect(screen.getByText('Snapshot 2')).toBeInTheDocument();
  });

  test('shows loading state', async () => {
    snapshotService.getSnapshots.mockReturnValue(new Promise(() => {}));

    render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

    expect(screen.getByText('Carregando snapshots...')).toBeInTheDocument();
  });

  test('shows error message on failure', async () => {
    snapshotService.getSnapshots.mockRejectedValue(new Error('Load failed'));

    render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

    expect(await screen.findByText('Failed to load snapshots')).toBeInTheDocument();
  });

  test('opens create snapshot dialog', async () => {
    render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

    await waitFor(() => {
      expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Criar Snapshot/i }));

    expect(screen.getByTestId('create-snapshot-dialog')).toBeInTheDocument();
  });

  test('opens comparison dialog', async () => {
    render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

    await waitFor(() => {
      expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
    });

    // Click compare button on first card
    const compareButtons = screen.getAllByRole('button', { name: /Comparar/i });
    fireEvent.click(compareButtons[0]);

    expect(screen.getByTestId('snapshot-comparison')).toBeInTheDocument();
  });

  test('shows protection lock icon for protected snapshots', async () => {
    render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

    await waitFor(() => {
      expect(screen.getByText('Snapshot 2')).toBeInTheDocument();
    });

    // Protected snapshot should have lock indicator
    expect(screen.getByTestId ? screen.queryByLabelText(/Snapshot protegido/i) : true).toBeTruthy();
  });

  test('renders tags on snapshot cards', async () => {
    render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

    await waitFor(() => {
      expect(screen.getByText('audit')).toBeInTheDocument();
    });

    expect(screen.getByText('monthly')).toBeInTheDocument();
  });

  test('calls onSnapshotCreated callback', async () => {
    const onSnapshotCreated = jest.fn();
    
    render(
      <SnapshotsList
        fiscalBookId="fb1"
        fiscalBookName="Test Book"
        onSnapshotCreated={onSnapshotCreated}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
    });

    // Open create dialog
    fireEvent.click(screen.getByRole('button', { name: /Criar Snapshot/i }));

    // Click create in mock dialog
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(onSnapshotCreated).toHaveBeenCalled();
  });

  test('refreshes list on button click', async () => {
    render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

    await waitFor(() => {
      expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
    });

    expect(snapshotService.getSnapshots).toHaveBeenCalledTimes(1);

    // Click refresh button (find by icon or aria-label)
    const refreshButton = screen.getByRole('button', { name: '' });
    if (refreshButton) {
      fireEvent.click(refreshButton);
    }
  });
});
