import React from 'react';
import { render, screen } from '@testing-library/react';
import { TransactionsListToolBar } from './TransactionsListToolBar';

jest.mock('../../ui/PeriodSelector', () => ({
  __esModule: true,
  default: ({ onDataChange, fiscalBookYear }) => (
    <div data-testid="period-selector" data-fiscal-book-year={fiscalBookYear}>
      Period Selector Mock
    </div>
  ),
}));

jest.mock('../../ui/SearchBar', () => ({
  __esModule: true,
  default: ({ onDataChange, array }) => <div data-testid="search-bar">Search Bar Mock</div>,
}));

jest.mock('../../ui/StatusBar', () => ({
  __esModule: true,
  default: ({ array }) => <div data-testid="status-bar">Status Bar Mock</div>,
}));

jest.mock('../FiscalBookFilter/FiscalBookFilter', () => ({
  __esModule: true,
  default: ({ selectedFiscalBookId, onFiscalBookChange }) => (
    <div data-testid="fiscal-book-filter" data-selected-id={selectedFiscalBookId}>
      Fiscal Book Filter Mock
    </div>
  ),
}));

describe('TransactionsListToolBar', () => {
  const defaultProps = {
    periodSelected: '2023-12',
    handleDataChangePeriodSelector: jest.fn(),
    fullTransactionsList: [],
    handleDataChangeSearchBar: jest.fn(),
    transactionsPrintList: [],
    selectedFiscalBookId: null,
    onFiscalBookChange: jest.fn(),
    fiscalBookYear: null,
  };

  it('should render all components', () => {
    render(<TransactionsListToolBar {...defaultProps} />);

    expect(screen.getByTestId('period-selector')).toBeInTheDocument();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('status-bar')).toBeInTheDocument();
    expect(screen.getByTestId('fiscal-book-filter')).toBeInTheDocument();
  });

  it('should pass fiscalBookYear to PeriodSelector', () => {
    render(<TransactionsListToolBar {...defaultProps} fiscalBookYear="2023" />);

    const periodSelector = screen.getByTestId('period-selector');
    expect(periodSelector).toHaveAttribute('data-fiscal-book-year', '2023');
  });

  it('should pass selectedFiscalBookId to FiscalBookFilter', () => {
    render(<TransactionsListToolBar {...defaultProps} selectedFiscalBookId="fb123" />);

    const fiscalBookFilter = screen.getByTestId('fiscal-book-filter');
    expect(fiscalBookFilter).toHaveAttribute('data-selected-id', 'fb123');
  });

  it('should handle null fiscalBookYear', () => {
    render(<TransactionsListToolBar {...defaultProps} fiscalBookYear={null} />);

    const periodSelector = screen.getByTestId('period-selector');
    expect(periodSelector).not.toHaveAttribute('data-fiscal-book-year');
  });
});
