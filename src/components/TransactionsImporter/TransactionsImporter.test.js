import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionsImporter from './TransactionsImporter';
import fiscalBookService from '../../services/fiscalBookService';
import * as importService from '../../services/importService';

// Mock services
jest.mock('../../services/fiscalBookService');
jest.mock('../../services/importService');
jest.mock('../../infrastructure/fileFormat/csvToJson', () => ({
  csvToJson: jest.fn().mockReturnValue([{ id: 1, description: 'Test' }]),
}));
jest.mock('../../infrastructure/object/convertObjectToArray', () => ({
  convertObjectToArray: jest.fn().mockReturnValue([{ id: 1, description: 'Test' }]),
}));

describe('TransactionsImporter', () => {
  const mockFiscalBooks = [
    { id: 'fb1', bookName: 'Book 1', bookPeriod: '2023', status: 'Aberto' },
    { id: 'fb2', bookName: 'Book 2', bookPeriod: '2024', status: 'Aberto' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    fiscalBookService.getAll.mockResolvedValue(mockFiscalBooks);
    // Mock window.alert
    window.alert = jest.fn();
  });

  test('renders importer and fetches fiscal books', async () => {
    render(<TransactionsImporter />);

    expect(screen.getByLabelText('Importer')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });
  });

  test('selects importer and fiscal book', async () => {
    render(<TransactionsImporter />);

    // Wait for fiscal books to load
    await waitFor(() => expect(fiscalBookService.getAll).toHaveBeenCalled());

    // Select Importer
    const importerSelect = screen.getByLabelText('Importer');
    fireEvent.mouseDown(importerSelect);
    const nubankOption = await screen.findByRole('option', { name: 'Nubank' });
    fireEvent.click(nubankOption);

    // Select Fiscal Book
    const fiscalBookSelect = screen.getByLabelText('Fiscal Book');
    fireEvent.mouseDown(fiscalBookSelect);
    const bookOption = await screen.findByRole('option', { name: 'Book 1 (2023)' });
    fireEvent.click(bookOption);
  });

  test('calls import function with selected fiscal book', async () => {
    render(<TransactionsImporter />);

    await waitFor(() => expect(fiscalBookService.getAll).toHaveBeenCalled());

    // Select Importer
    fireEvent.mouseDown(screen.getByLabelText('Importer'));
    const nubankOption = await screen.findByRole('option', { name: 'Nubank' });
    fireEvent.click(nubankOption);

    // Select Fiscal Book
    fireEvent.mouseDown(screen.getByLabelText('Fiscal Book'));
    const bookOption = await screen.findByRole('option', { name: 'Book 1 (2023)' });
    fireEvent.click(bookOption);

    // Upload File
    const file = new File(['[]'], 'test.json', { type: 'application/json' });
    const fileInput = document.getElementById('file-input');
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);

    // Click Import
    const importButton = screen.getByText('Importar');
    expect(importButton).not.toBeDisabled();
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(importService.importNubankTransactions).toHaveBeenCalledWith(
        expect.anything(), // data
        'fb1' // fiscalBookId
      );
    });
  });
});
