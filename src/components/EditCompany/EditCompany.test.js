import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditCompany from './EditCompany';
import { useParams, useNavigate } from 'react-router-dom';
import { companyBuilder } from '../objectsBuilder';
import { findCompanyById, updateCompanyById } from '../../services/companyService';
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
  companyBuilder: jest.fn(),
}));

jest.mock('../../services/companyService', () => ({
  findCompanyById: jest.fn(),
  updateCompanyById: jest.fn(),
}));

jest.mock('../CompanyForm.js', () => (props) => (
  <div>
    <div data-testid="company-name">{props.company.companyName || ''}</div>
    <button onClick={() => props.handleInputChange({ target: { name: 'companyName', value: 'Nova Empresa' } })}>
      change-name
    </button>
    <button onClick={() => props.handleInputChange({ target: { name: 'address.city', value: 'Nova Cidade' } })}>
      change-city
    </button>
    <button onClick={() => props.handleDateChange('foundationDate', '2024-01-01')}>
      change-date
    </button>
    <button onClick={() => props.handleContactsChange({ email: 'test@example.com' })}>
      change-contacts
    </button>
    <button onClick={() => props.handleActivitiesChange({ primary: { code: '123', description: 'Atividade' } })}>
      change-activities
    </button>
    <button onClick={() => props.handleCorporateStructureChange([{ name: 'Partner' }])}>
      change-structure
    </button>
  </div>
));

jest.mock('../../ui/ToastProvider', () => ({
  useToast: jest.fn(),
}));

describe('EditCompany', () => {
  const mockNavigate = jest.fn();
  const showToast = jest.fn();
  const baseCompany = {
    id: 'company-1',
    companyName: 'Acme',
    address: { city: 'Old City' },
    contacts: { email: '' },
    activities: { primary: { code: '', description: '' } },
    corporateStructure: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useToast.mockReturnValue({ showToast });
  });

  it('shows loading state when no id is provided', () => {
    useParams.mockReturnValue({});

    render(<EditCompany />);

    expect(screen.getByText('Carregando dados da empresa...')).toBeInTheDocument();
    expect(findCompanyById).not.toHaveBeenCalled();
  });

  it('loads company data, updates fields, and submits', async () => {
    useParams.mockReturnValue({ id: 'company-1' });
    findCompanyById.mockResolvedValue({ data: baseCompany });
    companyBuilder.mockImplementation((company) => company);
    updateCompanyById.mockResolvedValue({ data: { ...baseCompany, companyName: 'Nova Empresa' } });

    render(<EditCompany />);

    await waitFor(() => {
      expect(screen.getByText('Atualizar Empresa')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'change-name' }));
    fireEvent.click(screen.getByRole('button', { name: 'change-city' }));
    fireEvent.click(screen.getByRole('button', { name: 'change-date' }));
    fireEvent.click(screen.getByRole('button', { name: 'change-contacts' }));
    fireEvent.click(screen.getByRole('button', { name: 'change-activities' }));
    fireEvent.click(screen.getByRole('button', { name: 'change-structure' }));

    await waitFor(() => {
      expect(screen.getByTestId('company-name')).toHaveTextContent('Nova Empresa');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Atualizar Empresa' }));

    await waitFor(() => {
      expect(updateCompanyById).toHaveBeenCalledWith(
        'company-1',
        expect.objectContaining({
          companyName: 'Nova Empresa',
          address: expect.objectContaining({ city: 'Nova Cidade' }),
          foundationDate: '2024-01-01',
          contacts: { email: 'test@example.com' },
          activities: { primary: { code: '123', description: 'Atividade' } },
          corporateStructure: [{ name: 'Partner' }],
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('A empresa foi atualizada com sucesso!')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Voltar para Lista' }));
    expect(mockNavigate).toHaveBeenCalledWith('/empresas');
  });

  it('handles load failure', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    useParams.mockReturnValue({ id: 'company-1' });
    findCompanyById.mockRejectedValue(new Error('fail'));

    render(<EditCompany />);

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Erro ao carregar dados da empresa', 'error');
    });

    expect(screen.getByText('Atualizar Empresa')).toBeInTheDocument();
    console.error.mockRestore();
  });

  it('handles update failure', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    useParams.mockReturnValue({ id: 'company-1' });
    findCompanyById.mockResolvedValue({ data: baseCompany });
    companyBuilder.mockImplementation((company) => company);
    updateCompanyById.mockRejectedValue(new Error('fail'));

    render(<EditCompany />);

    await waitFor(() => {
      expect(screen.getByText('Atualizar Empresa')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Atualizar Empresa' }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        'Erro ao atualizar empresa. Verifique os dados e tente novamente.',
        'error'
      );
    });
    console.error.mockRestore();
  });

  it('navigates back on cancel', async () => {
    useParams.mockReturnValue({ id: 'company-1' });
    findCompanyById.mockResolvedValue({ data: baseCompany });

    render(<EditCompany />);

    await waitFor(() => {
      expect(screen.getByText('Atualizar Empresa')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(mockNavigate).toHaveBeenCalledWith('/empresas');
  });
});
