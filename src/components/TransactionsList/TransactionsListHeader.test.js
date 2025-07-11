import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionsListHeader } from './TransactionsListHeader';

describe('TransactionsListHeader', () => {
  it('toggles sort order for numeric column', () => {
    const onSortChange = jest.fn();

    render(<TransactionsListHeader onSortChange={onSortChange} />);

    fireEvent.click(screen.getByText('Valor'));

    expect(onSortChange).toHaveBeenCalledWith('transactionValue', 'desc', true);

    fireEvent.click(screen.getByText('Valor'));

    expect(onSortChange).toHaveBeenCalledWith('transactionValue', 'asc', true);
  });

  it('sorts non-numeric columns with expected flag', () => {
    const onSortChange = jest.fn();

    render(<TransactionsListHeader onSortChange={onSortChange} />);

    fireEvent.click(screen.getByText('Data'));

    expect(onSortChange).toHaveBeenCalledWith('transactionDate', 'desc', false);
  });

  it('toggles sort order for description column', () => {
    const onSortChange = jest.fn();
    render(<TransactionsListHeader onSortChange={onSortChange} />);

    fireEvent.click(screen.getByText('Descrição'));
    expect(onSortChange).toHaveBeenCalledWith('transactionDescription', 'desc', false);

    fireEvent.click(screen.getByText('Descrição'));
    expect(onSortChange).toHaveBeenCalledWith('transactionDescription', 'asc', false);
  });

  it('toggles sort order for category column', () => {
    const onSortChange = jest.fn();
    render(<TransactionsListHeader onSortChange={onSortChange} />);

    fireEvent.click(screen.getByText('Categoria'));
    expect(onSortChange).toHaveBeenCalledWith('transactionCategory', 'desc', false);

    fireEvent.click(screen.getByText('Categoria'));
    expect(onSortChange).toHaveBeenCalledWith('transactionCategory', 'asc', false);
  });

  it('toggles sort order for fiscal book column', () => {
    const onSortChange = jest.fn();
    render(<TransactionsListHeader onSortChange={onSortChange} />);

    fireEvent.click(screen.getByText('Livro Fiscal'));
    expect(onSortChange).toHaveBeenCalledWith('fiscalBookName', 'desc', false);

    fireEvent.click(screen.getByText('Livro Fiscal'));
    expect(onSortChange).toHaveBeenCalledWith('fiscalBookName', 'asc', false);
  });
});
