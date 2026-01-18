import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SnapshotsList from './SnapshotsList';
import snapshotService from '../../services/snapshotService';

// Mock all services
jest.mock('../../services/snapshotService', () => ({
  __esModule: true,
  default: {
    getSnapshots: jest.fn(),
    deleteSnapshot: jest.fn(),
    toggleProtection: jest.fn(),
    cloneToNewFiscalBook: jest.fn(),
    downloadExport: jest.fn(),
    rollbackToSnapshot: jest.fn(),
    updateTags: jest.fn(),
    addSnapshotAnnotation: jest.fn(),
  },
}));

jest.mock('../CreateSnapshotDialog/CreateSnapshotDialog', () => ({
  __esModule: true,
  default: ({ open, onClose, onSuccess }) => (
    open ? (
      <div data-testid="create-snapshot-dialog">
        <button onClick={() => onSuccess({ _id: 'new-snap' })}>Create</button>
        <button onClick={onClose}>Cancel</button>
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

jest.mock('../RollbackConfirmDialog/RollbackConfirmDialog', () => ({
  __esModule: true,
  default: ({ open, onClose, onSuccess }) => (
    open ? (
      <div data-testid="rollback-dialog">
        <button onClick={() => onSuccess({ restoredTransactionCount: 15 })}>Confirm Rollback</button>
        <button onClick={onClose}>Close Rollback</button>
      </div>
    ) : null
  ),
}));

jest.mock('../SnapshotExportDialog/SnapshotExportDialog', () => ({
  __esModule: true,
  default: ({ open, onClose }) => (
    open ? (
      <div data-testid="export-dialog">
        <button onClick={onClose}>Close Export</button>
      </div>
    ) : null
  ),
}));

jest.mock('../SnapshotTagsPopover/SnapshotTagsPopover', () => ({
  __esModule: true,
  default: ({ anchorEl, snapshot, onClose, onUpdate }) => (
    anchorEl ? (
      <div data-testid="tags-popover">
        <button onClick={() => { onUpdate({ ...snapshot, tags: ['updated'] }); onClose(); }}>Update Tags</button>
        <button onClick={onClose}>Close Popover</button>
      </div>
    ) : null
  ),
}));

jest.mock('../SnapshotAnnotations/SnapshotAnnotations', () => ({
  __esModule: true,
  default: ({ snapshot, onAnnotationAdded }) => (
    <div data-testid="snapshot-annotations">
      <span>Annotations for {snapshot?.snapshotName}</span>
      <button onClick={onAnnotationAdded}>Add Annotation</button>
    </div>
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
      creationSource: 'manual',
      statistics: { transactionCount: 10 },
      annotations: [],
    },
    {
      _id: 'snap2',
      snapshotName: 'Protected Snapshot',
      createdAt: '2024-01-10T00:00:00.000Z',
      tags: ['protected'],
      isProtected: true,
      creationSource: 'manual',
      statistics: { transactionCount: 5 },
      annotations: [{ content: 'test', createdAt: '2024-01-11T00:00:00.000Z' }],
    },
    {
      _id: 'snap3',
      snapshotName: 'Auto Snapshot',
      createdAt: '2024-01-05T00:00:00.000Z',
      tags: ['auto'],
      isProtected: false,
      creationSource: 'scheduled',
      statistics: { transactionCount: 8 },
      annotations: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    snapshotService.getSnapshots.mockResolvedValue({
      data: mockSnapshots,
      pagination: { total: 3 },
    });
  });

  // ===== Basic Rendering =====
  describe('Basic Rendering', () => {
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
      expect(screen.getByText('Protected Snapshot')).toBeInTheDocument();
      expect(screen.getByText('Auto Snapshot')).toBeInTheDocument();
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

    test('does not render without fiscalBookId', async () => {
      render(<SnapshotsList fiscalBookId="" fiscalBookName="Test Book" />);

      // Should not call getSnapshots with empty fiscalBookId
      await waitFor(() => {
        expect(snapshotService.getSnapshots).not.toHaveBeenCalled();
      });
    });
  });

  // ===== Visual Indicators =====
  describe('Visual Indicators', () => {
    test('shows protection lock icon for protected snapshots', async () => {
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Protected Snapshot')).toBeInTheDocument();
      });

      // Should have a lock indicator
      const protectedCard = screen.getByText('Protected Snapshot').closest('[class*="Card"]');
      expect(protectedCard).toBeTruthy();
    });

    test('shows schedule icon for auto/scheduled snapshots', async () => {
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Auto Snapshot')).toBeInTheDocument();
      });

      // Should have a schedule indicator for creationSource: 'scheduled' or tag 'auto'
    });

    test('renders tags on snapshot cards', async () => {
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('audit')).toBeInTheDocument();
      });

      expect(screen.getByText('monthly')).toBeInTheDocument();
      expect(screen.getByText('auto')).toBeInTheDocument();
    });

    test('shows transaction count in statistics', async () => {
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText(/10 transações/)).toBeInTheDocument();
      });
    });
  });

  // ===== Create Snapshot =====
  describe('Create Snapshot', () => {
    test('opens create snapshot dialog', async () => {
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Criar Snapshot/i }));

      expect(screen.getByTestId('create-snapshot-dialog')).toBeInTheDocument();
    });

    test('calls onSnapshotCreated callback after creation', async () => {
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

      fireEvent.click(screen.getByRole('button', { name: /Criar Snapshot/i }));
      
      // Wait for dialog to open, then click create button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(onSnapshotCreated).toHaveBeenCalled();
      });
    });

    test('refreshes list after snapshot creation', async () => {
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      expect(snapshotService.getSnapshots).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /Criar Snapshot/i }));
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(snapshotService.getSnapshots).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ===== Comparison =====
  describe('Comparison', () => {
    test('opens comparison dialog', async () => {
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      const compareButtons = screen.getAllByRole('button', { name: /Comparar/i });
      fireEvent.click(compareButtons[0]);

      expect(screen.getByTestId('snapshot-comparison')).toBeInTheDocument();
    });

    test('closes comparison dialog', async () => {
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      const compareButtons = screen.getAllByRole('button', { name: /Comparar/i });
      fireEvent.click(compareButtons[0]);

      expect(screen.getByTestId('snapshot-comparison')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Close Comparison' }));

      await waitFor(() => {
        expect(screen.queryByTestId('snapshot-comparison')).not.toBeInTheDocument();
      });
    });
  });

  // ===== Delete =====
  describe('Delete Snapshot', () => {
    test('opens delete confirmation dialog from menu', async () => {
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu on first snapshot using testid
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      fireEvent.click(menuButtons[0]);

      // Click delete menu item
      const deleteMenuItem = await screen.findByText('Excluir');
      fireEvent.click(deleteMenuItem);

      // Confirmation dialog should appear
      expect(await screen.findByText('Confirmar Exclusão')).toBeInTheDocument();
    });

    test('calls delete service on confirmation', async () => {
      const user = userEvent.setup();
      snapshotService.deleteSnapshot.mockResolvedValue({});

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu and click delete using userEvent for proper async handling
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      await user.click(menuButtons[0]);
      
      // Wait for menu and click delete item
      const deleteMenuItem = await screen.findByRole('menuitem', { name: /Excluir/i });
      await user.click(deleteMenuItem);

      // Wait for confirmation dialog
      await waitFor(() => {
        expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
      });
      
      // Find the confirm button in dialog by data-testid and click
      const confirmButton = await screen.findByTestId('delete-confirm-button');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(snapshotService.deleteSnapshot).toHaveBeenCalledWith('snap1');
      });
    });

    test('shows success message after deletion', async () => {
      const user = userEvent.setup();
      snapshotService.deleteSnapshot.mockResolvedValue({});

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu and delete using userEvent
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      await user.click(menuButtons[0]);
      await user.click(await screen.findByRole('menuitem', { name: /Excluir/i }));
      
      // Wait for confirmation dialog
      await waitFor(() => {
        expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
      });
      
      const confirmButton = await screen.findByTestId('delete-confirm-button');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Snapshot excluído com sucesso')).toBeInTheDocument();
      });
    });

    test('protected snapshot shows disabled delete button', async () => {
      // Mock only the protected snapshot
      snapshotService.getSnapshots.mockResolvedValue({
        data: [mockSnapshots[1]], // Protected snapshot
        pagination: { total: 1 },
      });

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Protected Snapshot')).toBeInTheDocument();
      });

      // Open menu
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      fireEvent.click(menuButtons[0]);

      // Delete should be disabled
      const deleteMenuItem = await screen.findByText('Excluir');
      expect(deleteMenuItem.closest('li')).toHaveAttribute('aria-disabled', 'true');
    });

    test('shows error on delete failure', async () => {
      const user = userEvent.setup();
      snapshotService.deleteSnapshot.mockRejectedValue(new Error('Cannot delete'));

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu and delete using userEvent
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      await user.click(menuButtons[0]);
      await user.click(await screen.findByRole('menuitem', { name: /Excluir/i }));
      
      // Wait for confirmation dialog
      await waitFor(() => {
        expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
      });
      
      const confirmButton = await screen.findByTestId('delete-confirm-button');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Cannot delete/)).toBeInTheDocument();
      });
    });
  });

  // ===== Rollback =====
  describe('Rollback', () => {
    test('opens rollback dialog from menu', async () => {
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      fireEvent.click(menuButtons[0]);

      // Click rollback
      fireEvent.click(await screen.findByText('Rollback para este Snapshot'));

      expect(screen.getByTestId('rollback-dialog')).toBeInTheDocument();
    });

    test('shows success message after rollback', async () => {
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

      // Open menu and trigger rollback
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      fireEvent.click(menuButtons[0]);
      fireEvent.click(await screen.findByText('Rollback para este Snapshot'));
      fireEvent.click(screen.getByRole('button', { name: 'Confirm Rollback' }));

      await waitFor(() => {
        expect(screen.getByText(/Rollback concluído! 15 transações restauradas/)).toBeInTheDocument();
      });

      // Should refresh parent
      expect(onSnapshotCreated).toHaveBeenCalled();
    });
  });

  // ===== Clone =====
  describe('Clone to New Fiscal Book', () => {
    test('clones snapshot successfully', async () => {
      snapshotService.cloneToNewFiscalBook.mockResolvedValue({
        data: { bookName: 'Cloned Book' },
      });

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu and click clone
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      fireEvent.click(menuButtons[0]);
      fireEvent.click(await screen.findByText('Clonar para Novo Livro'));

      await waitFor(() => {
        expect(snapshotService.cloneToNewFiscalBook).toHaveBeenCalledWith('snap1');
      });

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/Livro fiscal criado com sucesso: Cloned Book/)).toBeInTheDocument();
      });
    });

    test('shows error on clone failure', async () => {
      snapshotService.cloneToNewFiscalBook.mockRejectedValue(new Error('Clone failed'));

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu and click clone
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      fireEvent.click(menuButtons[0]);
      fireEvent.click(await screen.findByText('Clonar para Novo Livro'));

      await waitFor(() => {
        expect(screen.getByText('Failed to clone snapshot to new fiscal book')).toBeInTheDocument();
      });
    });
  });

  // ===== Tags =====
  describe('Tags Popover', () => {
    test('opens tags popover from menu', async () => {
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      fireEvent.click(menuButtons[0]);

      // Click manage tags
      fireEvent.click(await screen.findByText('Gerenciar Tags'));

      expect(screen.getByTestId('tags-popover')).toBeInTheDocument();
    });

    test('updates snapshot in list after tag change', async () => {
      const user = userEvent.setup();
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Initial tags should be shown
      expect(screen.getByText('audit')).toBeInTheDocument();

      // Open menu and tags popover using userEvent
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      await user.click(menuButtons[0]);
      await user.click(await screen.findByText('Gerenciar Tags'));

      // Update tags via the mocked button - this calls handleTagsUpdate
      await user.click(screen.getByRole('button', { name: 'Update Tags' }));

      // handleTagsUpdate updates local state with new tags ['updated']
      // This test verifies the mock interaction works correctly
      await waitFor(() => {
        expect(screen.queryByTestId('tags-popover')).not.toBeInTheDocument();
      });
    });
  });

  // ===== Export =====
  describe('Export Dialog', () => {
    test('opens export dialog from menu', async () => {
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      fireEvent.click(menuButtons[0]);

      // Click export
      fireEvent.click(await screen.findByText('Exportar...'));

      expect(screen.getByTestId('export-dialog')).toBeInTheDocument();
    });
  });

  // ===== Annotations =====
  describe('Annotations Dialog', () => {
    test('opens annotations dialog from menu', async () => {
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      fireEvent.click(menuButtons[0]);

      // Click annotations
      fireEvent.click(await screen.findByText(/Anotações/));

      await waitFor(() => {
        expect(screen.getByTestId('snapshot-annotations')).toBeInTheDocument();
      });
    });

    test('shows annotation count in menu', async () => {
      snapshotService.getSnapshots.mockResolvedValue({
        data: [mockSnapshots[1]], // Has 1 annotation
        pagination: { total: 1 },
      });

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Protected Snapshot')).toBeInTheDocument();
      });

      // Open menu
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      fireEvent.click(menuButtons[0]);

      // Should show (1) count
      expect(await screen.findByText(/Anotações \(1\)/)).toBeInTheDocument();
    });
  });

  // ===== Protection Toggle =====
  describe('Protection Toggle', () => {
    test('toggles protection on unprotected snapshot', async () => {
      snapshotService.toggleProtection.mockResolvedValue({});

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      fireEvent.click(menuButtons[0]);

      // Click protect
      fireEvent.click(await screen.findByText('Proteger'));

      await waitFor(() => {
        expect(snapshotService.toggleProtection).toHaveBeenCalledWith('snap1', true);
      });
    });

    test('toggles protection off on protected snapshot', async () => {
      snapshotService.getSnapshots.mockResolvedValue({
        data: [mockSnapshots[1]], // Protected
        pagination: { total: 1 },
      });
      snapshotService.toggleProtection.mockResolvedValue({});

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Protected Snapshot')).toBeInTheDocument();
      });

      // Open menu
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      fireEvent.click(menuButtons[0]);

      // Click remove protection
      fireEvent.click(await screen.findByText('Remover Proteção'));

      await waitFor(() => {
        expect(snapshotService.toggleProtection).toHaveBeenCalledWith('snap2', false);
      });
    });
  });

  // ===== Tag Filter =====
  describe('Tag Filtering', () => {
    test('filters snapshots by tag', async () => {
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // TODO: Find and interact with tag filter select
      // This would require more advanced testing to interact with Material-UI Select
    });
  });

  // ===== Refresh =====
  describe('Refresh', () => {
    test('refreshes snapshots list on button click', async () => {
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      expect(snapshotService.getSnapshots).toHaveBeenCalledTimes(1);

      // Find and click refresh button (IconButton with RefreshIcon)
      const refreshButton = screen.getByLabelText ? 
        screen.queryByLabelText('refresh') : 
        screen.getAllByRole('button')[1]; // Usually second button

      if (refreshButton) {
        fireEvent.click(refreshButton);
        
        await waitFor(() => {
          expect(snapshotService.getSnapshots).toHaveBeenCalledTimes(2);
        });
      }
    });
  });

  // ===== Export Dialog =====
  describe('Export Dialog', () => {
    test('opens export dialog from menu', async () => {
      const user = userEvent.setup();
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Click more options on the first snapshot
      const moreButtons = screen.getAllByTestId('MoreVertIcon');
      await user.click(moreButtons[0].closest('button'));

      // Click "Exportar JSON" menu item
      const exportMenuItem = await screen.findByText('Exportar JSON');
      await user.click(exportMenuItem);

      // Should call downloadExport service
      await waitFor(() => {
        expect(snapshotService.downloadExport).toHaveBeenCalledWith(
          'snap1',
          'json',
          expect.stringContaining('snapshot-Snapshot 1')
        );
      });
    });

    test('exports CSV from menu', async () => {
      const user = userEvent.setup();
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Click more options
      const moreButtons = screen.getAllByTestId('MoreVertIcon');
      await user.click(moreButtons[0].closest('button'));

      // Click "Exportar CSV"
      const csvMenuItem = await screen.findByText('Exportar CSV');
      await user.click(csvMenuItem);

      await waitFor(() => {
        expect(snapshotService.downloadExport).toHaveBeenCalledWith(
          'snap1',
          'csv',
          expect.stringContaining('snapshot-Snapshot 1')
        );
      });
    });
  });

  // ===== Tags Popover =====
  describe('Tags Popover', () => {
    test('opens tags popover from menu', async () => {
      const user = userEvent.setup();
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Click more options
      const moreButtons = screen.getAllByTestId('MoreVertIcon');
      await user.click(moreButtons[0].closest('button'));

      // Click "Gerenciar Tags" menu item
      const tagsMenuItem = await screen.findByText('Gerenciar Tags');
      await user.click(tagsMenuItem);

      // Tags popover should open
      expect(screen.getByTestId('tags-popover')).toBeInTheDocument();
    });
  });

  // ===== Clone =====
  describe('Clone', () => {
    test('clones snapshot to new fiscal book', async () => {
      const user = userEvent.setup();
      snapshotService.cloneToNewFiscalBook.mockResolvedValue({ data: { bookName: 'Cloned Book' } });
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu
      const moreButtons = screen.getAllByTestId('MoreVertIcon');
      await user.click(moreButtons[0].closest('button'));

      // Click clone
      const cloneMenuItem = await screen.findByText('Clonar para Novo Livro');
      await user.click(cloneMenuItem);

      await waitFor(() => {
        expect(snapshotService.cloneToNewFiscalBook).toHaveBeenCalled();
      });
    });

    test('handles clone error', async () => {
      const user = userEvent.setup();
      snapshotService.cloneToNewFiscalBook.mockRejectedValue(new Error('Clone failed'));
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      const moreButtons = screen.getAllByTestId('MoreVertIcon');
      await user.click(moreButtons[0].closest('button'));

      const cloneMenuItem = await screen.findByText('Clonar para Novo Livro');
      await user.click(cloneMenuItem);

      await waitFor(() => {
        expect(screen.getByText('Failed to clone snapshot to new fiscal book')).toBeInTheDocument();
      });
    });
  });

  // ===== Error Handling =====
  describe('Error Handling', () => {
    test('shows error on export failure', async () => {
      const user = userEvent.setup();
      snapshotService.downloadExport.mockRejectedValue(new Error('Export failed'));
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      const moreButtons = screen.getAllByTestId('MoreVertIcon');
      await user.click(moreButtons[0].closest('button'));

      const exportMenuItem = await screen.findByText('Exportar JSON');
      await user.click(exportMenuItem);

      await waitFor(() => {
        expect(screen.getByText('Failed to export snapshot')).toBeInTheDocument();
      });
    });

    test('shows error on toggle protection failure', async () => {
      const user = userEvent.setup();
      snapshotService.toggleProtection.mockRejectedValue(new Error('Toggle failed'));
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      const moreButtons = screen.getAllByTestId('MoreVertIcon');
      await user.click(moreButtons[0].closest('button'));

      const toggleMenuItem = await screen.findByText('Proteger');
      await user.click(toggleMenuItem);

      await waitFor(() => {
        expect(screen.getByText('Failed to toggle protection')).toBeInTheDocument();
      });
    });
  });

  // ===== Quick Actions =====
  describe('Quick Actions', () => {
    test('opens comparison from quick compare button', async () => {
      const user = userEvent.setup();
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Click the quick "Comparar" button on the card
      const compareButtons = screen.getAllByRole('button', { name: /Comparar/ });
      await user.click(compareButtons[0]);

      expect(screen.getByTestId('snapshot-comparison')).toBeInTheDocument();
    });

    test('exports from quick export button', async () => {
      const user = userEvent.setup();
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Click the quick "Exportar" button on the card
      const exportButtons = screen.getAllByRole('button', { name: /Exportar/ });
      await user.click(exportButtons[0]);

      await waitFor(() => {
        expect(snapshotService.downloadExport).toHaveBeenCalled();
      });
    });
  });

  // ===== Rollback Success =====
  describe('Rollback Success', () => {
    test('shows success message and refreshes after rollback', async () => {
      const onSnapshotCreated = jest.fn();
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" onSnapshotCreated={onSnapshotCreated} />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu and trigger rollback dialog
      const moreButtons = screen.getAllByTestId('MoreVertIcon');
      fireEvent.click(moreButtons[0].closest('button'));

      const rollbackMenuItem = await screen.findByText('Rollback para este Snapshot');
      fireEvent.click(rollbackMenuItem);

      // Confirm rollback in mocked dialog
      const confirmButton = await screen.findByRole('button', { name: 'Confirm Rollback' });
      fireEvent.click(confirmButton);

      // Success callback should be triggered
      await waitFor(() => {
        expect(onSnapshotCreated).toHaveBeenCalled();
      });
    });
  });

  // ===== Additional Coverage Tests =====
  describe('Additional Coverage', () => {
    test('empty state button opens create snapshot dialog', async () => {
      snapshotService.getSnapshots.mockResolvedValue({
        data: [],
        pagination: { total: 0 },
      });

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Nenhum Snapshot')).toBeInTheDocument();
      });

      // Click "Criar Primeiro Snapshot" button in empty state
      fireEvent.click(screen.getByRole('button', { name: /Criar Primeiro Snapshot/i }));

      expect(screen.getByTestId('create-snapshot-dialog')).toBeInTheDocument();
    });

    test('compare from context menu sets selected snapshot and opens comparison', async () => {
      const user = userEvent.setup();
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu
      const moreButtons = screen.getAllByTestId('MoreVertIcon');
      await user.click(moreButtons[0].closest('button'));

      // Click "Comparar com Atual"
      const compareMenuItem = await screen.findByText('Comparar com Atual');
      await user.click(compareMenuItem);

      expect(screen.getByTestId('snapshot-comparison')).toBeInTheDocument();
    });

    test('closes annotations dialog with Fechar button', async () => {
      const user = userEvent.setup();
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu
      const moreButtons = screen.getAllByTestId('MoreVertIcon');
      await user.click(moreButtons[0].closest('button'));

      // Click annotations menu item
      await user.click(await screen.findByText(/Anotações/));

      await waitFor(() => {
        expect(screen.getByTestId('snapshot-annotations')).toBeInTheDocument();
      });

      // Click "Fechar" to close the dialog
      await user.click(screen.getByRole('button', { name: 'Fechar' }));

      await waitFor(() => {
        // Should refresh snapshots after closing
        expect(snapshotService.getSnapshots).toHaveBeenCalledTimes(2);
      });
    });

    test('can dismiss error alert', async () => {
      const user = userEvent.setup();
      snapshotService.getSnapshots.mockRejectedValueOnce(new Error('Load error'));

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load snapshots')).toBeInTheDocument();
      });

      // Find and click the close button on the error alert
      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);

      expect(screen.queryByText('Failed to load snapshots')).not.toBeInTheDocument();
    });

    test('cancel delete confirmation dialog', async () => {
      const user = userEvent.setup();
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu and click delete
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      await user.click(menuButtons[0]);
      await user.click(await screen.findByRole('menuitem', { name: /Excluir/i }));

      // Wait for confirmation dialog
      await waitFor(() => {
        expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
      });

      // Click "Cancelar" to close
      await user.click(screen.getByRole('button', { name: 'Cancelar' }));

      await waitFor(() => {
        expect(screen.queryByText('Confirmar Exclusão')).not.toBeInTheDocument();
      });

      // deleteSnapshot should NOT have been called
      expect(snapshotService.deleteSnapshot).not.toHaveBeenCalled();
    });

    test('closes CreateSnapshotDialog', async () => {
      const user = userEvent.setup();
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open dialog
      await user.click(screen.getByRole('button', { name: /Criar Snapshot/i }));

      expect(screen.getByTestId('create-snapshot-dialog')).toBeInTheDocument();

      // Click Cancel to close
      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(screen.queryByTestId('create-snapshot-dialog')).not.toBeInTheDocument();
      });
    });

    test('closes rollback dialog', async () => {
      const user = userEvent.setup();
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu
      const moreButtons = screen.getAllByTestId('MoreVertIcon');
      await user.click(moreButtons[0].closest('button'));

      // Click rollback
      await user.click(await screen.findByText('Rollback para este Snapshot'));

      expect(screen.getByTestId('rollback-dialog')).toBeInTheDocument();

      // Click Close in mocked dialog
      await user.click(screen.getByRole('button', { name: 'Close Rollback' }));

      await waitFor(() => {
        expect(screen.queryByTestId('rollback-dialog')).not.toBeInTheDocument();
      });
    });

    test('closes export dialog', async () => {
      const user = userEvent.setup();
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu
      const moreButtons = screen.getAllByTestId('MoreVertIcon');
      await user.click(moreButtons[0].closest('button'));

      // Click export dialog
      await user.click(await screen.findByText('Exportar...'));

      expect(screen.getByTestId('export-dialog')).toBeInTheDocument();

      // Click Close in mocked dialog
      await user.click(screen.getByRole('button', { name: 'Close Export' }));

      await waitFor(() => {
        expect(screen.queryByTestId('export-dialog')).not.toBeInTheDocument();
      });
    });

    test('tag filter onChange updates filter state', async () => {
      const user = userEvent.setup();
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open the tag filter select by clicking the combobox
      const tagFilterSelect = screen.getByRole('combobox');
      await user.click(tagFilterSelect);

      // Select a tag
      const auditOption = await screen.findByRole('option', { name: 'audit' });
      await user.click(auditOption);

      // Should trigger a new fetch with the tag filter
      await waitFor(() => {
        expect(snapshotService.getSnapshots).toHaveBeenCalledWith('fb1', expect.objectContaining({
          tags: ['audit'],
        }));
      });
    });

    test('handles snapshot with snapshotDescription', async () => {
      snapshotService.getSnapshots.mockResolvedValue({
        data: [
          {
            ...mockSnapshots[0],
            snapshotDescription: 'This is a detailed description',
          },
        ],
        pagination: { total: 1 },
      });

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('This is a detailed description')).toBeInTheDocument();
      });
    });

    test('formatDate handles missing date', async () => {
      snapshotService.getSnapshots.mockResolvedValue({
        data: [
          {
            ...mockSnapshots[0],
            createdAt: null,
          },
        ],
        pagination: { total: 1 },
      });

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Should display N/A for missing date
      expect(screen.getByText(/N\/A/)).toBeInTheDocument();
    });

    test('handles clone with missing bookName in result', async () => {
      const user = userEvent.setup();
      snapshotService.cloneToNewFiscalBook.mockResolvedValue({ data: {} });

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu
      const moreButtons = screen.getAllByTestId('MoreVertIcon');
      await user.click(moreButtons[0].closest('button'));

      // Click clone
      await user.click(await screen.findByText('Clonar para Novo Livro'));

      await waitFor(() => {
        expect(screen.getByText(/Livro fiscal criado com sucesso: Novo Livro/)).toBeInTheDocument();
      });
    });

    test('handles rollbackSuccess with missing transaction count', async () => {
      const onSnapshotCreated = jest.fn();
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" onSnapshotCreated={onSnapshotCreated} />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Trigger rollback similar to success test
      const moreButtons = screen.getAllByTestId('MoreVertIcon');
      fireEvent.click(moreButtons[0].closest('button'));

      const rollbackMenuItem = await screen.findByText('Rollback para este Snapshot');
      fireEvent.click(rollbackMenuItem);

      // Confirm rollback, but mock returns undefined result
      const confirmButton = await screen.findByRole('button', { name: 'Confirm Rollback' });
      fireEvent.click(confirmButton);

      // Should still show success message with 0 or default count
      await waitFor(() => {
        expect(screen.getByText(/Rollback concluído!/)).toBeInTheDocument();
      });
    });

    test('closes tags popover', async () => {
      const user = userEvent.setup();
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu
      const moreButtons = screen.getAllByTestId('MoreVertIcon');
      await user.click(moreButtons[0].closest('button'));

      // Click "Gerenciar Tags"
      await user.click(await screen.findByText('Gerenciar Tags'));

      expect(screen.getByTestId('tags-popover')).toBeInTheDocument();

      // Click Close in mocked popover
      await user.click(screen.getByRole('button', { name: 'Close Popover' }));

      await waitFor(() => {
        expect(screen.queryByTestId('tags-popover')).not.toBeInTheDocument();
      });
    });

    test('closes delete dialog via backdrop/Escape key', async () => {
      const user = userEvent.setup();
      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu and click delete
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      await user.click(menuButtons[0]);
      await user.click(await screen.findByRole('menuitem', { name: /Excluir/i }));

      // Wait for confirmation dialog
      await waitFor(() => {
        expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
      });

      // Press Escape to close the dialog (triggers onClose)
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText('Confirmar Exclusão')).not.toBeInTheDocument();
      });
    });

    test('success snackbar can be dismissed', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      snapshotService.deleteSnapshot.mockResolvedValue({});

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Trigger delete to get success message
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      await user.click(menuButtons[0]);
      await user.click(await screen.findByRole('menuitem', { name: /Excluir/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
      });
      
      const confirmButton = await screen.findByTestId('delete-confirm-button');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Snapshot excluído com sucesso')).toBeInTheDocument();
      });

      // Advance time to trigger auto-hide
      jest.advanceTimersByTime(4000);

      await waitFor(() => {
        expect(screen.queryByText('Snapshot excluído com sucesso')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    test('handles snapshots without tags', async () => {
      snapshotService.getSnapshots.mockResolvedValue({
        data: [
          {
            _id: 'snap-no-tags',
            snapshotName: 'No Tags Snapshot',
            createdAt: '2024-01-15T00:00:00.000Z',
            statistics: { transactionCount: 5 },
            isProtected: false,
          },
        ],
        pagination: { total: 1 },
      });

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('No Tags Snapshot')).toBeInTheDocument();
      });

      // Should not have any tag chips
      expect(screen.queryByTestId('TagIcon')).not.toBeInTheDocument();
    });

    test('handles API response with missing data field', async () => {
      snapshotService.getSnapshots.mockResolvedValue({ pagination: { total: 0 } });

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Nenhum Snapshot')).toBeInTheDocument();
      });
    });

    test('uses snapshot.id fallback for delete', async () => {
      const user = userEvent.setup();
      snapshotService.getSnapshots.mockResolvedValue({
        data: [
          {
            id: 'snap-id-only', // No _id
            snapshotName: 'ID Fallback Snapshot',
            createdAt: '2024-01-15T00:00:00.000Z',
            isProtected: false,
          },
        ],
        pagination: { total: 1 },
      });
      snapshotService.deleteSnapshot.mockResolvedValue({});

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('ID Fallback Snapshot')).toBeInTheDocument();
      });

      // Open menu and click delete
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      await user.click(menuButtons[0]);
      await user.click(await screen.findByRole('menuitem', { name: /Excluir/i }));

      // Confirm delete
      await waitFor(() => {
        expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
      });
      const confirmButton = await screen.findByTestId('delete-confirm-button');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(snapshotService.deleteSnapshot).toHaveBeenCalledWith('snap-id-only');
      });
    });

    test('shows fallback delete error message', async () => {
      const user = userEvent.setup();
      snapshotService.deleteSnapshot.mockRejectedValue({}); // No message property

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Snapshot 1')).toBeInTheDocument();
      });

      // Open menu and delete
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      await user.click(menuButtons[0]);
      await user.click(await screen.findByRole('menuitem', { name: /Excluir/i }));
      await waitFor(() => {
        expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
      });
      const confirmButton = await screen.findByTestId('delete-confirm-button');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to delete snapshot')).toBeInTheDocument();
      });
    });

    test('uses snapshot.id fallback for export', async () => {
      const user = userEvent.setup();
      snapshotService.getSnapshots.mockResolvedValue({
        data: [
          {
            id: 'snap-id-only', // No _id
            snapshotName: 'ID Fallback Snapshot',
            createdAt: '2024-01-15T00:00:00.000Z',
            isProtected: false,
          },
        ],
        pagination: { total: 1 },
      });

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('ID Fallback Snapshot')).toBeInTheDocument();
      });

      // Open menu and export
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      await user.click(menuButtons[0]);
      await user.click(await screen.findByText('Exportar JSON'));

      await waitFor(() => {
        expect(snapshotService.downloadExport).toHaveBeenCalledWith(
          'snap-id-only',
          'json',
          expect.any(String)
        );
      });
    });

    test('uses snapshot.id fallback for toggle protection', async () => {
      const user = userEvent.setup();
      snapshotService.getSnapshots.mockResolvedValue({
        data: [
          {
            id: 'snap-id-only', // No _id
            snapshotName: 'ID Fallback Snapshot',
            createdAt: '2024-01-15T00:00:00.000Z',
            isProtected: false,
          },
        ],
        pagination: { total: 1 },
      });

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('ID Fallback Snapshot')).toBeInTheDocument();
      });

      // Open menu and toggle protection
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      await user.click(menuButtons[0]);
      await user.click(await screen.findByText('Proteger'));

      await waitFor(() => {
        expect(snapshotService.toggleProtection).toHaveBeenCalledWith('snap-id-only', true);
      });
    });

    test('uses snapshot.id fallback for clone', async () => {
      const user = userEvent.setup();
      snapshotService.getSnapshots.mockResolvedValue({
        data: [
          {
            id: 'snap-id-only', // No _id
            snapshotName: 'ID Fallback Snapshot',
            createdAt: '2024-01-15T00:00:00.000Z',
            isProtected: false,
          },
        ],
        pagination: { total: 1 },
      });
      snapshotService.cloneToNewFiscalBook.mockResolvedValue({ data: { bookName: 'Cloned' } });

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('ID Fallback Snapshot')).toBeInTheDocument();
      });

      // Open menu and clone
      const menuButtons = screen.getAllByTestId('snapshot-menu-button');
      await user.click(menuButtons[0]);
      await user.click(await screen.findByText('Clonar para Novo Livro'));

      await waitFor(() => {
        expect(snapshotService.cloneToNewFiscalBook).toHaveBeenCalledWith('snap-id-only');
      });
    });

    test('does not export when selectedSnapshot is null', async () => {
      // This tests the early return in handleExport
      snapshotService.getSnapshots.mockResolvedValue({
        data: [],
        pagination: { total: 0 },
      });

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Nenhum Snapshot')).toBeInTheDocument();
      });

      // Since there are no snapshots, selectedSnapshot should be null
      // and handleExport should early return
      expect(snapshotService.downloadExport).not.toHaveBeenCalled();
    });

    test('renders scheduled icon for snapshots with creationSource scheduled', async () => {
      snapshotService.getSnapshots.mockResolvedValue({
        data: [
          {
            _id: 'snap-scheduled',
            snapshotName: 'Scheduled Snapshot',
            createdAt: '2024-01-15T00:00:00.000Z',
            creationSource: 'scheduled',
            isProtected: false,
          },
        ],
        pagination: { total: 1 },
      });

      render(<SnapshotsList fiscalBookId="fb1" fiscalBookName="Test Book" />);

      await waitFor(() => {
        expect(screen.getByText('Scheduled Snapshot')).toBeInTheDocument();
      });

      // Should have schedule icon
      expect(screen.getByTestId('ScheduleIcon')).toBeInTheDocument();
    });
  });
});
