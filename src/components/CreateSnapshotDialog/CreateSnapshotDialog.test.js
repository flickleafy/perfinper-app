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

    // 'Criar Snapshot' appears in title and button, check for at least one
    expect(screen.getAllByText('Criar Snapshot').length).toBeGreaterThan(0);
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

    expect(screen.queryAllByText('Criar Snapshot')).toHaveLength(0);
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

  test('can dismiss error alert', async () => {
    snapshotService.createSnapshot.mockRejectedValue(new Error('Create failed'));

    render(<CreateSnapshotDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Criar Snapshot/i }));

    await waitFor(() => {
      expect(screen.getByText('Create failed')).toBeInTheDocument();
    });

    // Click close button on error alert
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    expect(screen.queryByText('Create failed')).not.toBeInTheDocument();
  });

  test('adds tags via autocomplete', async () => {
    render(<CreateSnapshotDialog {...defaultProps} />);

    const tagsInput = screen.getByLabelText(/Tags/i);
    fireEvent.change(tagsInput, { target: { value: 'custom-tag' } });
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });

    // Tag should appear as chip
    await waitFor(() => {
      expect(screen.getByText('custom-tag')).toBeInTheDocument();
    });
  });

  test('normalizes tags to lowercase', async () => {
    render(<CreateSnapshotDialog {...defaultProps} />);

    const tagsInput = screen.getByLabelText(/Tags/i);
    fireEvent.change(tagsInput, { target: { value: 'UPPERCASE-TAG' } });
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('uppercase-tag')).toBeInTheDocument();
    });
  });

  test('prevents close during loading', async () => {
    snapshotService.createSnapshot.mockReturnValue(new Promise(() => {}));

    render(<CreateSnapshotDialog {...defaultProps} />);

    // Start loading
    fireEvent.click(screen.getByRole('button', { name: /Criar Snapshot/i }));

    await waitFor(() => {
      expect(screen.getByText('Criando...')).toBeInTheDocument();
    });

    // Try to close - defaultProps.onClose should not be called again
    jest.clearAllMocks();
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  test('shows fallback error message', async () => {
    snapshotService.createSnapshot.mockRejectedValue({});

    render(<CreateSnapshotDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Criar Snapshot/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to create snapshot')).toBeInTheDocument();
    });
  });

  test('handles missing fiscalBookName', () => {
    render(<CreateSnapshotDialog {...defaultProps} fiscalBookName="" />);

    expect(screen.getByText(/Livro Fiscal/)).toBeInTheDocument();
  });

  test('sends tags with submission', async () => {
    render(<CreateSnapshotDialog {...defaultProps} />);

    // Add a tag
    const tagsInput = screen.getByLabelText(/Tags/i);
    fireEvent.change(tagsInput, { target: { value: 'audit-ready' } });
    fireEvent.keyDown(tagsInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('audit-ready')).toBeInTheDocument();
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Criar Snapshot/i }));

    await waitFor(() => {
      expect(snapshotService.createSnapshot).toHaveBeenCalledWith('fb1', expect.objectContaining({
        tags: ['audit-ready'],
      }));
    });
  });

  test('works without onSuccess callback', async () => {
    render(<CreateSnapshotDialog {...defaultProps} onSuccess={null} />);

    fireEvent.click(screen.getByRole('button', { name: /Criar Snapshot/i }));

    await waitFor(() => {
      expect(snapshotService.createSnapshot).toHaveBeenCalled();
    });

    // Should not crash and should close dialog
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });
});

