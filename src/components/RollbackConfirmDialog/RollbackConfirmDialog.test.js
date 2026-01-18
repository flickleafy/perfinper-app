import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RollbackConfirmDialog from './RollbackConfirmDialog';
import snapshotService from '../../services/snapshotService';

jest.mock('../../services/snapshotService', () => ({
  __esModule: true,
  default: {
    rollbackToSnapshot: jest.fn(),
  },
}));

describe('RollbackConfirmDialog', () => {
  const mockSnapshot = {
    _id: 'snap1',
    id: 'snap1',
    snapshotName: 'Test Snapshot',
    statistics: {
      transactionCount: 10,
    },
  };

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    snapshot: mockSnapshot,
    fiscalBookName: 'Livro Teste',
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    snapshotService.rollbackToSnapshot.mockResolvedValue({ data: { success: true } });
  });

  // ===== Basic Rendering =====
  describe('Basic Rendering', () => {
    test('renders dialog with title and warning', () => {
      render(<RollbackConfirmDialog {...defaultProps} />);

      expect(screen.getByText(/Confirmar Rollback/)).toBeInTheDocument();
      expect(screen.getByText(/Ação Destrutiva/)).toBeInTheDocument();
    });

    test('shows snapshot name in warning message', () => {
      render(<RollbackConfirmDialog {...defaultProps} />);

      expect(screen.getByText(/Test Snapshot/)).toBeInTheDocument();
    });

    test('shows fiscal book name to confirm', () => {
      render(<RollbackConfirmDialog {...defaultProps} />);

      expect(screen.getByText('Livro Teste')).toBeInTheDocument();
    });

    test('shows transaction count that will be restored', () => {
      render(<RollbackConfirmDialog {...defaultProps} />);

      expect(screen.getByText(/10 transações do snapshot serão restauradas/)).toBeInTheDocument();
    });

    test('does not render when closed', () => {
      render(<RollbackConfirmDialog {...defaultProps} open={false} />);

      expect(screen.queryByText(/Confirmar Rollback/)).not.toBeInTheDocument();
    });
  });

  // ===== Confirmation Text Validation =====
  describe('Confirmation Text Validation', () => {
    test('rollback button is disabled when text does not match', () => {
      render(<RollbackConfirmDialog {...defaultProps} />);

      const rollbackButton = screen.getByRole('button', { name: /Executar Rollback/ });
      expect(rollbackButton).toBeDisabled();
    });

    test('shows error when partial text entered', async () => {
      const user = userEvent.setup();
      render(<RollbackConfirmDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText('Digite o nome do livro fiscal');
      await user.type(input, 'Livro');

      expect(screen.getByText('O nome não corresponde')).toBeInTheDocument();
    });

    test('enables rollback button when text matches exactly', async () => {
      const user = userEvent.setup();
      render(<RollbackConfirmDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText('Digite o nome do livro fiscal');
      await user.type(input, 'Livro Teste');

      const rollbackButton = screen.getByRole('button', { name: /Executar Rollback/ });
      expect(rollbackButton).not.toBeDisabled();
    });

    test('enables rollback button with case-insensitive match', async () => {
      const user = userEvent.setup();
      render(<RollbackConfirmDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText('Digite o nome do livro fiscal');
      await user.type(input, 'livro teste'); // lowercase

      const rollbackButton = screen.getByRole('button', { name: /Executar Rollback/ });
      expect(rollbackButton).not.toBeDisabled();
    });
  });

  // ===== Backup Checkbox =====
  describe('Backup Checkbox', () => {
    test('backup checkbox is checked by default', () => {
      render(<RollbackConfirmDialog {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    test('shows backup creation message when checked', () => {
      render(<RollbackConfirmDialog {...defaultProps} />);

      expect(screen.getByText(/Um snapshot de backup será criado automaticamente/)).toBeInTheDocument();
    });

    test('hides backup message when unchecked', async () => {
      const user = userEvent.setup();
      render(<RollbackConfirmDialog {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(screen.queryByText(/Um snapshot de backup será criado automaticamente/)).not.toBeInTheDocument();
    });
  });

  // ===== Rollback Action =====
  describe('Rollback Action', () => {
    test('calls rollback service on confirm', async () => {
      const user = userEvent.setup();
      render(<RollbackConfirmDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText('Digite o nome do livro fiscal');
      await user.type(input, 'Livro Teste');

      const rollbackButton = screen.getByRole('button', { name: /Executar Rollback/ });
      await user.click(rollbackButton);

      await waitFor(() => {
        expect(snapshotService.rollbackToSnapshot).toHaveBeenCalledWith('snap1', {
          createPreRollbackSnapshot: true,
        });
      });
    });

    test('passes createPreRollbackSnapshot false when unchecked', async () => {
      const user = userEvent.setup();
      render(<RollbackConfirmDialog {...defaultProps} />);

      // Uncheck backup
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // Type confirmation
      const input = screen.getByPlaceholderText('Digite o nome do livro fiscal');
      await user.type(input, 'Livro Teste');

      // Click rollback
      const rollbackButton = screen.getByRole('button', { name: /Executar Rollback/ });
      await user.click(rollbackButton);

      await waitFor(() => {
        expect(snapshotService.rollbackToSnapshot).toHaveBeenCalledWith('snap1', {
          createPreRollbackSnapshot: false,
        });
      });
    });

    test('calls onSuccess callback after successful rollback', async () => {
      const user = userEvent.setup();
      render(<RollbackConfirmDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText('Digite o nome do livro fiscal');
      await user.type(input, 'Livro Teste');

      const rollbackButton = screen.getByRole('button', { name: /Executar Rollback/ });
      await user.click(rollbackButton);

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalledWith({ success: true });
      });
    });

    test('calls onClose after successful rollback', async () => {
      const user = userEvent.setup();
      render(<RollbackConfirmDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText('Digite o nome do livro fiscal');
      await user.type(input, 'Livro Teste');

      const rollbackButton = screen.getByRole('button', { name: /Executar Rollback/ });
      await user.click(rollbackButton);

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });
  });

  // ===== Loading State =====
  describe('Loading State', () => {
    test('shows loading indicator during rollback', async () => {
      const user = userEvent.setup();
      snapshotService.rollbackToSnapshot.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<RollbackConfirmDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText('Digite o nome do livro fiscal');
      await user.type(input, 'Livro Teste');

      const rollbackButton = screen.getByRole('button', { name: /Executar Rollback/ });
      await user.click(rollbackButton);

      await waitFor(() => {
        expect(screen.getByText('Executando Rollback...')).toBeInTheDocument();
      });
    });

    test('disables input during loading', async () => {
      const user = userEvent.setup();
      snapshotService.rollbackToSnapshot.mockImplementation(
        () => new Promise(() => {})
      );

      render(<RollbackConfirmDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText('Digite o nome do livro fiscal');
      await user.type(input, 'Livro Teste');

      const rollbackButton = screen.getByRole('button', { name: /Executar Rollback/ });
      await user.click(rollbackButton);

      await waitFor(() => {
        expect(input).toBeDisabled();
      });
    });

    test('cannot close dialog during loading', async () => {
      const user = userEvent.setup();
      snapshotService.rollbackToSnapshot.mockImplementation(
        () => new Promise(() => {})
      );

      render(<RollbackConfirmDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText('Digite o nome do livro fiscal');
      await user.type(input, 'Livro Teste');

      const rollbackButton = screen.getByRole('button', { name: /Executar Rollback/ });
      await user.click(rollbackButton);

      // Loading - cancel should be disabled
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
      });
    });
  });

  // ===== Error Handling =====
  describe('Error Handling', () => {
    test('displays error message on rollback failure', async () => {
      const user = userEvent.setup();
      snapshotService.rollbackToSnapshot.mockRejectedValue(new Error('Rollback failed'));

      render(<RollbackConfirmDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText('Digite o nome do livro fiscal');
      await user.type(input, 'Livro Teste');

      const rollbackButton = screen.getByRole('button', { name: /Executar Rollback/ });
      await user.click(rollbackButton);

      await waitFor(() => {
        expect(screen.getByText('Rollback failed')).toBeInTheDocument();
      });
    });

    test('does not call onSuccess on failure', async () => {
      const user = userEvent.setup();
      snapshotService.rollbackToSnapshot.mockRejectedValue(new Error('Rollback failed'));

      render(<RollbackConfirmDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText('Digite o nome do livro fiscal');
      await user.type(input, 'Livro Teste');

      const rollbackButton = screen.getByRole('button', { name: /Executar Rollback/ });
      await user.click(rollbackButton);

      await waitFor(() => {
        expect(screen.getByText('Rollback failed')).toBeInTheDocument();
      });

      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    });

    test('shows fallback error message when no message provided', async () => {
      const user = userEvent.setup();
      snapshotService.rollbackToSnapshot.mockRejectedValue({});

      render(<RollbackConfirmDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText('Digite o nome do livro fiscal');
      await user.type(input, 'Livro Teste');

      const rollbackButton = screen.getByRole('button', { name: /Executar Rollback/ });
      await user.click(rollbackButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to rollback to snapshot')).toBeInTheDocument();
      });
    });

    test('can dismiss error alert', async () => {
      const user = userEvent.setup();
      snapshotService.rollbackToSnapshot.mockRejectedValue(new Error('Rollback failed'));

      render(<RollbackConfirmDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText('Digite o nome do livro fiscal');
      await user.type(input, 'Livro Teste');

      const rollbackButton = screen.getByRole('button', { name: /Executar Rollback/ });
      await user.click(rollbackButton);

      await waitFor(() => {
        expect(screen.getByText('Rollback failed')).toBeInTheDocument();
      });

      // Click close button on error alert
      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);

      expect(screen.queryByText('Rollback failed')).not.toBeInTheDocument();
    });
  });

  // ===== Cancel Action =====
  describe('Cancel Action', () => {
    test('calls onClose when cancel button clicked', async () => {
      const user = userEvent.setup();
      render(<RollbackConfirmDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  // ===== Edge Cases =====
  describe('Edge Cases', () => {
    test('handles missing snapshot gracefully', () => {
      render(<RollbackConfirmDialog {...defaultProps} snapshot={null} />);

      expect(screen.getByText(/Confirmar Rollback/)).toBeInTheDocument();
    });

    test('handles missing statistics gracefully', () => {
      const snapshotNoStats = { ...mockSnapshot, statistics: undefined };
      render(<RollbackConfirmDialog {...defaultProps} snapshot={snapshotNoStats} />);

      expect(screen.getByText(/0 transações do snapshot serão restauradas/)).toBeInTheDocument();
    });

    test('handles API response with data wrapper', async () => {
      const user = userEvent.setup();
      snapshotService.rollbackToSnapshot.mockResolvedValue({ data: { restored: true } });

      render(<RollbackConfirmDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText('Digite o nome do livro fiscal');
      await user.type(input, 'Livro Teste');

      await user.click(screen.getByRole('button', { name: /Executar Rollback/ }));

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalledWith({ restored: true });
      });
    });

    test('handles API response without data wrapper', async () => {
      const user = userEvent.setup();
      snapshotService.rollbackToSnapshot.mockResolvedValue({ restored: true });

      render(<RollbackConfirmDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText('Digite o nome do livro fiscal');
      await user.type(input, 'Livro Teste');

      await user.click(screen.getByRole('button', { name: /Executar Rollback/ }));

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalledWith({ restored: true });
      });
    });

    test('does not rollback when snapshot is null', async () => {
      const user = userEvent.setup();
      render(<RollbackConfirmDialog {...defaultProps} snapshot={null} />);

      const input = screen.getByPlaceholderText('Digite o nome do livro fiscal');
      await user.type(input, 'Livro Teste');

      const rollbackButton = screen.getByRole('button', { name: /Executar Rollback/ });
      await user.click(rollbackButton);

      // Rollback service should not be called when snapshot is null
      expect(snapshotService.rollbackToSnapshot).not.toHaveBeenCalled();
    });

    test('works without onSuccess callback', async () => {
      const user = userEvent.setup();
      render(<RollbackConfirmDialog {...defaultProps} onSuccess={null} />);

      const input = screen.getByPlaceholderText('Digite o nome do livro fiscal');
      await user.type(input, 'Livro Teste');

      await user.click(screen.getByRole('button', { name: /Executar Rollback/ }));

      await waitFor(() => {
        expect(snapshotService.rollbackToSnapshot).toHaveBeenCalled();
      });

      // Should close dialog without crashing
      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });
  });
});
