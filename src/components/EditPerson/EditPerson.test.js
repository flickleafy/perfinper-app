import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditPerson from './EditPerson';
import { useParams, useNavigate } from 'react-router-dom';
import { personBuilder } from '../objectsBuilder';
import { findPersonById, updatePersonById } from '../../services/personService';
import { useToast } from '../../ui/ToastProvider';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useParams: jest.fn(),
    useNavigate: jest.fn(),
  };
});

jest.mock('../objectsBuilder', () => ({
  personBuilder: jest.fn(),
}));

jest.mock('../../services/personService', () => ({
  findPersonById: jest.fn(),
  updatePersonById: jest.fn(),
}));

jest.mock('../PersonForm.js', () => (props) => (
  <div>
    <div data-testid="person-name">{props.person.fullName || ''}</div>
    <button onClick={() => props.handleInputChange({ target: { name: 'fullName', value: 'New Name' } })}>
      change-name
    </button>
    <button onClick={() => props.handleInputChange({ target: { name: 'address.city', value: 'Nova Cidade' } })}>
      change-city
    </button>
    <button onClick={() => props.handleDateChange('dateOfBirth', '1990-01-01')}>
      change-date
    </button>
    <button onClick={() => props.handleContactsChange({ emails: ['a@example.com'] })}>
      change-contacts
    </button>
    <button onClick={() => props.handlePersonalBusinessChange({ hasPersonalBusiness: true, businessName: 'Biz' })}>
      change-business
    </button>
  </div>
));

jest.mock('../../ui/ToastProvider', () => ({
  useToast: jest.fn(),
}));

describe('EditPerson', () => {
  const mockNavigate = jest.fn();
  const showToast = jest.fn();
  const basePerson = {
    id: 'person-1',
    fullName: 'Jane Doe',
    address: { city: 'Old City' },
    contacts: { emails: [''] },
    personalBusiness: { hasPersonalBusiness: false },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useToast.mockReturnValue({ showToast });
  });

  it('shows loading state when no id is provided', () => {
    useParams.mockReturnValue({});

    render(<EditPerson />);

    expect(screen.getByText('Carregando dados da pessoa...')).toBeInTheDocument();
    expect(findPersonById).not.toHaveBeenCalled();
  });

  it('loads person data, updates fields, and submits', async () => {
    useParams.mockReturnValue({ id: 'person-1' });
    findPersonById.mockResolvedValue({ data: basePerson });
    personBuilder.mockImplementation((person) => person);
    updatePersonById.mockResolvedValue({ data: { ...basePerson, fullName: 'New Name' } });

    render(<EditPerson />);

    await waitFor(() => {
      expect(screen.getByText('Atualizar Pessoa')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'change-name' }));
    fireEvent.click(screen.getByRole('button', { name: 'change-city' }));
    fireEvent.click(screen.getByRole('button', { name: 'change-date' }));
    fireEvent.click(screen.getByRole('button', { name: 'change-contacts' }));
    fireEvent.click(screen.getByRole('button', { name: 'change-business' }));

    await waitFor(() => {
      expect(screen.getByTestId('person-name')).toHaveTextContent('New Name');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Atualizar Pessoa' }));

    await waitFor(() => {
      expect(updatePersonById).toHaveBeenCalledWith(
        'person-1',
        expect.objectContaining({
          fullName: 'New Name',
          address: expect.objectContaining({ city: 'Nova Cidade' }),
          dateOfBirth: '1990-01-01',
          contacts: { emails: ['a@example.com'] },
          personalBusiness: { hasPersonalBusiness: true, businessName: 'Biz' },
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('A pessoa foi atualizada com sucesso!')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Voltar para Lista' }));
    expect(mockNavigate).toHaveBeenCalledWith('/pessoas');
  });

  it('handles load failure', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    useParams.mockReturnValue({ id: 'person-1' });
    findPersonById.mockRejectedValue(new Error('fail'));

    render(<EditPerson />);

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Erro ao carregar dados da pessoa', 'error');
    });

    expect(screen.getByText('Atualizar Pessoa')).toBeInTheDocument();
    console.error.mockRestore();
  });

  it('handles update failure', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    useParams.mockReturnValue({ id: 'person-1' });
    findPersonById.mockResolvedValue({ data: basePerson });
    personBuilder.mockImplementation((person) => person);
    updatePersonById.mockRejectedValue(new Error('fail'));

    render(<EditPerson />);

    await waitFor(() => {
      expect(screen.getByText('Atualizar Pessoa')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Atualizar Pessoa' }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        'Erro ao atualizar pessoa. Verifique os dados e tente novamente.',
        'error'
      );
    });
    console.error.mockRestore();
  });

  it('navigates back on cancel', async () => {
    useParams.mockReturnValue({ id: 'person-1' });
    findPersonById.mockResolvedValue({ data: basePerson });

    render(<EditPerson />);

    await waitFor(() => {
      expect(screen.getByText('Atualizar Pessoa')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(mockNavigate).toHaveBeenCalledWith('/pessoas');
  });
});
