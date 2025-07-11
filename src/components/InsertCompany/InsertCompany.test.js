import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InsertCompany from './InsertCompany';
import { insertCompany } from '../../services/companyService.js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../ui/ToastProvider.js';
import * as objectsBuilder from '../objectsBuilder.js';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../../services/companyService.js', () => ({
  insertCompany: jest.fn(),
}));

jest.mock('../../ui/ToastProvider.js', () => ({
  useToast: jest.fn(),
}));

jest.mock('../CompanyForm.js', () => ({
  __esModule: true,
  default: ({
    company,
    handleInputChange,
    handleDateChange,
    handleContactsChange,
    handleActivitiesChange,
    handleCorporateStructureChange,
  }) => (
    <div>
      <div data-testid="company-name">{company.companyName}</div>
      <div data-testid="contact-email">{company.contacts?.email}</div>
      <div data-testid="foundation-date">
        {company.foundationDate ? company.foundationDate.toISOString() : ''}
      </div>
      <div data-testid="activities-code">
        {company.activities?.primary?.code || ''}
      </div>
      <div data-testid="structure-count">
        {company.corporateStructure?.length || 0}
      </div>
      <button
        type="button"
        onClick={() =>
          handleInputChange({
            target: { name: 'companyName', value: 'Acme' },
          })
        }
      >
        Set Name
      </button>
      <button
        type="button"
        onClick={() =>
          handleInputChange({
            target: { name: 'contacts.email', value: 'acme@example.com' },
          })
        }
      >
        Set Contact Email
      </button>
      <button
        type="button"
        onClick={() =>
          handleDateChange('foundationDate', new Date('2020-01-01T00:00:00.000Z'))
        }
      >
        Set Foundation Date
      </button>
      <button
        type="button"
        onClick={() =>
          handleContactsChange({
            email: 'contact@acme.com',
            phones: ['123'],
            website: '',
            socialMedia: [],
          })
        }
      >
        Set Contacts
      </button>
      <button
        type="button"
        onClick={() =>
          handleActivitiesChange({
            primary: { code: '01', description: 'Retail' },
            secondary: [],
          })
        }
      >
        Set Activities
      </button>
      <button
        type="button"
        onClick={() =>
          handleCorporateStructureChange([{ name: 'Owner', role: 'CEO' }])
        }
      >
        Set Structure
      </button>
    </div>
  ),
}));

describe('InsertCompany', () => {
  const navigate = jest.fn();
  const showToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(navigate);
    useToast.mockReturnValue({ showToast });
    insertCompany.mockResolvedValue({ data: { id: 'c1', companyName: 'Acme' } });
  });

  it('submits company data and shows success state', async () => {
    render(<InsertCompany />);

    fireEvent.click(screen.getByText('Set Name'));
    fireEvent.click(screen.getByText('Set Contact Email'));
    fireEvent.click(screen.getByText('Set Foundation Date'));
    fireEvent.click(screen.getByText('Set Contacts'));
    fireEvent.click(screen.getByText('Set Activities'));
    fireEvent.click(screen.getByText('Set Structure'));

    expect(screen.getByTestId('company-name')).toHaveTextContent('Acme');
    expect(screen.getByTestId('contact-email')).toHaveTextContent(
      'contact@acme.com'
    );
    expect(screen.getByTestId('foundation-date')).not.toHaveTextContent('');
    expect(screen.getByTestId('activities-code')).toHaveTextContent('01');
    expect(screen.getByTestId('structure-count')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Empresa' }));

    await waitFor(() => {
      expect(insertCompany).toHaveBeenCalledWith(
        expect.objectContaining({
          companyName: 'Acme',
          contacts: expect.objectContaining({ email: 'contact@acme.com' }),
          activities: expect.objectContaining({
            primary: expect.objectContaining({ code: '01' }),
          }),
          corporateStructure: [
            expect.objectContaining({ name: 'Owner', role: 'CEO' }),
          ],
        })
      );
    });

    expect(
      screen.getByText('A empresa foi inserida com sucesso!')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Inserir Outra' }));

    expect(
      screen.getByRole('button', { name: 'Salvar Empresa' })
    ).toBeInTheDocument();
  });

  it('shows a toast when the save fails', async () => {
    insertCompany.mockRejectedValueOnce(new Error('boom'));

    render(<InsertCompany />);

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Empresa' }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        'Erro ao salvar empresa. Verifique os dados e tente novamente.',
        'error'
      );
    });
  });

  it('navigates back to the company list', () => {
    render(<InsertCompany />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Voltar para Lista de Empresas' })
    );

    expect(navigate).toHaveBeenCalledWith('/empresas');
  });

  it('clears the form when requested', () => {
    render(<InsertCompany />);

    fireEvent.click(screen.getByText('Set Name'));
    fireEvent.click(screen.getByRole('button', { name: 'Limpar Formulário' }));

    expect(screen.getByTestId('company-name')).toHaveTextContent('');
  });

  it('skips submit when builder returns null', () => {
    jest.spyOn(objectsBuilder, 'companyBuilder').mockReturnValueOnce(null);

    render(<InsertCompany />);

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Empresa' }));

    expect(insertCompany).not.toHaveBeenCalled();
    objectsBuilder.companyBuilder.mockRestore();
  });
});
