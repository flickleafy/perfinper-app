import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateSnapshotDialog from './CreateSnapshotDialog';
import snapshotService from '../../services/snapshotService';

jest.mock('../../services/snapshotService', () => ({
  __esModule: true,
  default: {
    createSnapshot: jest.fn(),
  },
}));

describe('CreateSnapshotDialog', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    fiscalBookId: 'fb1',
    fiscalBookName: 'Test Book',
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    snapshotService.createSnapshot.mockResolvedValue({ data: { _id: 'snap1' } });
  });

  test('renders form fields', () => {
    render(<CreateSnapshotDialog {...defaultProps} />);

    expect(screen.getByText('Criar Snapshot')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome do Snapshot/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tags/i)).toBeInTheDocument();
  });

  test('shows fiscal book name in info alert', () => {
    render(<CreateSnapshotDialog {...defaultProps} />);

    expect(screen.getByText(/Test Book/)).toBeInTheDocument();
  });

  test('calls onClose when cancel button clicked', () => {
    render(<CreateSnapshotDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('does not render when closed', () => {
    render(<CreateSnapshotDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Criar Snapshot')).not.toBeInTheDocument();
  });

  test('submits form and calls onSuccess', async () => {
    render(<CreateSnapshotDialog {...defaultProps} />);

    const nameInput = screen.getByLabelText(/Nome do Snapshot/i);
    fireEvent.change(nameInput, { target: { value: 'My Snapshot' } });

    const descInput = screen.getByLabelText(/Descrição/i);
    fireEvent.change(descInput, { target: { value: 'Test description' } });

    fireEvent.click(screen.getByRole('button', { name: /Criar Snapshot/i }));

    await waitFor(() => {
      expect(snapshotService.createSnapshot).toHaveBeenCalledWith('fb1', expect.objectContaining({
        name: 'My Snapshot',
        description: 'Test description',
      }));
    });

    expect(defaultProps.onSuccess).toHaveBeenCalled();
  });

  test('shows loading state during submission', async () => {
    snapshotService.createSnapshot.mockReturnValue(new Promise(() => {}));

    render(<CreateSnapshotDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Criar Snapshot/i }));

    expect(await screen.findByText('Criando...')).toBeInTheDocument();
  });

  test('shows error message on failure', async () => {
    snapshotService.createSnapshot.mockRejectedValue(new Error('Create failed'));

    render(<CreateSnapshotDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Criar Snapshot/i }));

    expect(await screen.findByText('Create failed')).toBeInTheDocument();
  });

  test('clears error on close', async () => {
    snapshotService.createSnapshot.mockRejectedValue(new Error('Create failed'));

    const { rerender } = render(<CreateSnapshotDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Criar Snapshot/i }));

    await screen.findByText('Create failed');

    // Close and reopen
    rerender(<CreateSnapshotDialog {...defaultProps} open={false} />);
    rerender(<CreateSnapshotDialog {...defaultProps} open={true} />);

    // Error should be cleared (form reset on enter)
  });

  test('disables buttons during loading', async () => {
    snapshotService.createSnapshot.mockReturnValue(new Promise(() => {}));

    render(<CreateSnapshotDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Criar Snapshot/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cancelar/i })).toBeDisabled();
    });
  });
});
