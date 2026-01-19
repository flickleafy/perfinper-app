import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SnapshotAnnotations from './SnapshotAnnotations';
import snapshotService from '../../services/snapshotService';

jest.mock('../../services/snapshotService', () => ({
  __esModule: true,
  default: {
    addSnapshotAnnotation: jest.fn(),
  },
}));

describe('SnapshotAnnotations', () => {
  const mockSnapshot = {
    _id: 'snap1',
    id: 'snap1',
    snapshotName: 'Test Snapshot',
    annotations: [
      {
        content: 'First annotation',
        createdBy: 'user@example.com',
        createdAt: '2024-01-15T10:30:00.000Z',
      },
      {
        content: 'Second annotation with more details',
        createdBy: 'admin@example.com',
        createdAt: '2024-01-16T14:45:00.000Z',
      },
    ],
  };

  const defaultProps = {
    snapshot: mockSnapshot,
    onAnnotationAdded: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    snapshotService.addSnapshotAnnotation.mockResolvedValue({});
  });

  // ===== Basic Rendering =====
  describe('Basic Rendering', () => {
    test('renders header with annotation count', () => {
      render(<SnapshotAnnotations {...defaultProps} />);

      expect(screen.getByText('Anotações')).toBeInTheDocument();
      expect(screen.getByText('(2)')).toBeInTheDocument();
    });

    test('renders add annotation input', () => {
      render(<SnapshotAnnotations {...defaultProps} />);

      expect(screen.getByPlaceholderText('Adicionar uma anotação...')).toBeInTheDocument();
    });

    test('renders add button', () => {
      render(<SnapshotAnnotations {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Adicionar/ })).toBeInTheDocument();
    });

    test('displays existing annotations', () => {
      render(<SnapshotAnnotations {...defaultProps} />);

      expect(screen.getByText('First annotation')).toBeInTheDocument();
      expect(screen.getByText('Second annotation with more details')).toBeInTheDocument();
    });

    test('displays annotation authors', () => {
      render(<SnapshotAnnotations {...defaultProps} />);

      expect(screen.getByText('user@example.com')).toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });
  });

  // ===== Empty State =====
  describe('Empty State', () => {
    test('shows empty message when no annotations', () => {
      const emptySnapshot = { ...mockSnapshot, annotations: [] };
      render(<SnapshotAnnotations snapshot={emptySnapshot} />);

      expect(screen.getByText('Nenhuma anotação ainda.')).toBeInTheDocument();
      expect(screen.getByText(/Adicione anotações para documentar/)).toBeInTheDocument();
    });

    test('shows count of zero for empty annotations', () => {
      const emptySnapshot = { ...mockSnapshot, annotations: [] };
      render(<SnapshotAnnotations snapshot={emptySnapshot} />);

      expect(screen.getByText('(0)')).toBeInTheDocument();
    });

    test('handles missing annotations array', () => {
      const noAnnotationsSnapshot = { ...mockSnapshot, annotations: undefined };
      render(<SnapshotAnnotations snapshot={noAnnotationsSnapshot} />);

      expect(screen.getByText('(0)')).toBeInTheDocument();
      expect(screen.getByText('Nenhuma anotação ainda.')).toBeInTheDocument();
    });
  });

  // ===== Add Annotation =====
  describe('Add Annotation', () => {
    test('add button is disabled when input is empty', () => {
      render(<SnapshotAnnotations {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /Adicionar/ });
      expect(addButton).toBeDisabled();
    });

    test('add button is disabled when input is only whitespace', async () => {
      const user = userEvent.setup();
      render(<SnapshotAnnotations {...defaultProps} />);

      const input = screen.getByPlaceholderText('Adicionar uma anotação...');
      await user.type(input, '   ');

      const addButton = screen.getByRole('button', { name: /Adicionar/ });
      expect(addButton).toBeDisabled();
    });

    test('add button is enabled when text is entered', async () => {
      const user = userEvent.setup();
      render(<SnapshotAnnotations {...defaultProps} />);

      const input = screen.getByPlaceholderText('Adicionar uma anotação...');
      await user.type(input, 'New annotation');

      const addButton = screen.getByRole('button', { name: /Adicionar/ });
      expect(addButton).not.toBeDisabled();
    });

    test('calls service with correct parameters', async () => {
      const user = userEvent.setup();
      render(<SnapshotAnnotations {...defaultProps} />);

      const input = screen.getByPlaceholderText('Adicionar uma anotação...');
      await user.type(input, 'Test annotation text');

      const addButton = screen.getByRole('button', { name: /Adicionar/ });
      await user.click(addButton);

      await waitFor(() => {
        expect(snapshotService.addSnapshotAnnotation).toHaveBeenCalledWith('snap1', 'Test annotation text');
      });
    });

    test('trims whitespace from annotation text', async () => {
      const user = userEvent.setup();
      render(<SnapshotAnnotations {...defaultProps} />);

      const input = screen.getByPlaceholderText('Adicionar uma anotação...');
      await user.type(input, '  Trimmed text  ');

      const addButton = screen.getByRole('button', { name: /Adicionar/ });
      await user.click(addButton);

      await waitFor(() => {
        expect(snapshotService.addSnapshotAnnotation).toHaveBeenCalledWith('snap1', 'Trimmed text');
      });
    });

    test('clears input after successful add', async () => {
      const user = userEvent.setup();
      render(<SnapshotAnnotations {...defaultProps} />);

      const input = screen.getByPlaceholderText('Adicionar uma anotação...');
      await user.type(input, 'New annotation');

      const addButton = screen.getByRole('button', { name: /Adicionar/ });
      await user.click(addButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    test('calls onAnnotationAdded callback after success', async () => {
      const user = userEvent.setup();
      render(<SnapshotAnnotations {...defaultProps} />);

      const input = screen.getByPlaceholderText('Adicionar uma anotação...');
      await user.type(input, 'New annotation');

      const addButton = screen.getByRole('button', { name: /Adicionar/ });
      await user.click(addButton);

      await waitFor(() => {
        expect(defaultProps.onAnnotationAdded).toHaveBeenCalled();
      });
    });
  });

  // ===== Keyboard Shortcut =====
  describe('Keyboard Shortcut', () => {
    test('submits on Ctrl+Enter', async () => {
      const user = userEvent.setup();
      render(<SnapshotAnnotations {...defaultProps} />);

      const input = screen.getByPlaceholderText('Adicionar uma anotação...');
      await user.type(input, 'Keyboard shortcut test');
      // Use fireEvent.keyPress to simulate the specific event handler
      fireEvent.keyPress(input, { key: 'Enter', charCode: 13, ctrlKey: true });

      await waitFor(() => {
        expect(snapshotService.addSnapshotAnnotation).toHaveBeenCalled();
      });
    });

    test('shows keyboard hint', () => {
      render(<SnapshotAnnotations {...defaultProps} />);

      expect(screen.getByText('Ctrl+Enter para salvar')).toBeInTheDocument();
    });
  });

  // ===== Loading State =====
  describe('Loading State', () => {
    test('shows loading indicator while saving', async () => {
      const user = userEvent.setup();
      snapshotService.addSnapshotAnnotation.mockImplementation(
        () => new Promise(() => {})
      );

      render(<SnapshotAnnotations {...defaultProps} />);

      const input = screen.getByPlaceholderText('Adicionar uma anotação...');
      await user.type(input, 'Loading test');

      const addButton = screen.getByRole('button', { name: /Adicionar/ });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Salvando...')).toBeInTheDocument();
      });
    });

    test('disables input while saving', async () => {
      const user = userEvent.setup();
      snapshotService.addSnapshotAnnotation.mockImplementation(
        () => new Promise(() => {})
      );

      render(<SnapshotAnnotations {...defaultProps} />);

      const input = screen.getByPlaceholderText('Adicionar uma anotação...');
      await user.type(input, 'Loading test');

      const addButton = screen.getByRole('button', { name: /Adicionar/ });
      await user.click(addButton);

      await waitFor(() => {
        expect(input).toBeDisabled();
      });
    });
  });

  // ===== Error Handling =====
  describe('Error Handling', () => {
    test('displays error message on failure', async () => {
      const user = userEvent.setup();
      snapshotService.addSnapshotAnnotation.mockRejectedValue(new Error('Save failed'));

      render(<SnapshotAnnotations {...defaultProps} />);

      const input = screen.getByPlaceholderText('Adicionar uma anotação...');
      await user.type(input, 'Error test');

      const addButton = screen.getByRole('button', { name: /Adicionar/ });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Save failed')).toBeInTheDocument();
      });
    });

    test('shows fallback error message', async () => {
      const user = userEvent.setup();
      snapshotService.addSnapshotAnnotation.mockRejectedValue({});

      render(<SnapshotAnnotations {...defaultProps} />);

      const input = screen.getByPlaceholderText('Adicionar uma anotação...');
      await user.type(input, 'Error test');

      const addButton = screen.getByRole('button', { name: /Adicionar/ });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to add annotation')).toBeInTheDocument();
      });
    });

    test('does not clear input on error', async () => {
      const user = userEvent.setup();
      snapshotService.addSnapshotAnnotation.mockRejectedValue(new Error('Save failed'));

      render(<SnapshotAnnotations {...defaultProps} />);

      const input = screen.getByPlaceholderText('Adicionar uma anotação...');
      await user.type(input, 'Error test');

      const addButton = screen.getByRole('button', { name: /Adicionar/ });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Save failed')).toBeInTheDocument();
      });

      // Input should still have text
      expect(input).toHaveValue('Error test');
    });

    test('can dismiss error alert', async () => {
      const user = userEvent.setup();
      snapshotService.addSnapshotAnnotation.mockRejectedValue(new Error('Save failed'));

      render(<SnapshotAnnotations {...defaultProps} />);

      const input = screen.getByPlaceholderText('Adicionar uma anotação...');
      await user.type(input, 'Error test');

      const addButton = screen.getByRole('button', { name: /Adicionar/ });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Save failed')).toBeInTheDocument();
      });

      // Click close button on error alert
      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);

      expect(screen.queryByText('Save failed')).not.toBeInTheDocument();
    });
  });

  // ===== Edge Cases =====
  describe('Edge Cases', () => {
    test('handles null snapshot', () => {
      render(<SnapshotAnnotations snapshot={null} />);

      expect(screen.getByText('Anotações')).toBeInTheDocument();
      expect(screen.getByText('(0)')).toBeInTheDocument();
    });

    test('does not submit when snapshot is null', async () => {
      const user = userEvent.setup();
      render(<SnapshotAnnotations snapshot={null} />);

      const input = screen.getByPlaceholderText('Adicionar uma anotação...');
      await user.type(input, 'Test');

      const addButton = screen.getByRole('button', { name: /Adicionar/ });
      await user.click(addButton);

      expect(snapshotService.addSnapshotAnnotation).not.toHaveBeenCalled();
    });

    test('uses snapshot.id when _id is not present', async () => {
      const user = userEvent.setup();
      const snapshotWithIdOnly = {
        id: 'snap-id-only',
        annotations: [],
      };

      render(<SnapshotAnnotations snapshot={snapshotWithIdOnly} onAnnotationAdded={jest.fn()} />);

      const input = screen.getByPlaceholderText('Adicionar uma anotação...');
      await user.type(input, 'Test annotation');

      const addButton = screen.getByRole('button', { name: /Adicionar/ });
      await user.click(addButton);

      await waitFor(() => {
        expect(snapshotService.addSnapshotAnnotation).toHaveBeenCalledWith('snap-id-only', 'Test annotation');
      });
    });

    test('works without onAnnotationAdded callback', async () => {
      const user = userEvent.setup();
      render(<SnapshotAnnotations snapshot={mockSnapshot} />);

      const input = screen.getByPlaceholderText('Adicionar uma anotação...');
      await user.type(input, 'Test annotation');

      const addButton = screen.getByRole('button', { name: /Adicionar/ });
      await user.click(addButton);

      await waitFor(() => {
        expect(snapshotService.addSnapshotAnnotation).toHaveBeenCalled();
      });

      // Input should still be cleared
      expect(input).toHaveValue('');
    });

    test('displays fallback "Usuário" when createdBy is missing', () => {
      const snapshotWithMissingCreatedBy = {
        ...mockSnapshot,
        annotations: [
          {
            content: 'Annotation without author',
            createdBy: null,
            createdAt: '2024-01-15T10:30:00.000Z',
          },
          {
            content: 'Another annotation without author',
            createdBy: undefined,
            createdAt: '2024-01-16T14:45:00.000Z',
          },
          {
            content: 'Empty string author',
            createdBy: '',
            createdAt: '2024-01-17T09:00:00.000Z',
          },
        ],
      };

      render(<SnapshotAnnotations snapshot={snapshotWithMissingCreatedBy} />);

      // Should show 'Usuário' for all annotations without createdBy
      const usuarioElements = screen.getAllByText('Usuário');
      expect(usuarioElements.length).toBe(3);
    });

    test('handles annotation with missing createdAt date', () => {
      const snapshotWithMissingDate = {
        ...mockSnapshot,
        annotations: [
          {
            content: 'Annotation without date',
            createdBy: 'test@user.com',
            createdAt: null,
          },
          {
            content: 'Another without date',
            createdBy: 'another@user.com',
            createdAt: undefined,
          },
        ],
      };

      render(<SnapshotAnnotations snapshot={snapshotWithMissingDate} />);

      // Should render without errors
      expect(screen.getByText('Annotation without date')).toBeInTheDocument();
      expect(screen.getByText('Another without date')).toBeInTheDocument();
    });
  });
});
