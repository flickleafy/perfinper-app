import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FiscalBookBulkOperations from './FiscalBookBulkOperations';
import fiscalBookService from '../../services/fiscalBookService.js';

jest.mock('../../services/fiscalBookService.js', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(),
    addTransactions: jest.fn(),
    transferTransactions: jest.fn(),
    removeTransactions: jest.fn(),
  },
}));

describe('FiscalBookBulkOperations', () => {
  const fiscalBooks = [
    { _id: 'fb1', name: 'Livro 1', year: 2024, status: 'Ativo', transactionCount: 2 },
    { _id: 'fb2', name: 'Livro 2', year: 2023, status: 'Ativo', transactionCount: 1 },
    { _id: 'fb3', name: 'Livro 3', year: 2022, status: 'Arquivado', transactionCount: 0 },
  ];

  const selectedTransactions = [
    {
      id: 't1',
      transactionDescription: 'Compra A',
      transactionValue: '10,00',
      fiscalBookId: 'fb1',
      fiscalBookName: 'Livro 1',
      fiscalBookYear: 2024,
    },
    {
      id: 't2',
      transactionDescription: 'Compra B',
      transactionValue: '20,00',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    fiscalBookService.getAll.mockResolvedValue(fiscalBooks);
    fiscalBookService.addTransactions.mockResolvedValue({});
    fiscalBookService.transferTransactions.mockResolvedValue({});
    fiscalBookService.removeTransactions.mockResolvedValue({});
  });
  const openSelectByLabel = async (labelText) => {
    const label = await screen.findByText(labelText, { selector: 'label' });
    const formControl = label.parentElement;
    const trigger = formControl.querySelector('[role="button"], [role="combobox"]');
    fireEvent.mouseDown(trigger);
  };

  it('loads fiscal books and renders summary', async () => {
    render(
      <FiscalBookBulkOperations
        open
        onClose={jest.fn()}
        selectedTransactions={selectedTransactions}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    expect(screen.getByText('Selecione uma Operação')).toBeInTheDocument();
    expect(
      await screen.findByText(/com livro fiscal/)
    ).toBeInTheDocument();
  });

  it('requires a target book for assignment', async () => {
    render(
      <FiscalBookBulkOperations
        open
        onClose={jest.fn()}
        selectedTransactions={selectedTransactions}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    await openSelectByLabel('Tipo de Operação');
    fireEvent.click(
      await screen.findByRole('option', { name: /Atribuir ao Livro Fiscal/i })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Executar Operação' }));

    expect(
      await screen.findByText(
        'Selecione um livro fiscal para atribuir as transações'
      )
    ).toBeInTheDocument();
    expect(fiscalBookService.addTransactions).not.toHaveBeenCalled();
  });

  it('executes assignment and notifies completion', async () => {
    const onClose = jest.fn();
    const onOperationComplete = jest.fn();

    render(
      <FiscalBookBulkOperations
        open
        onClose={onClose}
        selectedTransactions={selectedTransactions}
        onOperationComplete={onOperationComplete}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    await openSelectByLabel('Tipo de Operação');
    fireEvent.click(
      await screen.findByRole('option', { name: /Atribuir ao Livro Fiscal/i })
    );

    await openSelectByLabel('Livro Fiscal de Destino');
    fireEvent.click(await screen.findByRole('option', { name: /Livro 1/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Executar Operação' }));

    await waitFor(() => {
      expect(fiscalBookService.addTransactions).toHaveBeenCalledWith('fb1', [
        't1',
        't2',
      ]);
    });

    expect(onOperationComplete).toHaveBeenCalledWith('assign', {
      source: '',
      target: 'fb1',
      transactionIds: ['t1', 't2'],
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('validates transfer requirements', async () => {
    render(
      <FiscalBookBulkOperations
        open
        onClose={jest.fn()}
        selectedTransactions={selectedTransactions}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    await openSelectByLabel('Tipo de Operação');
    fireEvent.click(
      await screen.findByRole('option', { name: /Transferir entre Livros/i })
    );

    await openSelectByLabel('Livro de Origem');
    fireEvent.click(await screen.findByRole('option', { name: /Livro 1/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Executar Operação' }));

    expect(
      await screen.findByText(
        'Selecione os livros de origem e destino para transferir as transações'
      )
    ).toBeInTheDocument();
  });

  it('executes transfer and removal operations', async () => {
    const onClose = jest.fn();

    render(
      <FiscalBookBulkOperations
        open
        onClose={onClose}
        selectedTransactions={selectedTransactions}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    await openSelectByLabel('Tipo de Operação');
    fireEvent.click(
      await screen.findByRole('option', { name: /Transferir entre Livros/i })
    );

    await openSelectByLabel('Livro de Origem');
    fireEvent.click(await screen.findByRole('option', { name: /Livro 1/i }));
    await openSelectByLabel('Livro de Destino');
    fireEvent.click(await screen.findByRole('option', { name: /Livro 2/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Executar Operação' }));

    await waitFor(() => {
      expect(fiscalBookService.transferTransactions).toHaveBeenCalledWith(
        'fb1',
        'fb2',
        ['t1', 't2']
      );
    });

    await openSelectByLabel('Tipo de Operação');
    fireEvent.click(
      await screen.findByRole('option', { name: /Remover do Livro Fiscal/i })
    );

    await openSelectByLabel('Livro Fiscal de Origem');
    fireEvent.click(await screen.findByRole('option', { name: /Livro 1/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Executar Operação' }));

    await waitFor(() => {
      expect(fiscalBookService.removeTransactions).toHaveBeenCalledWith('fb1', [
        't1',
        't2',
      ]);
    });
  });

  it('requires a source book for removal', async () => {
    render(
      <FiscalBookBulkOperations
        open
        onClose={jest.fn()}
        selectedTransactions={selectedTransactions}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    await openSelectByLabel('Tipo de Operação');
    fireEvent.click(
      await screen.findByRole('option', { name: /Remover do Livro Fiscal/i })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Executar Operação' }));

    expect(
      await screen.findByText('Selecione o livro fiscal para remover as transações')
    ).toBeInTheDocument();
  });

  it('shows an error when an operation fails', async () => {
    fiscalBookService.addTransactions.mockRejectedValueOnce(new Error('boom'));

    render(
      <FiscalBookBulkOperations
        open
        onClose={jest.fn()}
        selectedTransactions={selectedTransactions}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    await openSelectByLabel('Tipo de Operação');
    fireEvent.click(
      await screen.findByRole('option', { name: /Atribuir ao Livro Fiscal/i })
    );

    await openSelectByLabel('Livro Fiscal de Destino');
    fireEvent.click(await screen.findByRole('option', { name: /Livro 1/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Executar Operação' }));

    expect(
      await screen.findByText('Erro ao executar operação em lote')
    ).toBeInTheDocument();
  });

  it('shows load errors from the API', async () => {
    fiscalBookService.getAll.mockRejectedValueOnce(new Error('boom'));

    render(
      <FiscalBookBulkOperations
        open
        onClose={jest.fn()}
        selectedTransactions={selectedTransactions}
      />
    );

    expect(
      await screen.findByText('Erro ao carregar livros fiscais')
    ).toBeInTheDocument();
  });

  it('skips execution when no transactions are selected', async () => {
    render(
      <FiscalBookBulkOperations
        open
        onClose={jest.fn()}
        selectedTransactions={[]}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    await openSelectByLabel('Tipo de Operação');
    fireEvent.click(
      await screen.findByRole('option', { name: /Atribuir ao Livro Fiscal/i })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Executar Operação' }));

    expect(fiscalBookService.addTransactions).not.toHaveBeenCalled();
  });

  it('validates assignment operation', async () => {
    render(
      <FiscalBookBulkOperations
        open
        onClose={jest.fn()}
        selectedTransactions={selectedTransactions}
      />
    );
    await waitFor(() => expect(fiscalBookService.getAll).toHaveBeenCalled());

    await openSelectByLabel('Tipo de Operação');
    fireEvent.click(await screen.findByRole('option', { name: /Atribuir ao Livro Fiscal/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Executar Operação' }));
    expect(await screen.findByText('Selecione um livro fiscal para atribuir as transações')).toBeInTheDocument();
  });

  it('validates remove operation', async () => {
    render(
        <FiscalBookBulkOperations
          open
          onClose={jest.fn()}
          selectedTransactions={selectedTransactions}
        />
      );
      await waitFor(() => expect(fiscalBookService.getAll).toHaveBeenCalled());
  
      await openSelectByLabel('Tipo de Operação');
      fireEvent.click(await screen.findByRole('option', { name: /Remover do Livro Fiscal/i }));
      fireEvent.click(screen.getByRole('button', { name: 'Executar Operação' }));
      expect(await screen.findByText('Selecione o livro fiscal para remover as transações')).toBeInTheDocument();
  });

  it('does nothing if no operation selected', async () => {
    render(
      <FiscalBookBulkOperations
        open
        onClose={jest.fn()}
        selectedTransactions={selectedTransactions}
      />
    );
    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Executar Operação' }));
    expect(fiscalBookService.addTransactions).not.toHaveBeenCalled();
    expect(screen.queryByText('Operação inválida')).not.toBeInTheDocument();
  });

  it('uses empty array when selectedTransactions is undefined', async () => {
    render(
      <FiscalBookBulkOperations
        open
        onClose={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    expect(screen.getByText('Transações Selecionadas (0)')).toBeInTheDocument();
  });

  it('does not load fiscal books when dialog is closed', async () => {
    const { rerender } = render(
      <FiscalBookBulkOperations
        open={false}
        onClose={jest.fn()}
        selectedTransactions={selectedTransactions}
      />
    );

    expect(fiscalBookService.getAll).not.toHaveBeenCalled();

    rerender(
      <FiscalBookBulkOperations
        open
        onClose={jest.fn()}
        selectedTransactions={selectedTransactions}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });
  });

  it('handles null response from API gracefully', async () => {
    fiscalBookService.getAll.mockResolvedValueOnce(null);

    render(
      <FiscalBookBulkOperations
        open
        onClose={jest.fn()}
        selectedTransactions={selectedTransactions}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('displays transactionCount as 0 when missing', async () => {
    const booksWithoutCount = [
      { _id: 'fb1', name: 'Livro Sem Count', year: 2024, status: 'Ativo' },
    ];
    fiscalBookService.getAll.mockResolvedValueOnce(booksWithoutCount);

    render(
      <FiscalBookBulkOperations
        open
        onClose={jest.fn()}
        selectedTransactions={selectedTransactions}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    await openSelectByLabel('Tipo de Operação');
    fireEvent.click(
      await screen.findByRole('option', { name: /Atribuir ao Livro Fiscal/i })
    );

    await openSelectByLabel('Livro Fiscal de Destino');

    expect(await screen.findByText(/0 transações/)).toBeInTheDocument();
  });

  it('shows truncated list when more than 5 transactions selected', async () => {
    const manyTransactions = Array.from({ length: 7 }, (_, i) => ({
      id: `t${i}`,
      transactionDescription: `Transação ${i + 1}`,
      transactionValue: `${(i + 1) * 10},00`,
    }));

    render(
      <FiscalBookBulkOperations
        open
        onClose={jest.fn()}
        selectedTransactions={manyTransactions}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    expect(screen.getByText('Transações Selecionadas (7)')).toBeInTheDocument();
    expect(screen.getByText('... e mais 2 transações')).toBeInTheDocument();
  });
});
