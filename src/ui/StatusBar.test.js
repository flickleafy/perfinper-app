import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import StatusBar from './StatusBar';

describe('StatusBar', () => {
  it('calculates totals and balance from transactions', async () => {
    const transactions = [
      { transactionType: 'credit', transactionValue: '100' },
      { transactionType: 'credit', transactionValue: '50.5' },
      { transactionType: 'debit', transactionValue: '20' },
    ];

    render(<StatusBar array={transactions} />);

    await waitFor(() => {
      expect(screen.getByText(/Lan\u00e7amentos:/)).toHaveTextContent('Lan\u00e7amentos: 3');
      expect(screen.getByText(/Receita:/)).toHaveTextContent('Receita: R$ 150,50');
      expect(screen.getByText(/Despesa:/)).toHaveTextContent('Despesa: R$ 20,00');
      expect(screen.getByText(/Saldo:/)).toHaveTextContent('Saldo: R$ 130,50');
    });
  });

  it('renders zeros for an empty list', async () => {
    render(<StatusBar array={[]} />);

    await waitFor(() => {
      expect(screen.getByText(/Lan\u00e7amentos:/)).toHaveTextContent('Lan\u00e7amentos: 0');
      expect(screen.getByText(/Receita:/)).toHaveTextContent('Receita: R$ 0,00');
      expect(screen.getByText(/Despesa:/)).toHaveTextContent('Despesa: R$ 0,00');
      expect(screen.getByText(/Saldo:/)).toHaveTextContent('Saldo: R$ 0,00');
    });
  });
});
