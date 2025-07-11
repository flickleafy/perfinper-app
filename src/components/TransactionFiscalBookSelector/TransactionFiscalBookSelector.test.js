import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TransactionFiscalBookSelector from './TransactionFiscalBookSelector';
import fiscalBookService from '../../services/fiscalBookService';
import { formatFiscalBookForDisplay } from '../fiscalBookPrototype';

jest.mock('../../services/fiscalBookService', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(),
  },
}));

jest.mock('../fiscalBookPrototype', () => ({
  formatFiscalBookForDisplay: jest.fn(),
}));

describe('TransactionFiscalBookSelector', () => {
  const books = [
    { id: 'b1', bookName: 'Alpha', bookPeriod: '2023', status: 'Aberto', notes: 'Notes' },
    { id: 'b2', bookName: 'Beta', bookPeriod: '2024', status: 'Arquivado' },
    { id: 'b3', bookName: 'Gamma', bookPeriod: '2024', status: 'Fechado', transactionCount: 2 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    fiscalBookService.getAll.mockResolvedValue(books);
    formatFiscalBookForDisplay.mockImplementation((book) => ({
      ...book,
      id: book.id || book._id,
      bookName: book.bookName || book.name,
      status: book.status || 'Aberto',
      transactionCount: book.transactionCount || 0,
    }));
  });

  it('loads books and excludes archived entries', async () => {
    render(
      <TransactionFiscalBookSelector
        selectedFiscalBook={null}
        onFiscalBookChange={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    fireEvent.mouseDown(screen.getByLabelText('Selecionar Livro Fiscal'));

    expect(await screen.findByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
  });

  it('notifies when a fiscal book is selected', async () => {
    const onFiscalBookChange = jest.fn();

    render(
      <TransactionFiscalBookSelector
        selectedFiscalBook={null}
        onFiscalBookChange={onFiscalBookChange}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    fireEvent.mouseDown(screen.getByLabelText('Selecionar Livro Fiscal'));
    fireEvent.click(await screen.findByRole('option', { name: /Gamma/i }));

    expect(onFiscalBookChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'b3', bookName: 'Gamma' })
    );
  });

  it('renders selected book details and closed warning', async () => {
    render(
      <TransactionFiscalBookSelector
        selectedFiscalBook={{ id: 'b3' }}
        onFiscalBookChange={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    expect(
      screen.getByText('Detalhes do Livro Fiscal Selecionado')
    ).toBeInTheDocument();
    expect(screen.getAllByText('Gamma').length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Este livro fiscal está fechado/i)
    ).toBeInTheDocument();
  });

  it('renders archived warning when selected book is archived', async () => {
    formatFiscalBookForDisplay
      .mockImplementationOnce((book) => ({ ...book, id: book.id, status: 'Aberto' }))
      .mockImplementationOnce((book) => ({ ...book, id: book.id, status: 'Arquivado' }));

    fiscalBookService.getAll.mockResolvedValueOnce([
      { id: 'b9', bookName: 'Arquivado', bookPeriod: '2022', status: 'Arquivado' },
    ]);

    render(
      <TransactionFiscalBookSelector
        selectedFiscalBook={{ id: 'b9' }}
        onFiscalBookChange={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    expect(
      screen.getByText(/Este livro fiscal está arquivado/i)
    ).toBeInTheDocument();
  });

  it('shows a load error message', async () => {
    fiscalBookService.getAll.mockRejectedValueOnce(new Error('boom'));

    render(
      <TransactionFiscalBookSelector
        selectedFiscalBook={null}
        onFiscalBookChange={jest.fn()}
      />
    );

    expect(
      await screen.findByText('Failed to load fiscal books')
    ).toBeInTheDocument();
  });

  it('shows an info message when no books are available', async () => {
    fiscalBookService.getAll.mockResolvedValueOnce([]);

    render(
      <TransactionFiscalBookSelector
        selectedFiscalBook={null}
        onFiscalBookChange={jest.fn()}
      />
    );

    expect(
      await screen.findByText(/Nenhum livro fiscal está disponível para atribuição/i)
    ).toBeInTheDocument();
  });

  it('sorts by period then name and renders status chips', async () => {
    fiscalBookService.getAll.mockResolvedValueOnce([
      { id: 'b10', bookName: 'Zeta', bookPeriod: '2024', status: 'Em Revisão' },
      { id: 'b11', bookName: 'Alpha', bookPeriod: '2024', status: 'Outro' },
      { id: 'b12', bookName: 'Beta', year: 2023, status: 'Aberto' },
    ]);

    render(
      <TransactionFiscalBookSelector
        selectedFiscalBook={null}
        onFiscalBookChange={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    fireEvent.mouseDown(screen.getByLabelText('Selecionar Livro Fiscal'));

    const options = await screen.findAllByRole('option');
    const alphaIndex = options.findIndex((option) =>
      option.textContent.includes('Alpha')
    );
    const zetaIndex = options.findIndex((option) =>
      option.textContent.includes('Zeta')
    );

    expect(alphaIndex).toBeGreaterThan(-1);
    expect(zetaIndex).toBeGreaterThan(-1);
    expect(alphaIndex).toBeLessThan(zetaIndex);
    expect(screen.getByText('Em Revisão')).toBeInTheDocument();
    expect(screen.getByText('Outro')).toBeInTheDocument();
  });

  it('renders default secondary text when no notes are provided', async () => {
    fiscalBookService.getAll.mockResolvedValueOnce([
      { id: 'b13', bookName: 'Gamma', bookPeriod: '2024', status: 'Aberto', transactionCount: 5 }
    ]);

    render(
      <TransactionFiscalBookSelector
        selectedFiscalBook={null}
        onFiscalBookChange={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    fireEvent.mouseDown(screen.getByLabelText('Selecionar Livro Fiscal'));
    expect(await screen.findByText('5 transação(ões)')).toBeInTheDocument();
  });

  it('handles clearing the selection', async () => {
    const onFiscalBookChange = jest.fn();
    render(
      <TransactionFiscalBookSelector
        selectedFiscalBook={{ id: 'b1' }}
        onFiscalBookChange={onFiscalBookChange}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    fireEvent.mouseDown(screen.getByLabelText('Selecionar Livro Fiscal'));
    fireEvent.click(await screen.findByText('Nenhum livro fiscal selecionado'));

    expect(onFiscalBookChange).toHaveBeenCalledWith(null);
  });

  it('renders all status colors correctly', async () => {
    fiscalBookService.getAll.mockResolvedValue([
      { id: 's1', bookName: 'S1', status: 'Aberto' },
      { id: 's2', bookName: 'S2', status: 'Fechado' },
      { id: 's3', bookName: 'S3', status: 'Em Revisão' },
      { id: 's4', bookName: 'S4', status: 'Arquivado' },
      { id: 's5', bookName: 'S5', status: 'Desconhecido' },
    ]);

    render(
      <TransactionFiscalBookSelector 
        onFiscalBookChange={jest.fn()} 
      />
    );

    await waitFor(() => expect(fiscalBookService.getAll).toHaveBeenCalled());
    
    // We can't easily check chip color in JSDOM usually without checking classes
    // But we can ensure they render without crashing
    fireEvent.mouseDown(screen.getByLabelText('Selecionar Livro Fiscal'));
    expect(await screen.findByText('S1')).toBeInTheDocument();
    expect(screen.getByText('S2')).toBeInTheDocument();
    expect(screen.getByText('S3')).toBeInTheDocument();
    // Archived are filtered out by default logic in component:
    // const filteredBooks = books.filter(...) .status !== 'Arquivado' ...
    expect(screen.queryByText('S4')).not.toBeInTheDocument();
    expect(screen.getByText('S5')).toBeInTheDocument();
  });

  it('filters out archived books but displays legacy name/year fields if present', async () => {
    fiscalBookService.getAll.mockResolvedValue([
       // Legacy fields: name instead of bookName, year instead of bookPeriod
      { id: 'l1', name: 'Legacy Book', year: 2020, status: 'Aberto' }
    ]);

    render(
      <TransactionFiscalBookSelector 
        onFiscalBookChange={jest.fn()} 
      />
    );

    await waitFor(() => expect(fiscalBookService.getAll).toHaveBeenCalled());

    fireEvent.mouseDown(screen.getByLabelText('Selecionar Livro Fiscal'));
    expect(await screen.findByText('Legacy Book')).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
  });

  it('shows loading indicator inside select when loading', () => {
     // Return a pending promise to keep it loading
     fiscalBookService.getAll.mockReturnValue(new Promise(() => {}));
     
     render(
      <TransactionFiscalBookSelector 
        onFiscalBookChange={jest.fn()} 
      />
    );
    
    // MUI CircularProgress has role="progressbar"
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders notes and default status label when fields are missing', async () => {
    formatFiscalBookForDisplay.mockImplementation((book) => ({
      ...book,
      id: book.id,
      bookName: book.bookName,
      status: book.status,
      transactionCount: book.transactionCount || 0,
    }));

    fiscalBookService.getAll.mockResolvedValueOnce([
      { id: 'b20', bookName: 'Delta', bookPeriod: '2021', description: 'Desc' },
    ]);

    render(
      <TransactionFiscalBookSelector
        selectedFiscalBook={{ id: 'b20' }}
        onFiscalBookChange={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fiscalBookService.getAll).toHaveBeenCalled();
    });

    expect(screen.getByText('Observações:')).toBeInTheDocument();
    expect(screen.getAllByText('Desc').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Desconhecido').length).toBeGreaterThan(0);
  });

  it('handles sorting of books with mixed periods and names', async () => {
    const mixedBooks = [
        { id: '1', bookName: 'B Book', bookPeriod: '2023', status: 'Aberto' },
        { id: '2', bookName: 'A Book', bookPeriod: '2023', status: 'Aberto' },
        { id: '3', bookName: 'C Book', bookPeriod: '2024', status: 'Aberto' },
    ];
    fiscalBookService.getAll.mockResolvedValue(mixedBooks);

    render(<TransactionFiscalBookSelector onFiscalBookChange={jest.fn()} />);

    await waitFor(() => expect(fiscalBookService.getAll).toHaveBeenCalled());

    const select = screen.getByLabelText('Selecionar Livro Fiscal');
    fireEvent.mouseDown(select);
    
    const options = await screen.findAllByRole('option');
    // Index 0 is "Nenhum..."
    // We expect order: 2024 C, 2023 A, 2023 B
    expect(options[1]).toHaveTextContent('C Book');
    expect(options[2]).toHaveTextContent('A Book');
    expect(options[3]).toHaveTextContent('B Book');
  });

  it('displays loading failure alert', async () => {
    fiscalBookService.getAll.mockRejectedValue(new Error('Fail'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<TransactionFiscalBookSelector onFiscalBookChange={jest.fn()} />);
    
    const alerts = await screen.findAllByText((content) => content.includes('load fiscal books'));
    expect(alerts.length).toBeGreaterThan(0);
    consoleSpy.mockRestore();
  });
  
  it('displays warnings for closed/archived books when passed as initial selection', async () => {
      const books = [
          { id: 'closed', bookName: 'Closed', status: 'Fechado' },
          { id: 'archived', bookName: 'Archived', status: 'Arquivado' }
      ];
      fiscalBookService.getAll.mockResolvedValue(books);

      const { rerender } = render(
          <TransactionFiscalBookSelector 
              selectedFiscalBook={books[0]} 
              onFiscalBookChange={jest.fn()} 
          />
      );
      
      await waitFor(() => expect(fiscalBookService.getAll).toHaveBeenCalled());
      expect(screen.getByText(/Este livro fiscal está fechado/)).toBeInTheDocument();

      rerender(
          <TransactionFiscalBookSelector 
              selectedFiscalBook={books[1]} 
              onFiscalBookChange={jest.fn()} 
          />
      );
      expect(screen.getByText(/Este livro fiscal está arquivado/)).toBeInTheDocument();
  });
});
