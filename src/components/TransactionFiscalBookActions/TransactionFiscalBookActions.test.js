import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TransactionFiscalBookActions from './TransactionFiscalBookActions';
import fiscalBookService from '../../services/fiscalBookService.js';

jest.mock('../../services/fiscalBookService.js', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(),
    addTransactions: jest.fn(),
    removeTransactions: jest.fn(),
    transferTransactions: jest.fn(),
  },
}));

describe('TransactionFiscalBookActions', () => {
  const books = [
    { _id: 'fb1', name: 'Livro 1', year: 2024, status: 'Ativo', transactionCount: 2 },
    { _id: 'fb2', name: 'Livro 2', year: 2023, status: 'Ativo', transactionCount: 1 },
    { _id: 'fb3', name: 'Livro 3', year: 2022, status: 'Arquivado', transactionCount: 0 },
  ];

  const anchorEl = document.createElement('div');

  beforeEach(() => {
    jest.clearAllMocks();
    fiscalBookService.getAll.mockResolvedValue(books);
    fiscalBookService.addTransactions.mockResolvedValue({});
    fiscalBookService.removeTransactions.mockResolvedValue({});
    fiscalBookService.transferTransactions.mockResolvedValue({});
  });

  it('opens menu and assigns transaction to a fiscal book', async () => {
    const onOpen = jest.fn();
    const onClose = jest.fn();
    const onTransactionUpdated = jest.fn();

    render(
      <TransactionFiscalBookActions
        transaction={{ id: 't1', fiscalBookId: null }}
        onTransactionUpdated={onTransactionUpdated}
        anchorEl={anchorEl}
        open
        onClose={onClose}
        onOpen={onOpen}
      />
    );

    fireEvent.click(screen.getByTestId('MoreVertIcon').closest('button'));
    expect(onOpen).toHaveBeenCalled();

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    fireEvent.click(await screen.findByText('Livro 1'));

    await waitFor(() => {
      expect(fiscalBookService.addTransactions).toHaveBeenCalledWith('fb1', ['t1']);
    });

    expect(onTransactionUpdated).toHaveBeenCalledWith(
      expect.objectContaining({
        fiscalBookId: 'fb1',
        fiscalBookName: 'Livro 1',
        fiscalBookYear: 2024,
      })
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('removes a transaction from a fiscal book', async () => {
    const onClose = jest.fn();
    const onTransactionUpdated = jest.fn();

    render(
      <TransactionFiscalBookActions
        transaction={{ id: 't1', fiscalBookId: 'fb1', fiscalBookName: 'Livro 1', fiscalBookYear: 2024 }}
        onTransactionUpdated={onTransactionUpdated}
        anchorEl={anchorEl}
        open
        onClose={onClose}
        onOpen={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(
        screen.queryByText('Carregando livros fiscais...')
      ).not.toBeInTheDocument();
    });

    fireEvent.click(await screen.findByText('Remover do Livro Fiscal'));

    await waitFor(() => {
      expect(fiscalBookService.removeTransactions).toHaveBeenCalledWith('fb1', ['t1']);
    });

    expect(onTransactionUpdated).toHaveBeenCalledWith(
      expect.objectContaining({
        fiscalBookId: null,
        fiscalBookName: null,
        fiscalBookYear: null,
      })
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('transfers a transaction to another book', async () => {
    const onClose = jest.fn();
    const onTransactionUpdated = jest.fn();

    render(
      <TransactionFiscalBookActions
        transaction={{ id: 't1', fiscalBookId: 'fb1', fiscalBookName: 'Livro 1', fiscalBookYear: 2024 }}
        onTransactionUpdated={onTransactionUpdated}
        anchorEl={anchorEl}
        open
        onClose={onClose}
        onOpen={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    fireEvent.click(await screen.findByText('Livro 2'));

    await waitFor(() => {
      expect(fiscalBookService.transferTransactions).toHaveBeenCalledWith(
        'fb1',
        'fb2',
        ['t1']
      );
    });

    expect(onTransactionUpdated).toHaveBeenCalledWith(
      expect.objectContaining({
        fiscalBookId: 'fb2',
        fiscalBookName: 'Livro 2',
        fiscalBookYear: 2023,
      })
    );
  });

  it('shows an error when loading fiscal books fails', async () => {
    fiscalBookService.getAll.mockRejectedValueOnce(new Error('boom'));

    render(
      <TransactionFiscalBookActions
        transaction={{ id: 't1', fiscalBookId: null }}
        anchorEl={anchorEl}
        open
        onClose={jest.fn()}
        onOpen={jest.fn()}
      />
    );

    expect(
      await screen.findByText('Erro ao carregar livros fiscais')
    ).toBeInTheDocument();
  });

  it('shows empty state when no books are available', async () => {
    fiscalBookService.getAll.mockResolvedValueOnce([]);

    render(
      <TransactionFiscalBookActions
        transaction={{ id: 't1', fiscalBookId: null }}
        anchorEl={anchorEl}
        open
        onClose={jest.fn()}
        onOpen={jest.fn()}
      />
    );

    expect(
      await screen.findByText('Nenhum livro fiscal ativo disponível')
    ).toBeInTheDocument();
  });

  it('shows an assignment error when the operation fails', async () => {
    fiscalBookService.addTransactions.mockRejectedValueOnce(new Error('boom'));

    render(
      <TransactionFiscalBookActions
        transaction={{ id: 't1', fiscalBookId: null }}
        anchorEl={anchorEl}
        open
        onClose={jest.fn()}
        onOpen={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    fireEvent.click(await screen.findByText('Livro 1'));

    expect(
      await screen.findByText('Erro ao atribuir transação ao livro fiscal')
    ).toBeInTheDocument();
  });

  it('shows a removal error when removing fails', async () => {
    fiscalBookService.removeTransactions.mockRejectedValueOnce(new Error('boom'));

    render(
      <TransactionFiscalBookActions
        transaction={{ id: 't1', fiscalBookId: 'fb1', fiscalBookName: 'Livro 1', fiscalBookYear: 2024 }}
        anchorEl={anchorEl}
        open
        onClose={jest.fn()}
        onOpen={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    const removeButton = await screen.findByText('Remover do Livro Fiscal');
    fireEvent.click(removeButton);

    expect(
      await screen.findByText('Erro ao remover transação do livro fiscal')
    ).toBeInTheDocument();
  });

  it('shows a transfer error when transferring fails', async () => {
    fiscalBookService.transferTransactions.mockRejectedValueOnce(new Error('boom'));

    render(
      <TransactionFiscalBookActions
        transaction={{ id: 't1', fiscalBookId: 'fb1', fiscalBookName: 'Livro 1', fiscalBookYear: 2024 }}
        anchorEl={anchorEl}
        open
        onClose={jest.fn()}
        onOpen={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    fireEvent.click(await screen.findByText('Livro 2'));

    expect(
      await screen.findByText('Erro ao transferir transação')
    ).toBeInTheDocument();
  });

  it('does not load fiscal books when menu is closed', async () => {
    render(
      <TransactionFiscalBookActions
        transaction={{ id: 't1', fiscalBookId: null }}
        anchorEl={anchorEl}
        open={false}
        onClose={jest.fn()}
        onOpen={jest.fn()}
      />
    );

    expect(fiscalBookService.getAll).not.toHaveBeenCalled();
  });

  it('shows operation loading overlay while assigning', async () => {
    fiscalBookService.addTransactions.mockReturnValue(new Promise(() => {}));

    render(
      <TransactionFiscalBookActions
        transaction={{ id: 't1', fiscalBookId: null }}
        anchorEl={anchorEl}
        open
        onClose={jest.fn()}
        onOpen={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    fireEvent.click(await screen.findByText('Livro 1'));

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles success without onTransactionUpdated callback', async () => {
    const onClose = jest.fn();
    render(
      <TransactionFiscalBookActions
        transaction={{ id: 't1', fiscalBookId: null }}
        onTransactionUpdated={undefined}
        anchorEl={anchorEl}
        open
        onClose={onClose}
        onOpen={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    fireEvent.click(await screen.findByText('Livro 1'));

    await waitFor(() => {
        expect(fiscalBookService.addTransactions).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });
  });

  it('handles transfer success without onTransactionUpdated callback', async () => {
    const onClose = jest.fn();
    render(
      <TransactionFiscalBookActions
        transaction={{ id: 't1', fiscalBookId: 'fb1' }}
        onTransactionUpdated={undefined}
        anchorEl={anchorEl}
        open
        onClose={onClose}
        onOpen={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    // Transfer from fb1 (Livro 1) to fb2 (Livro 2)
    fireEvent.click(await screen.findByText('Livro 2'));

    await waitFor(() => {
        expect(fiscalBookService.transferTransactions).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });
  });

  it('handles remove success without onTransactionUpdated callback', async () => {
    const onClose = jest.fn();
    render(
      <TransactionFiscalBookActions
        transaction={{ id: 't1', fiscalBookId: 'fb1' }}
        onTransactionUpdated={undefined}
        anchorEl={anchorEl}
        open
        onClose={onClose}
        onOpen={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    const removeButton = await screen.findByText('Remover do Livro Fiscal');
    fireEvent.click(removeButton);

    await waitFor(() => {
        expect(fiscalBookService.removeTransactions).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });
  });
});
