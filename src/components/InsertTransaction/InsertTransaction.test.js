import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InsertTransaction from './InsertTransaction';
import { insertTransaction } from '../../services/transactionService.js';
import { getCategories } from '../../services/categoryService.js';

jest.mock('../../services/transactionService.js', () => ({
  insertTransaction: jest.fn(),
}));

jest.mock('../../services/categoryService.js', () => ({
  getCategories: jest.fn(),
}));

jest.mock('../TransactionForm.js', () => ({
  __esModule: true,
  default: ({
    transaction,
    categories,
    handleInputChange,
    handleDateChange,
    handleItemsChange,
    handleFiscalBookChange,
    selectedFiscalBook,
  }) => (
    <div>
      <div data-testid="transaction-value">{transaction.transactionValue}</div>
      <div data-testid="freight-value">{transaction.freightValue}</div>
      <div data-testid="transaction-name">{transaction.name}</div>
      <div data-testid="items-count">{transaction.items.length}</div>
      <div data-testid="categories-count">{categories.length}</div>
      <div data-testid="fiscal-book-id">
        {transaction.fiscalBookId ?? 'none'}
      </div>
      <div data-testid="fiscal-book-name">
        {transaction.fiscalBookName || 'none'}
      </div>
      <div data-testid="fiscal-book-year">
        {transaction.fiscalBookYear ?? 'none'}
      </div>
      <div data-testid="selected-fiscal-book">
        {selectedFiscalBook?.id || 'none'}
      </div>
      <button
        type="button"
        onClick={() =>
          handleInputChange({
            target: { name: 'transactionValue', value: '2000' },
          })
        }
      >
        Set Value
      </button>
      <button
        type="button"
        onClick={() =>
          handleInputChange({
            target: { name: 'freightValue', value: '35' },
          })
        }
      >
        Set Freight
      </button>
      <button
        type="button"
        onClick={() =>
          handleInputChange({
            target: { name: 'name', value: 'SomeName' },
          })
        }
      >
        Set Name
      </button>
      <button
        type="button"
        onClick={() => handleItemsChange([{ itemName: 'Item A' }])}
      >
        Set Items
      </button>
      <button
        type="button"
        onClick={() => handleDateChange(new Date('2024-03-10T00:00:00.000Z'))}
      >
        Set Date
      </button>
      <button
        type="button"
        onClick={() =>
          handleFiscalBookChange({
            id: 'book-1',
            bookName: 'Book One',
            year: 2024,
          })
        }
      >
        Set Fiscal Book
      </button>
      <button
        type="button"
        onClick={() =>
          handleFiscalBookChange({
            _id: 'legacy-book',
            name: 'Legacy Book',
            year: 2023,
          })
        }
      >
        Set Legacy Fiscal Book
      </button>
      <button type="button" onClick={() => handleFiscalBookChange(null)}>
        Clear Fiscal Book
      </button>
    </div>
  ),
}));

// Mock objectsBuilder to control return value
jest.mock('../objectsBuilder.js', () => ({
    transactionBuilder: jest.fn(),
  }));
import { transactionBuilder } from '../objectsBuilder.js';

describe('InsertTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCategories.mockResolvedValue({ data: [{ id: 'cat1', name: 'Cat' }] });
    insertTransaction.mockResolvedValue({ data: { id: 't1' } });
    // Default valid builder response
    transactionBuilder.mockReturnValue({
        transactionValue: '2000,00',
        transactionPeriod: '2024-03',
        items: [{ itemName: 'Item A' }],
    });
  });

  it('loads categories and formats currency inputs', async () => {
    render(<InsertTransaction />);

    await waitFor(() => {
      expect(getCategories).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('categories-count')).toHaveTextContent('1');
    });

    fireEvent.click(screen.getByText('Set Value'));
    fireEvent.click(screen.getByText('Set Freight'));

    expect(screen.getByTestId('transaction-value')).toHaveTextContent('2000,00');
    expect(screen.getByTestId('freight-value')).toHaveTextContent('35,00');
  });

  it('inserts a transaction and shows success state', async () => {
    render(<InsertTransaction />);

    await waitFor(() => {
      expect(getCategories).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('Set Value'));
    fireEvent.click(screen.getByText('Set Items'));
    fireEvent.click(screen.getByText('Set Date'));

    fireEvent.click(screen.getByRole('button', { name: 'Inserir' }));

    await waitFor(() => {
      expect(insertTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionValue: '2000,00',
          transactionPeriod: '2024-03',
          items: [{ itemName: 'Item A' }],
        })
      );
    });

    expect(
      screen.getByText('O lançamento foi inserido com sucesso!')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Inserir Outro' }));

    expect(
      screen.getByRole('button', { name: 'Inserir' })
    ).toBeInTheDocument();
  });

  it('handles insert errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    insertTransaction.mockRejectedValueOnce(new Error('boom'));

    render(<InsertTransaction />);

    await waitFor(() => {
      expect(getCategories).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Inserir' }));

    await waitFor(() => {
      expect(insertTransaction).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('updates non-currency fields without formatting', async () => {
    render(<InsertTransaction />);
    await waitFor(() => expect(getCategories).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Set Name'));
    expect(screen.getByTestId('transaction-name')).toHaveTextContent('SomeName');
  });

  it('does not insert if transactionBuilder returns null', async () => {
    transactionBuilder.mockReturnValue(null); // Force null return

    render(<InsertTransaction />);
    await waitFor(() => expect(getCategories).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Inserir' }));

    await waitFor(() => expect(transactionBuilder).toHaveBeenCalled());
    expect(insertTransaction).not.toHaveBeenCalled();
  });

  it('updates fiscal book fields when selecting a book', async () => {
    render(<InsertTransaction />);
    await waitFor(() => expect(getCategories).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Set Fiscal Book'));

    expect(screen.getByTestId('fiscal-book-id')).toHaveTextContent('book-1');
    expect(screen.getByTestId('fiscal-book-name')).toHaveTextContent('Book One');
    expect(screen.getByTestId('fiscal-book-year')).toHaveTextContent('2024');
    expect(screen.getByTestId('selected-fiscal-book')).toHaveTextContent('book-1');
  });

  it('handles legacy fiscal book ids and clearing selection', async () => {
    render(<InsertTransaction />);
    await waitFor(() => expect(getCategories).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Set Legacy Fiscal Book'));

    expect(screen.getByTestId('fiscal-book-id')).toHaveTextContent('legacy-book');
    expect(screen.getByTestId('fiscal-book-name')).toHaveTextContent('Legacy Book');
    expect(screen.getByTestId('fiscal-book-year')).toHaveTextContent('2023');

    fireEvent.click(screen.getByText('Clear Fiscal Book'));

    expect(screen.getByTestId('fiscal-book-id')).toHaveTextContent('none');
    expect(screen.getByTestId('fiscal-book-name')).toHaveTextContent('none');
    expect(screen.getByTestId('fiscal-book-year')).toHaveTextContent('none');
    expect(screen.getByTestId('selected-fiscal-book')).toHaveTextContent('none');
  });
  
  it('handles Voltar button click safely', async () => {
     render(<InsertTransaction />);
     await waitFor(() => expect(getCategories).toHaveBeenCalled());
     
     const backBtn = screen.getByRole('button', { name: 'Voltar' });
     fireEvent.click(backBtn);
     // Nothing happens, but no crash
  });
});
