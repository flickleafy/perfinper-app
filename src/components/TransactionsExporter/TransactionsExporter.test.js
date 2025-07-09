import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TransactionsExporter from './TransactionsExporter';
import fiscalBookService from '../../services/fiscalBookService';
import http from '../../infrastructure/http/http-common';

// Mock services
jest.mock('../../services/fiscalBookService');
jest.mock('../../infrastructure/http/http-common');

describe('TransactionsExporter', () => {
  const mockFiscalBooks = [
    { id: 'fb1', bookName: 'Book 1', bookPeriod: '2023' },
    { id: 'fb2', bookName: 'Book 2', bookPeriod: '2024' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
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
});
