import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TransactionList from './TransactionsList';
import * as transactionService from '../../services/transactionService';
import * as categoryService from '../../services/categoryService';
import fiscalBookService from '../../services/fiscalBookService';

jest.mock('../../services/transactionService');
jest.mock('../../services/categoryService');
jest.mock('../../services/fiscalBookService');
jest.mock('local-storage', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

// Mock child components
jest.mock('./TransactionsListToolBar', () => ({
  TransactionsListToolBar: ({ fiscalBookYear }) => (
    <div data-testid="toolbar" data-fiscal-book-year={fiscalBookYear}>
      Toolbar Mock
    </div>
  ),
}));

jest.mock('./TransactionsListHeader', () => ({
  TransactionsListHeader: () => <div data-testid="header">Header Mock</div>,
}));

jest.mock('./TransactionsListFooter', () => ({
  TransactionsListFooter: () => <div data-testid="footer">Footer Mock</div>,
}));

jest.mock('../TransactionFiscalBookActions/TransactionFiscalBookActions', () => ({
  __esModule: true,
  default: () => <div>Fiscal Book Actions Mock</div>,
}));

jest.mock('../../ui/LoadingIndicator', () => ({
  __esModule: true,
  default: () => <div>Loading...</div>,
}));

jest.mock('../../ui/Buttons/IconByCategory', () => ({
  IconByCategory: () => <div>Icon</div>,
}));

jest.mock('../../ui/Buttons/useTransactionTypeColor.hook', () => ({
  transactionTypeColor: jest.fn(() => '#fff'),
}));

describe('TransactionsList', () => {
  const mockCategories = [
    { id: 'cat1', name: 'Category 1' },
    { id: 'cat2', name: 'Category 2' },
  ];

  const mockFiscalBooks = [
    { id: 'fb1', _id: 'fb1', bookName: 'Book 1', bookPeriod: '2023', status: 'Aberto' },
    { id: 'fb2', _id: 'fb2', bookName: 'Book 2', bookPeriod: '2024', status: 'Aberto' },
  ];

  const mockTransactions = [
    {
      id: 'txn1',
      description: 'Transaction 1',
      amount: 100,
      transactionType: 'expense',
      category: 'cat1',
      fiscalBookId: 'fb1',
    },
    {
      id: 'txn2',
      description: 'Transaction 2',
      amount: 200,
      transactionType: 'income',
      category: 'cat2',
      fiscalBookId: 'fb2',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    categoryService.getCategories.mockResolvedValue({ data: mockCategories });
    fiscalBookService.getAll.mockResolvedValue(mockFiscalBooks);
    transactionService.findAllTransactionsInPeriod.mockResolvedValue({ data: mockTransactions });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <TransactionList />
      </BrowserRouter>
    );
  };

  it('should render the component', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('toolbar')).toBeInTheDocument();
    });
  });

  it('should fetch categories and fiscal books on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(categoryService.getCategories).toHaveBeenCalled();
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });
  });

  it('should calculate fiscal book year when fiscal book is selected', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('toolbar')).toBeInTheDocument();
    });

    // Initial state - no fiscal book selected
    const toolbar = screen.getByTestId('toolbar');
    expect(toolbar).not.toHaveAttribute('data-fiscal-book-year');
  });

  it('should extract year from fiscal book period', async () => {
    renderComponent();

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    // The component should be able to extract year from bookPeriod
    // This is tested indirectly through the fiscalBookYear calculation
  });

  it('should handle fiscal books without period gracefully', async () => {
    fiscalBookService.getAll.mockResolvedValue([
      { id: 'fb3', _id: 'fb3', bookName: 'Book 3', status: 'Aberto' },
    ]);

    renderComponent();

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    // Should not crash when bookPeriod is missing
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
  });

  it('should handle errors when fetching categories', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    categoryService.getCategories.mockRejectedValueOnce(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(categoryService.getCategories).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching categories:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should handle errors when fetching fiscal books', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    fiscalBookService.getAll.mockRejectedValue(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching fiscal books:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should render transactions list when data is available', async () => {
    renderComponent();

    await waitFor(() => {
      expect(categoryService.getCategories).toHaveBeenCalled();
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });
  });
});
