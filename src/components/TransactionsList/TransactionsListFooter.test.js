import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionsListFooter } from './TransactionsListFooter';

describe('TransactionsListFooter', () => {
  it('invokes callbacks when enabled', () => {
    const deleteAllTransactions = jest.fn();
    const restoreToFullTransactionsList = jest.fn();

    render(
      <TransactionsListFooter
        disabled={false}
        deleteAllTransactions={deleteAllTransactions}
        restoreToFullTransactionsList={restoreToFullTransactionsList}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Deletar Itens Listados' }));
    fireEvent.click(screen.getByRole('button', { name: 'Resetar Lista' }));

    expect(deleteAllTransactions).toHaveBeenCalled();
    expect(restoreToFullTransactionsList).toHaveBeenCalled();
  });

  it('disables actions when disabled', () => {
    const deleteAllTransactions = jest.fn();
    const restoreToFullTransactionsList = jest.fn();

    render(
      <TransactionsListFooter
        disabled
        deleteAllTransactions={deleteAllTransactions}
        restoreToFullTransactionsList={restoreToFullTransactionsList}
      />
    );

    const deleteButton = screen.getByRole('button', { name: 'Deletar Itens Listados' });
    const resetButton = screen.getByRole('button', { name: 'Resetar Lista' });

    expect(deleteButton).toBeDisabled();
    expect(resetButton).toBeDisabled();
  });
});
