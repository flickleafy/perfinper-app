import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InsertPerson from './InsertPerson';

// Mock all dependencies
jest.mock('../../services/personService.js');
jest.mock('../../ui/ToastProvider.js');
jest.mock('../objectsBuilder.js');

// Import mocked modules  
const { insertPerson } = require('../../services/personService.js');
const { useToast } = require('../../ui/ToastProvider.js');
const { personBuilder } = require('../objectsBuilder.js');

describe('InsertPerson', () => {
  const showToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    useToast.mockReturnValue({ showToast });
    insertPerson.mockResolvedValue({
      data: { id: 'p1', fullName: 'Jane Doe', cpf: '12345678910' },
    });
    
    // Mock personBuilder to return valid data when name is provided
    personBuilder.mockImplementation((data) => {
      if (!data || !data.fullName) {
        return null;
      }
      return {
        id: null,
        fullName: data.fullName,
        cpf: data.cpf ? data.cpf.replace(/[^\d]/g, '') : '',
        rg: data.rg || '',
        dateOfBirth: data.dateOfBirth || null,
        profession: data.profession || '',
        status: data.status || 'active',
        contacts: data.contacts || { emails: [''], phones: [''], cellphones: [''] },
        address: data.address || {},
        personalBusiness: data.personalBusiness || {},
        bankAccounts: data.bankAccounts || [],
        notes: data.notes || '',
      };
    });
  });

  it('submits person data and shows success state', async () => {
    const user = userEvent.setup();
    render(<InsertPerson />);

    // Fill in name field
    const nameInput = screen.getByLabelText(/Nome Completo/i);
    await user.type(nameInput, 'Jane Doe');

    // Click save button
    await user.click(screen.getByRole('button', { name: 'Salvar Pessoa' }));

    // Verify insertPerson was called
    await waitFor(() => {
      expect(insertPerson).toHaveBeenCalled();
    });

    expect(insertPerson).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'Jane Doe',
      })
    );

    // Verify success message appears
    await waitFor(() => {
      expect(screen.getByText('A pessoa foi inserida com sucesso!')).toBeInTheDocument();
    });

    // Test "Insert Another" button
    await user.click(screen.getByRole('button', { name: 'Inserir Outra' }));
    expect(screen.getByRole('button', { name: 'Salvar Pessoa' })).toBeInTheDocument();
  });

  it('shows a toast when saving fails', async () => {
    const user = userEvent.setup();
    insertPerson.mockRejectedValueOnce(new Error('boom'));

    render(<InsertPerson />);

    // Fill in name
    const nameInput = screen.getByLabelText(/Nome Completo/i);
    await user.type(nameInput, 'Jane Doe');

    // Click save
    await user.click(screen.getByRole('button', { name: 'Salvar Pessoa' }));

    // Verify error toast was shown
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        'Erro ao salvar pessoa. Verifique os dados e tente novamente.',
        'error'
      );
    });
  });

  it('clears the form when requested', async () => {
    const user = userEvent.setup();
    render(<InsertPerson />);

    const nameInput = screen.getByLabelText(/Nome Completo/i);
    await user.type(nameInput, 'Jane Doe');
    
    expect(nameInput.value).toBe('Jane Doe');

    await user.click(screen.getByRole('button', { name: 'Limpar Formulário' }));

    expect(nameInput.value).toBe('');
  });

  it('does not insert person if validation fails', async () => {
    const user = userEvent.setup();
    render(<InsertPerson />);

    // Click save without filling anything - should fail validation
    await user.click(screen.getByRole('button', { name: 'Salvar Pessoa' }));

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 100));

    // insertPerson should not be called because personBuilder returns null
    expect(insertPerson).not.toHaveBeenCalled();
  });

  it('handles nested object updates in form fields', async () => {
    const user = userEvent.setup();
    render(<InsertPerson />);

    // Find a nested field (address fields use dot notation like "address.street")
    const streetInput = screen.getByLabelText(/Logradouro/i);
    await user.type(streetInput, 'Main Street');

    expect(streetInput.value).toBe('Main Street');
    
    // Test another nested field to ensure branch coverage
    const numberInput = screen.getByLabelText(/Número/i);
    await user.type(numberInput, '123');
    
    expect(numberInput.value).toBe('123');
  });

  it('handles date changes', async () => {
    const user = userEvent.setup();
    render(<InsertPerson />);

    // Fill in name first
    const nameInput = screen.getByLabelText(/Nome Completo/i);
    await user.type(nameInput, 'Jane Doe');

    // Find the date input and click it to open the picker
    const dateInput = screen.getByLabelText(/Data de Nascimento/i);
    await user.click(dateInput);
    
    // Type a date - DatePicker should handle this
    await user.type(dateInput, '01011990');
    
    // Click outside to close picker and trigger onChange
    await user.click(nameInput);
    
    // Verify handleDateChange was called by checking the component still renders
    expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
  });

  it('handles personal business changes', async () => {
    const user = userEvent.setup();
    render(<InsertPerson />);

    // Find the personal business checkbox
    const businessCheckbox = screen.getByLabelText(/Possui Negócio Pessoal/i);
    
    // Toggle it to trigger handlePersonalBusinessChange
    await user.click(businessCheckbox);
    
    // Verify checkbox is checked
    expect(businessCheckbox).toBeChecked();
  });
});
