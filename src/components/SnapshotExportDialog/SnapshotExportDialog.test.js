import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SnapshotExportDialog from './SnapshotExportDialog';
import snapshotService from '../../services/snapshotService';

jest.mock('../../services/snapshotService', () => ({
  __esModule: true,
  default: {
    downloadExport: jest.fn(),
  },
}));

describe('SnapshotExportDialog', () => {
  const mockSnapshot = {
    _id: 'snap1',
    id: 'snap1',
    snapshotName: 'Test Snapshot',
    statistics: {
      transactionCount: 50,
    },
  };

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    snapshot: mockSnapshot,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    snapshotService.downloadExport.mockResolvedValue({});
  });

  // ===== Basic Rendering =====
  describe('Basic Rendering', () => {
    test('renders dialog title', () => {
      render(<SnapshotExportDialog {...defaultProps} />);
      expect(screen.getByText('Exportar Snapshot')).toBeInTheDocument();
    });

    test('renders snapshot information', () => {
      render(<SnapshotExportDialog {...defaultProps} />);
      expect(screen.getByText('Test Snapshot')).toBeInTheDocument();
      expect(screen.getByText(/50 transações/)).toBeInTheDocument();
    });

    test('renders format options', () => {
      render(<SnapshotExportDialog {...defaultProps} />);
      expect(screen.getByText('JSON')).toBeInTheDocument();
      expect(screen.getByText('CSV')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });

    test('renders export and cancel buttons', () => {
      render(<SnapshotExportDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Exportar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    });

    test('defaults to JSON format', () => {
      render(<SnapshotExportDialog {...defaultProps} />);
      const jsonRadio = screen.getByLabelText((content, element) => {
        return element.tagName.toLowerCase() === 'input' && element.value === 'json';
      });
      expect(jsonRadio).toBeChecked();
    });

    test('disables PDF option (in development)', () => {
      render(<SnapshotExportDialog {...defaultProps} />);
      const pdfRadio = screen.getByLabelText((content, element) => {
        return element.tagName.toLowerCase() === 'input' && element.value === 'pdf';
      });
      expect(pdfRadio).toBeDisabled();
    });
  });

  // ===== Interaction =====
  describe('Interaction', () => {
    test('can change format to CSV', async () => {
      const user = userEvent.setup();
      render(<SnapshotExportDialog {...defaultProps} />);

      const csvOption = screen.getByText('CSV');
      await user.click(csvOption);

      const csvRadio = screen.getByLabelText((content, element) => {
        return element.tagName.toLowerCase() === 'input' && element.value === 'csv';
      });
      expect(csvRadio).toBeChecked();
    });

    test('calls export service with correct parameters', async () => {
      const user = userEvent.setup();
      render(<SnapshotExportDialog {...defaultProps} />);

      // Select CSV
      const csvOption = screen.getByText('CSV');
      await user.click(csvOption);

      // Click Export
      const exportButton = screen.getByRole('button', { name: 'Exportar' });
      await user.click(exportButton);

      await waitFor(() => {
        expect(snapshotService.downloadExport).toHaveBeenCalledWith(
          'snap1',
          'csv',
          expect.stringMatching(/snapshot-Test Snapshot-.*\.csv/)
        );
      });
    });

    test('closes dialog after successful export', async () => {
      const user = userEvent.setup();
      render(<SnapshotExportDialog {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: 'Exportar' });
      await user.click(exportButton);

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });

    test('cancel button closes dialog', async () => {
      const user = userEvent.setup();
      render(<SnapshotExportDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  // ===== Loading State =====
  describe('Loading State', () => {
    test('shows loading indicator and disables buttons during export', async () => {
      const user = userEvent.setup();
      snapshotService.downloadExport.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<SnapshotExportDialog {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: 'Exportar' });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Exportando...')).toBeInTheDocument();
      });

      expect(exportButton).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    });
  });

  // ===== Error Handling =====
  describe('Error Handling', () => {
    test('displays error message on export failure', async () => {
      const user = userEvent.setup();
      snapshotService.downloadExport.mockRejectedValue(new Error('Network error'));

      render(<SnapshotExportDialog {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: 'Exportar' });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    test('shows fallback error message', async () => {
      const user = userEvent.setup();
      snapshotService.downloadExport.mockRejectedValue({});

      render(<SnapshotExportDialog {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: 'Exportar' });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to export snapshot')).toBeInTheDocument();
      });
    });

    test('can dismiss error alert', async () => {
      const user = userEvent.setup();
      snapshotService.downloadExport.mockRejectedValue(new Error('Network error'));

      render(<SnapshotExportDialog {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: 'Exportar' });
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      // Click close button on error alert
      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);

      expect(screen.queryByText('Network error')).not.toBeInTheDocument();
    });
  });

  // ===== Edge Cases =====
  describe('Edge Cases', () => {
    test('handles missing snapshot prop', () => {
      render(<SnapshotExportDialog {...defaultProps} snapshot={null} />);

      expect(screen.getByText('Exportar Snapshot')).toBeInTheDocument();
      // Should handle null snapshot gracefully (e.g., render generic text)
      expect(screen.getByRole('alert')).toHaveTextContent('Exportando: Snapshot');
    });

    test('handles missing statistics', () => {
      const snapshotNoStats = { ...mockSnapshot, statistics: undefined };
      render(<SnapshotExportDialog {...defaultProps} snapshot={snapshotNoStats} />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Exportando: Test Snapshot');
      // Should NOT contain the transaction count part
      expect(alert).not.toHaveTextContent(/transações/);
    });

    test('does not export if snapshot is missing', async () => {
      const user = userEvent.setup();
      render(<SnapshotExportDialog {...defaultProps} snapshot={null} />);

      const exportButton = screen.getByRole('button', { name: 'Exportar' });
      await user.click(exportButton);

      expect(snapshotService.downloadExport).not.toHaveBeenCalled();
    });

    test('uses snapshot.id when _id is not present', async () => {
      const user = userEvent.setup();
      const snapshotWithIdOnly = {
        id: 'snap-id-only',
        snapshotName: 'ID Only Snapshot',
      };

      render(<SnapshotExportDialog {...defaultProps} snapshot={snapshotWithIdOnly} />);

      const exportButton = screen.getByRole('button', { name: 'Exportar' });
      await user.click(exportButton);

      await waitFor(() => {
        expect(snapshotService.downloadExport).toHaveBeenCalledWith(
          'snap-id-only',
          'json',
          expect.stringMatching(/snapshot-ID Only Snapshot-.*\.json/)
        );
      });
    });

    test('uses fallback filename when snapshotName is missing', async () => {
      const user = userEvent.setup();
      const snapshotWithoutName = {
        _id: 'snap-no-name',
      };

      render(<SnapshotExportDialog {...defaultProps} snapshot={snapshotWithoutName} />);

      const exportButton = screen.getByRole('button', { name: 'Exportar' });
      await user.click(exportButton);

      await waitFor(() => {
        expect(snapshotService.downloadExport).toHaveBeenCalledWith(
          'snap-no-name',
          'json',
          expect.stringMatching(/snapshot-export-.*\.json/)
        );
      });
    });

    test('changes format via radio button click', async () => {
      const user = userEvent.setup();
      render(<SnapshotExportDialog {...defaultProps} />);

      // Find the CSV radio input and click it directly
      const csvRadio = screen.getByLabelText((content, element) => {
        return element.tagName.toLowerCase() === 'input' && element.value === 'csv';
      });

      await user.click(csvRadio);

      await waitFor(() => {
        expect(csvRadio).toBeChecked();
      });
    });
  });
});
