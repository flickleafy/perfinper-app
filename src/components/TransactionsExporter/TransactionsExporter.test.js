import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TransactionsExporter from './TransactionsExporter';
import fiscalBookService from '../../services/fiscalBookService';
import http from '../../infrastructure/http/http-common';
import { useToast } from '../../ui/ToastProvider.js';

// Mock services
jest.mock('../../services/fiscalBookService');
jest.mock('../../infrastructure/http/http-common');
jest.mock('../../ui/ToastProvider.js', () => ({
  useToast: jest.fn(),
}));

describe('TransactionsExporter', () => {
  const mockFiscalBooks = [
    { id: 'fb1', bookName: 'Book 1', bookPeriod: '2023' },
    { id: 'fb2', bookName: 'Book 2', bookPeriod: '2024' },
  ];
  const showToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useToast.mockReturnValue({ showToast });
    fiscalBookService.getAll.mockResolvedValue(mockFiscalBooks);
    // Mock window.open and URL.createObjectURL
    window.open = jest.fn();
    window.URL.createObjectURL = jest.fn();
    window.URL.revokeObjectURL = jest.fn();
    http.get.mockResolvedValue({ data: [] });
  });

  test('renders exporter and fetches fiscal books', async () => {
    render(<TransactionsExporter />);

    expect(screen.getByText('Exportar Transações')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });
  });

  test('disables export button when no fiscal book is selected', async () => {
    render(<TransactionsExporter />);

    await waitFor(() => expect(fiscalBookService.getAll).toHaveBeenCalled());

    const exportButton = screen.getByRole('button', { name: 'Exportar' });
    expect(exportButton).toHaveAttribute('aria-disabled', 'true');
  });

  test('exports specific fiscal book when selected', async () => {
    render(<TransactionsExporter />);

    await waitFor(() => expect(fiscalBookService.getAll).toHaveBeenCalled());

    // Enter file name
    const fileNameInput = screen.getByLabelText('Enter file name');
    fireEvent.change(fileNameInput, { target: { value: 'test-export' } });

    // Select Fiscal Book
    const fiscalBookSelect = screen.getByLabelText('Fiscal Book');
    fireEvent.mouseDown(fiscalBookSelect);
    const bookOption = screen.getByText('Book 1 (2023)');
    fireEvent.click(bookOption);

    const exportButton = screen.getByText('Exportar');
    expect(exportButton).not.toBeDisabled();
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(http.get).toHaveBeenCalledWith('/api/export/fiscal-book/fb1/json');
    });
  });

  test('shows validation messages when required fields are missing', async () => {
    render(<TransactionsExporter />);

    await waitFor(() => expect(fiscalBookService.getAll).toHaveBeenCalled());

    const exportButton = screen.getByRole('button', { name: 'Exportar' });
    exportButton.disabled = false;

    fireEvent.click(exportButton);
    expect(showToast).toHaveBeenCalledWith(
      'Please enter a file name to save the export',
      'error'
    );

    fireEvent.change(screen.getByLabelText('Enter file name'), {
      target: { value: 'file' },
    });
    exportButton.disabled = false;

    fireEvent.click(exportButton);
    expect(showToast).toHaveBeenCalledWith(
      'Please select a fiscal book to export',
      'error'
    );
  });

  test('renders a download link on success and revokes previous urls', async () => {
    window.URL.createObjectURL
      .mockReturnValueOnce('blob:first')
      .mockReturnValueOnce('blob:second');

    render(<TransactionsExporter />);

    await waitFor(() => expect(fiscalBookService.getAll).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('Enter file name'), {
      target: { value: 'export' },
    });
    fireEvent.mouseDown(screen.getByLabelText('Fiscal Book'));
    fireEvent.click(screen.getByText('Book 1 (2023)'));

    fireEvent.click(screen.getByRole('button', { name: 'Exportar' }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        'Exportacao pronta para download.',
        'success'
      );
    });

    expect(
      screen.getByRole('link', { name: 'Click here to download the file' })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Exportar' }));

    await waitFor(() => {
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:first');
    });
  });

  test('shows API error messages when export fails', async () => {
    http.get.mockRejectedValueOnce({
      response: { data: { message: 'Falha' } },
    });

    render(<TransactionsExporter />);

    await waitFor(() => expect(fiscalBookService.getAll).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('Enter file name'), {
      target: { value: 'export' },
    });
    fireEvent.mouseDown(screen.getByLabelText('Fiscal Book'));
    fireEvent.click(screen.getByText('Book 1 (2023)'));

    fireEvent.click(screen.getByRole('button', { name: 'Exportar' }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Falha', 'error');
    });

    expect(
      screen.queryByRole('link', { name: 'Click here to download the file' })
    ).not.toBeInTheDocument();
  });

  test('falls back to error.message when export fails without response message', async () => {
    http.get.mockRejectedValueOnce(new Error('Network down'));

    render(<TransactionsExporter />);

    await waitFor(() => expect(fiscalBookService.getAll).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('Enter file name'), {
      target: { value: 'export' },
    });
    fireEvent.mouseDown(screen.getByLabelText('Fiscal Book'));
    fireEvent.click(screen.getByText('Book 1 (2023)'));

    fireEvent.click(screen.getByRole('button', { name: 'Exportar' }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Network down', 'error');
    });
  });

  test('falls back to default error message when no details are available', async () => {
    http.get.mockRejectedValueOnce({});

    render(<TransactionsExporter />);

    await waitFor(() => expect(fiscalBookService.getAll).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('Enter file name'), {
      target: { value: 'export' },
    });
    fireEvent.mouseDown(screen.getByLabelText('Fiscal Book'));
    fireEvent.click(screen.getByText('Book 1 (2023)'));

    fireEvent.click(screen.getByRole('button', { name: 'Exportar' }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Falha ao exportar dados.', 'error');
    });
  });

  test('shows a toast when fiscal books fail to load', async () => {
    fiscalBookService.getAll.mockRejectedValueOnce(new Error('boom'));

    render(<TransactionsExporter />);

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        'Error fetching fiscal books:',
        'error'
      );
    });
  });
});
