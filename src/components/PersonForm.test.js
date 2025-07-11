import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import PersonForm from './PersonForm';

// Mock LocalizationProvider to avoid needing date-fns setup in tests
jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }) => <div>{children}</div>,
}));

// Mock DatePicker since it's complex to test directly
jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label, onChange, value, slotProps }) => {
    const inputProps = slotProps?.textField?.inputProps || {};
    return (
      <input
        data-testid="date-picker-input"
        aria-label={inputProps['aria-label'] || label}
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        {...inputProps}
      />
    );
  },
}));

describe('PersonForm', () => {
  const basePerson = {
    fullName: '',
    cpf: '',
    rg: '',
    dateOfBirth: null,
    profession: '',
    status: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      zipCode: '',
      city: '',
      state: '',
    },
    contacts: {
      phones: [''],
      emails: [''],
      cellphones: [''],
    },
    personalBusiness: {
      hasPersonalBusiness: false,
      isFormalized: false,
      businessName: '',
      businessType: '',
      businessCategory: '',
      mei: '',
      businessDescription: '',
      workingHours: '',
      serviceArea: '',
      averageMonthlyRevenue: 0,
      businessNotes: '',
    },
    notes: '',
  };

  const handleInputChange = jest.fn();
  const handleDateChange = jest.fn();
  const handleContactsChange = jest.fn();
  const handlePersonalBusinessChange = jest.fn();

  const renderForm = (props = {}) => {
    return render(
      <PersonForm
        formTitle="Cadastro de Pessoa"
        person={basePerson}
        handleInputChange={handleInputChange}
        handleDateChange={handleDateChange}
        handleContactsChange={handleContactsChange}
        handlePersonalBusinessChange={handlePersonalBusinessChange}
        {...props}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Information', () => {
    it('updates text fields correctly', () => {
      renderForm();

      fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'John Doe' } });
      expect(handleInputChange).toHaveBeenCalled();

      fireEvent.change(screen.getByLabelText(/CPF/i), { target: { value: '123.456.789-00' } });
      expect(handleInputChange).toHaveBeenCalled();

      fireEvent.change(screen.getByLabelText(/RG/i), { target: { value: '12.345.678-9' } });
      expect(handleInputChange).toHaveBeenCalled();

      fireEvent.change(screen.getByLabelText(/Profissão/i), { target: { value: 'Engineer' } });
      expect(handleInputChange).toHaveBeenCalled();
    });

    it('updates date of birth', () => {
      renderForm();
      const dateInput = screen.getByTestId('date-picker-input');
      fireEvent.change(dateInput, { target: { value: '2000-01-01' } });
      expect(handleDateChange).toHaveBeenCalledWith('dateOfBirth', '2000-01-01');
    });

    it('updates status', () => {
      renderForm();
      const statusSelect = within(screen.getByTestId('status-select')).getByRole('combobox');
      fireEvent.mouseDown(statusSelect);
      const option = screen.getByRole('option', { name: /^Ativo$/i }); 
      fireEvent.click(option);
      expect(handleInputChange).toHaveBeenCalled();
    });
  });

  describe('Address Information', () => {
    it('updates address fields correctly', () => {
      renderForm();
      
      fireEvent.click(screen.getByText('Endereço'));

      fireEvent.change(screen.getByLabelText(/Logradouro/i), { target: { value: 'Main St' } });
      expect(handleInputChange).toHaveBeenCalled();

      fireEvent.change(screen.getByLabelText(/Número/i), { target: { value: '123' } });
      expect(handleInputChange).toHaveBeenCalled();

      fireEvent.change(screen.getByLabelText(/Complemento/i), { target: { value: 'Apt 1' } });
      expect(handleInputChange).toHaveBeenCalled();

      fireEvent.change(screen.getByLabelText(/Bairro/i), { target: { value: 'Downtown' } });
      expect(handleInputChange).toHaveBeenCalled();

      fireEvent.change(screen.getByLabelText(/CEP/i), { target: { value: '12345-678' } });
      expect(handleInputChange).toHaveBeenCalled();

      fireEvent.change(screen.getByLabelText(/Cidade/i), { target: { value: 'Metropolis' } });
      expect(handleInputChange).toHaveBeenCalled();

      fireEvent.change(screen.getByLabelText(/Estado/i), { target: { value: 'NY' } });
      expect(handleInputChange).toHaveBeenCalled();
    });
  });

  describe('Contact Information', () => {
    it('manages emails (add, update, remove)', () => {
      renderForm();
      fireEvent.click(screen.getByText('Contatos'));

      // Add
      fireEvent.click(screen.getByTestId('add-email-btn'));
      expect(handleContactsChange).toHaveBeenCalled();

      // Update existing
      fireEvent.change(screen.getByLabelText('Email 1'), { target: { value: 'test@example.com' } });
      // emails was ['', ''] after Add. Now ['test@example.com', '']
      expect(handleContactsChange).toHaveBeenCalledWith(expect.objectContaining({ emails: ['test@example.com', ''] }));

      // Remove
      const input = screen.getByLabelText('Email 1');
      const row = input.closest('.MuiTextField-root').parentElement;
      const deleteBtn = within(row).getByTestId('DeleteIcon').closest('button');
      fireEvent.click(deleteBtn);
      
      // Removed index 0. Remaining is ['']
      expect(handleContactsChange).toHaveBeenCalledWith(expect.objectContaining({ emails: [''] }));
    });

    it('manages phones (add, update, remove)', () => {
        renderForm();
        fireEvent.click(screen.getByText('Contatos'));
  
        // Add
        fireEvent.click(screen.getByTestId('add-phone-btn'));
        expect(handleContactsChange).toHaveBeenCalled();

        // Update
        fireEvent.change(screen.getByLabelText('Telefone 1'), { target: { value: '123456' } });
        expect(handleContactsChange).toHaveBeenCalledWith(expect.objectContaining({ phones: ['123456', ''] }));

        // Remove
        const input = screen.getByLabelText('Telefone 1');
        const row = input.closest('.MuiTextField-root').parentElement;
        const deleteBtn = within(row).getByTestId('DeleteIcon').closest('button');
        fireEvent.click(deleteBtn);
        // Base was 1 empty. Add -> 2. Remove index 0 -> 1 empty.
        expect(handleContactsChange).toHaveBeenCalledWith(expect.objectContaining({ phones: [''] }));
    });

    it('manages cellphones (add, update, remove)', () => {
        renderForm();
        fireEvent.click(screen.getByText('Contatos'));

        // Add
        fireEvent.click(screen.getByTestId('add-cellphone-btn'));
        expect(handleContactsChange).toHaveBeenCalled();

        // Update
        fireEvent.change(screen.getByLabelText('Celular 1'), { target: { value: '987654' } });
        expect(handleContactsChange).toHaveBeenCalledWith(expect.objectContaining({ cellphones: ['987654', ''] }));

        // Remove
        const input = screen.getByLabelText('Celular 1');
        const row = input.closest('.MuiTextField-root').parentElement;
        const deleteBtn = within(row).getByTestId('DeleteIcon').closest('button');
        fireEvent.click(deleteBtn);
        expect(handleContactsChange).toHaveBeenCalledWith(expect.objectContaining({ cellphones: [''] }));
    });
  });

  describe('Personal Business Information', () => {
    it('toggles personal business section', () => {
      renderForm();
      fireEvent.click(screen.getByText('Negócio Pessoal'));
      
      const checkbox = screen.getByLabelText('Possui negócio pessoal');
      fireEvent.click(checkbox);
      
      expect(handlePersonalBusinessChange).toHaveBeenCalledWith(
        expect.objectContaining({ hasPersonalBusiness: true })
      );
    });

    it('updates business fields when enabled', () => {
      const businessPerson = {
        ...basePerson,
        personalBusiness: {
          ...basePerson.personalBusiness,
          hasPersonalBusiness: true,
        },
      };
      
      renderForm({ person: businessPerson });
      fireEvent.click(screen.getByText('Negócio Pessoal'));

      fireEvent.change(screen.getByLabelText('Nome do Negócio'), { target: { value: 'My Biz' } });
      expect(handlePersonalBusinessChange).toHaveBeenCalledWith(expect.objectContaining({ businessName: 'My Biz' }));
      
      // Selects
      const typeSelect = within(screen.getByTestId('business-type-select')).getByRole('combobox');
      fireEvent.mouseDown(typeSelect);
      fireEvent.click(screen.getByRole('option', { name: /Outro/i }));
      expect(handlePersonalBusinessChange).toHaveBeenCalledWith(expect.objectContaining({ businessType: 'other' }));

      const catSelect = within(screen.getByTestId('business-category-select')).getByRole('combobox');
      fireEvent.mouseDown(catSelect);
      fireEvent.click(screen.getByRole('option', { name: /Outro/i }));
      expect(handlePersonalBusinessChange).toHaveBeenCalledWith(expect.objectContaining({ businessCategory: 'other' }));
      
      fireEvent.change(screen.getByLabelText('Descrição do Negócio'), { target: { value: 'Desc' } });
      expect(handlePersonalBusinessChange).toHaveBeenCalled();

      fireEvent.change(screen.getByLabelText('Horário de Funcionamento'), { target: { value: '9-18' } });
      expect(handlePersonalBusinessChange).toHaveBeenCalledWith(expect.objectContaining({ workingHours: '9-18' }));

      fireEvent.change(screen.getByLabelText('Área de Atendimento'), { target: { value: 'SP' } });
      expect(handlePersonalBusinessChange).toHaveBeenCalledWith(expect.objectContaining({ serviceArea: 'SP' }));

      fireEvent.change(screen.getByLabelText('Faturamento Médio Mensal'), { target: { value: '1000' } });
      expect(handlePersonalBusinessChange).toHaveBeenCalledWith(expect.objectContaining({ averageMonthlyRevenue: 1000 }));

      fireEvent.change(screen.getByLabelText('Faturamento Médio Mensal'), { target: { value: '' } });
      expect(handlePersonalBusinessChange).toHaveBeenCalledWith(expect.objectContaining({ averageMonthlyRevenue: 0 }));
    });

    it('handles MEI toggle and field', () => {
        const businessPerson = {
          ...basePerson,
          personalBusiness: {
            ...basePerson.personalBusiness,
            hasPersonalBusiness: true,
            isFormalized: true,
          },
        };
        
        renderForm({ person: businessPerson });
        fireEvent.click(screen.getByText('Negócio Pessoal'));
  
        // Input MEI
        fireEvent.change(screen.getByLabelText('Número MEI'), { target: { value: '123' } });
        expect(handlePersonalBusinessChange).toHaveBeenCalledWith(expect.objectContaining({ mei: '123' }));
        
        // Toggle off
        const checkbox = screen.getByLabelText('Negócio formalizado (MEI)');
        fireEvent.click(checkbox);
        expect(handlePersonalBusinessChange).toHaveBeenCalledWith(expect.objectContaining({ isFormalized: false }));
    });

    it('updates businessNotes', () => {
      const businessPerson = {
        ...basePerson,
        personalBusiness: {
          ...basePerson.personalBusiness,
          hasPersonalBusiness: true,
        },
      };
      
      renderForm({ person: businessPerson });
      fireEvent.click(screen.getByText('Negócio Pessoal'));
      
      fireEvent.change(screen.getByLabelText('Observações do Negócio'), { target: { value: 'Notes' } });
      expect(handlePersonalBusinessChange).toHaveBeenCalledWith(expect.objectContaining({ businessNotes: 'Notes' }));
    });

    it('handles missing optional props gracefully', () => {
        render(
            <PersonForm
              formTitle="Person"
              person={basePerson}
              handleInputChange={() => {}}
              handleDateChange={() => {}}
              // Optional props omitted
            />
        );
        
        // Trigger contact change (useEffect)
        fireEvent.click(screen.getByText('Contatos'));
        fireEvent.click(screen.getByTestId('add-email-btn')); 
        // Should not throw
        
        // Trigger personal business change
        fireEvent.click(screen.getByText('Negócio Pessoal'));
        const checkbox = screen.getByLabelText('Possui negócio pessoal');
        fireEvent.click(checkbox);
        // Should not throw (handlePersonalBusinessFieldChange checks if prop exists)
    });
  });

  describe('Notes', () => {
      it('updates notes', () => {
          renderForm();
          fireEvent.click(screen.getByText('Observações'));
          fireEvent.change(screen.getByLabelText('Observações Gerais'), { target: { value: 'Some notes' } });
          expect(handleInputChange).toHaveBeenCalled();
      });
  });
});
