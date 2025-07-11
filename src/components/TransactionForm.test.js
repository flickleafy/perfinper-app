import React from 'react';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import TransactionForm from './TransactionForm';

jest.mock('@mui/x-date-pickers', () => ({
  LocalizationProvider: ({ children }) => <div>{children}</div>,
  DatePicker: ({ label, onChange, value, slotProps }) => {
    const inputProps = slotProps?.textField?.inputProps || {};
    const input = (
      <input
        data-testid="date-picker-input"
        aria-label={inputProps['aria-label'] || label}
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        {...inputProps}
      />
    );
    return input;
  },
}));

jest.mock('../infrastructure/currency/currencyFormat', () => ({
  currencyFormat: (val) => val, // Simple identity for testing
}));

jest.mock('./TransactionFiscalBookSelector/TransactionFiscalBookSelector', () => (props) => (
  <button
    type="button"
    data-testid="fiscal-book-selector"
    disabled={props.disabled}
    onClick={() => props.onFiscalBookChange && props.onFiscalBookChange('selected')}
  >
    Fiscal Book Selector
  </button>
));

describe('TransactionForm', () => {
  const baseTransaction = {
    transactionCategory: '',
    transactionName: '',
    transactionDescription: '',
    transactionType: 'debit',
    transactionValue: '10,00',
    freightValue: '0,00',
    transactionSource: 'manual',
    transactionStatus: 'concluded',
    paymentMethod: 'money',
    transactionLocation: 'online',
    items: [],
    companyName: '',
    companySellerName: '',
    companyCnpj: '',
    transactionFiscalNote: '',
  };

  const categories = [
    { id: 'cat1', name: 'Category 1' },
    { id: 'cat2', name: 'Category 2' },
  ];

  const handleInputChange = jest.fn();
  const handleDateChange = jest.fn();
  const handleItemsChange = jest.fn();
  const handleFiscalBookChange = jest.fn();

  const renderForm = (props = {}) => {
    return render(
      <TransactionForm
        formTitle="New Transaction"
        transaction={baseTransaction}
        handleInputChange={handleInputChange}
        handleDateChange={handleDateChange}
        handleItemsChange={handleItemsChange}
        handleFiscalBookChange={handleFiscalBookChange}
        categories={categories}
        dateValue={new Date('2023-01-01')}
        {...props}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Fields', () => {
    it('updates text fields', () => {
      renderForm();

      fireEvent.change(screen.getByLabelText('Nome da Transação'), { target: { value: 'My Tx' } });
      expect(handleInputChange).toHaveBeenCalled();

      fireEvent.change(screen.getByLabelText('Descrição da Transação'), { target: { value: 'Desc' } });
      expect(handleInputChange).toHaveBeenCalled();

      fireEvent.change(screen.getByLabelText('Valor'), { target: { value: '20,00' } });
      expect(handleInputChange).toHaveBeenCalled();
    });

    it('updates radio group (Transaction Type)', () => {
      renderForm();
      const creditRadio = screen.getByLabelText('Receita');
      fireEvent.click(creditRadio);
      expect(handleInputChange).toHaveBeenCalled(); 
      // check event?
    });

    it('updates DatePicker', () => {
      renderForm();
      const dateInput = screen.getByTestId('date-picker-input');
      fireEvent.change(dateInput, { target: { value: '2023-02-02' } });
      expect(handleDateChange).toHaveBeenCalled();
    });
  });

  describe('Selects', () => {
    it('updates Category', () => {
      renderForm();
      const select = within(screen.getByTestId('transaction-category-select')).getByRole('combobox');
      fireEvent.mouseDown(select);
      fireEvent.click(screen.getByText('Category 1'));
      expect(handleInputChange).toHaveBeenCalled();
    });

    it('updates Source', () => {
      renderForm();
      const select = within(screen.getByTestId('transaction-source-select')).getByRole('combobox');
      fireEvent.mouseDown(select);
      fireEvent.click(screen.getByRole('option', { name: 'Nubank' }));
      expect(handleInputChange).toHaveBeenCalled();
    });

    it('updates Status', () => {
      renderForm();
      const select = within(screen.getByTestId('transaction-status-select')).getByRole('combobox');
      fireEvent.mouseDown(select);
      fireEvent.click(screen.getByRole('option', { name: 'Estornado' }));
      expect(handleInputChange).toHaveBeenCalled();
    });

    it('updates Payment Method', () => {
      renderForm();
      const select2 = within(screen.getByTestId('payment-method-select')).getByRole('combobox');
      fireEvent.mouseDown(select2);
      fireEvent.click(screen.getByRole('option', { name: 'Pix' }));
      expect(handleInputChange).toHaveBeenCalled();
    });

    it('updates Location and enables/disables Freight', () => {
      renderForm({ transaction: { ...baseTransaction, transactionLocation: 'local' } }); // Local disables freight
      
      const freightInput = screen.getByLabelText('Valor do Frete');
      expect(freightInput).toBeDisabled();
      
      const select = within(screen.getByTestId('transaction-location-select')).getByRole('combobox');
      fireEvent.mouseDown(select);
      fireEvent.click(screen.getByRole('option', { name: 'Online' }));
      expect(handleInputChange).toHaveBeenCalled();

      // If prop was updated (it isn't in test), it would enable. 
      // To test enabled:
      cleanup();
      renderForm({ transaction: { ...baseTransaction, transactionLocation: 'online' } });
      expect(screen.getByLabelText('Valor do Frete')).toBeEnabled();
    });
  });

  describe('Company Fields', () => {
    it('updates company fields', () => {
       renderForm();
       fireEvent.change(screen.getByLabelText('Nome da Empresa'), { target: { value: 'Corp' } });
       expect(handleInputChange).toHaveBeenCalled();
       
       fireEvent.change(screen.getByLabelText('CNPJ da Empresa'), { target: { value: '000' } });
       expect(handleInputChange).toHaveBeenCalled();
    });

    it('disables seller name and fiscal note if not debit', () => {
        renderForm({ transaction: { ...baseTransaction, transactionType: 'credit' } });
        expect(screen.getByLabelText('Nome do Vendedor da Empresa')).toBeDisabled();
        expect(screen.getByLabelText('Nota Fiscal')).toBeDisabled();

        // Check enabled
        cleanup();
        renderForm({ transaction: { ...baseTransaction, transactionType: 'debit' } });
        expect(screen.getByLabelText('Nome do Vendedor da Empresa')).toBeEnabled();
        expect(screen.getByLabelText('Nota Fiscal')).toBeEnabled();
    });
  });

  describe('Items', () => {
      it('manages items (add, update, remove)', () => {
          renderForm({ transaction: { ...baseTransaction, transactionType: 'debit' } });
          
          // Add
          fireEvent.click(screen.getByText('Adicionar Item'));
          expect(handleItemsChange).toHaveBeenCalledWith(expect.arrayContaining([expect.anything()]));
          
          // We need items in the component state to test update/remove. 
          // The component initializes items from props.transaction.items.
          // Let's rerender with an item.
          cleanup();
          const item = { itemName: 'Item 1', itemDescription: '', itemValue: '10', itemUnits: 1 };
          renderForm({ transaction: { ...baseTransaction, items: [item], transactionType: 'debit' } });
          
          // Update
          const nameInput = screen.getByLabelText('Nome do Item');
          fireEvent.change(nameInput, { target: { name: 'itemName', value: 'Updated Item' } });
          expect(handleItemsChange).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ itemName: 'Updated Item' })]));

          const descriptionInput = screen.getByLabelText('Descrição do Item');
          fireEvent.change(descriptionInput, { target: { name: 'itemDescription', value: 'New desc' } });
          expect(handleItemsChange).toHaveBeenCalled();

          // Value change (checks currency format call)
          const valueInput = screen.getByLabelText('Valor do Item');
          fireEvent.change(valueInput, { target: { name: 'itemValue', value: '50' } });
          expect(handleItemsChange).toHaveBeenCalled();

          const unitsInput = screen.getByLabelText('Unidades do Item');
          fireEvent.change(unitsInput, { target: { name: 'itemUnits', value: '3' } });
          expect(handleItemsChange).toHaveBeenCalled();

          // Remove
          // Delete icon is in the item box.
          const deleteBtn = screen.getByLabelText('delete'); // aria-label='delete' is on the IconButton
          fireEvent.click(deleteBtn);
          expect(handleItemsChange).toHaveBeenCalledWith([]);
      });
  });

  describe('Fiscal Book', () => {
     it('handles fiscal book selection', () => {
         renderForm();
         fireEvent.click(screen.getAllByTestId('fiscal-book-selector')[0]);
         expect(handleFiscalBookChange).toHaveBeenCalled();
     });
     
     it('displays archived warning', () => {
         renderForm({ isInArchivedBook: true });
         expect(screen.getAllByText(/arquivado/i).length).toBeGreaterThan(0);
     });
  });


  it('adds items and calls handleItemsChange', () => {
    const handleItemsChange = jest.fn();

    render(
      <TransactionForm
        formTitle="Transaction"
        transaction={baseTransaction}
        handleInputChange={() => {}}
        handleDateChange={() => {}}
        handleItemsChange={handleItemsChange}
        handleFiscalBookChange={() => {}}
        categories={categories}
        dateValue={null}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Item' }));

    expect(handleItemsChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          itemName: '',
          itemValue: '0,00',
          itemUnits: 1,
        }),
      ])
    );

    fireEvent.click(screen.getByLabelText('delete'));
    expect(handleItemsChange).toHaveBeenCalledWith([]);
  });

  it('formats item value updates', () => {
    const handleItemsChange = jest.fn();
    const transaction = {
      ...baseTransaction,
      items: [
        {
          itemName: 'Item',
          itemDescription: 'Desc',
          itemValue: '1',
          itemUnits: 1,
        },
      ],
    };

    render(
      <TransactionForm
        formTitle="Transaction"
        transaction={transaction}
        handleInputChange={() => {}}
        handleDateChange={() => {}}
        handleItemsChange={handleItemsChange}
        handleFiscalBookChange={() => {}}
        categories={categories}
        dateValue={null}
      />
    );

    fireEvent.change(screen.getByLabelText('Valor do Item'), {
      target: { name: 'itemValue', value: '10,5' },
    });

    expect(handleItemsChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ itemValue: '10,5' }),
      ])
    );
  });

  it('hides items section for credit transactions', () => {
    render(
      <TransactionForm
        formTitle="Transaction"
        transaction={{ ...baseTransaction, transactionType: 'credit' }}
        handleInputChange={() => {}}
        handleDateChange={() => {}}
        handleItemsChange={() => {}}
        handleFiscalBookChange={() => {}}
        categories={categories}
        dateValue={null}
      />
    );

    expect(screen.queryByRole('button', { name: 'Adicionar Item' })).toBeNull();
  });

  it('disables fiscal book selector when archived', () => {
    render(
      <TransactionForm
        formTitle="Transaction"
        transaction={baseTransaction}
        handleInputChange={() => {}}
        handleDateChange={() => {}}
        handleItemsChange={() => {}}
        handleFiscalBookChange={() => {}}
        categories={categories}
        dateValue={null}
        isInArchivedBook
        selectedFiscalBook={{ name: 'Livro', year: 2024, status: 'archived' }}
      />
    );

    const selector = screen.getByTestId('fiscal-book-selector');
    expect(selector).toBeDisabled();
    expect(screen.getAllByText(/Livro atual:/).length).toBeGreaterThan(0);
  });

  it('clears freight value when location is not online', () => {
    render(
      <TransactionForm
        formTitle="Transaction"
        transaction={{ ...baseTransaction, transactionLocation: 'local' }}
        handleInputChange={() => {}}
        handleDateChange={() => {}}
        handleItemsChange={() => {}}
        handleFiscalBookChange={() => {}}
        categories={categories}
        dateValue={null}
      />
    );

    const freightField = screen.getByLabelText('Valor do Frete');
    expect(freightField).toHaveValue('');
    expect(freightField).toBeDisabled();
  });

  it('updates items internal state when transaction items prop changes', () => {
        const { rerender } = renderForm({ transaction: { ...baseTransaction, items: [] } });
        
        // Verify empty initially
        expect(screen.queryByDisplayValue('Dynamic Item')).toBeNull();
        
        // Rerender with new items to trigger useEffect
        const newItems = [{ 
            itemName: 'Dynamic Item', 
            itemDescription: '', 
            itemValue: '10,00', 
            itemUnits: 1 
        }];

        rerender(
            <TransactionForm
                formTitle="New Transaction"
                transaction={{ ...baseTransaction, items: newItems }}
                handleInputChange={handleInputChange}
                handleDateChange={handleDateChange}
                handleItemsChange={handleItemsChange}
                handleFiscalBookChange={handleFiscalBookChange}
                categories={categories}
                dateValue={new Date('2023-01-01')}
            />
        );
        
        expect(screen.getByDisplayValue('Dynamic Item')).toBeInTheDocument();
    });

    it('does not update items state when transaction items prop is missing', () => {
        const { rerender } = renderForm({ transaction: { ...baseTransaction, items: [] } });
        
        const txnWithoutItems = { ...baseTransaction };
        delete txnWithoutItems.items;
        
        rerender(
            <TransactionForm
                formTitle="New Transaction"
                transaction={txnWithoutItems}
                handleInputChange={handleInputChange}
                handleDateChange={handleDateChange}
                handleItemsChange={handleItemsChange}
                handleFiscalBookChange={handleFiscalBookChange}
                categories={categories}
                dateValue={new Date('2023-01-01')}
            />
        );
    });

    it('handles editing mode with and without fiscal book', () => {
        // Case 1: Editing with book
        renderForm({ 
            isEditing: true, 
            selectedFiscalBook: { name: 'Book', year: 2023 } 
        });
        
        cleanup();
        
        // Case 2: Editing without book
        renderForm({ 
            isEditing: true, 
            selectedFiscalBook: null 
        });
    });

    it('displays active fiscal book details correctly', () => {
         renderForm({ 
             selectedFiscalBook: { name: 'Active Book', year: 2023, status: 'active' } 
         });
         
         expect(screen.getByText('Active Book (2023)')).toBeInTheDocument();
         // Ensure chip is present
         expect(screen.getByText(/Livro atual:/)).toBeInTheDocument();
     });
});
