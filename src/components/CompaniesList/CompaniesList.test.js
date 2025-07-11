import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CompaniesList from './CompaniesList';
import localStorage from 'local-storage';
import {
  findAllCompanies,
  deleteCompanyById,
  deleteCompaniesByIds,
} from '../../services/companyService';

jest.mock('local-storage', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock('../../services/companyService', () => ({
  findAllCompanies: jest.fn(),
  deleteCompanyById: jest.fn(),
  deleteCompaniesByIds: jest.fn(),
}));

jest.mock('../../ui/LoadingIndicator', () => () => <div data-testid="loading" />);

describe('CompaniesList', () => {
  const theme = createTheme();
  const companies = [
    {
      id: '1',
      companyName: 'Alpha Inc',
      companyCnpj: '12345678000199',
      tradeName: 'Alpha Trade',
      status: 'Ativa',
      companyType: 'Matriz',
      microEntrepreneurOption: true,
      address: { city: 'Sao Paulo', state: 'SP' },
    },
    {
      id: '2',
      companyName: 'Beta LLC',
      companyCnpj: '98765432000111',
      status: 'Inativa',
      address: { city: 'Rio', state: 'RJ' },
    },
    {
      id: '3',
      companyName: 'Gamma Ltd',
      companyCnpj: '11122233000155',
      status: 'Suspensa',
    },
    {
      id: '4',
      companyName: 'Delta SA',
      companyCnpj: '',
      status: 'Baixada',
    },
    {
      id: '5',
      companyName: 'Epsilon GmbH',
      companyCnpj: '33344455000177',
      status: 'Outra',
    },
  ];

  const renderList = () => {
    return render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <CompaniesList />
        </MemoryRouter>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true);
  });

  it('initializes from local storage when available', () => {
    localStorage.get.mockImplementation((key) => {
      if (key === 'fullCompaniesList') return companies;
      if (key === 'companiesPrintList') return companies;
      if (key === 'companySearchTerm') return 'Alpha';
      return null;
    });

    renderList();

    expect(findAllCompanies).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Alpha Inc')).toBeInTheDocument();
  });

  it('fetches companies when local storage is empty', async () => {
    localStorage.get.mockReturnValue(null);
    findAllCompanies.mockResolvedValue({ data: companies });

    renderList();

    await waitFor(() => {
      expect(findAllCompanies).toHaveBeenCalled();
      expect(screen.getByText('Alpha Inc')).toBeInTheDocument();
    });

    expect(screen.getByText(/12\.345\.678\/0001-99/)).toBeInTheDocument();
    expect(localStorage.set).toHaveBeenCalledWith('fullCompaniesList', companies);
  });

  it('logs errors when fetching companies fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.get.mockReturnValue(null);
    findAllCompanies.mockRejectedValueOnce(new Error('fail'));

    renderList();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('filters companies by search term', async () => {
    localStorage.get.mockReturnValue(null);
    findAllCompanies.mockResolvedValue({ data: companies });

    renderList();

    await waitFor(() => {
      expect(screen.getByText('Alpha Inc')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nome, CNPJ, cidade...');
    fireEvent.change(searchInput, { target: { value: 'Rio' } });

    await waitFor(() => {
      expect(screen.getByText('Beta LLC')).toBeInTheDocument();
      expect(screen.queryByText('Alpha Inc')).toBeNull();
    });
  });

  it('shows empty state when no companies match search', async () => {
    localStorage.get.mockImplementation((key) => {
      if (key === 'fullCompaniesList') return companies;
      if (key === 'companiesPrintList') return [];
      if (key === 'companySearchTerm') return 'ZZZ';
      return null;
    });

    renderList();

    await waitFor(() => {
      expect(screen.getByText('Nenhuma empresa encontrada')).toBeInTheDocument();
      expect(screen.getByText('Tente ajustar os termos de busca')).toBeInTheDocument();
    });
  });

  it('removes a company after confirmation', async () => {
    localStorage.get.mockReturnValue(null);
    findAllCompanies.mockResolvedValue({ data: companies });
    deleteCompanyById.mockResolvedValue({});

    renderList();

    await waitFor(() => {
      expect(screen.getByText('Alpha Inc')).toBeInTheDocument();
    });

    const listItem = screen.getByText('Alpha Inc').closest('li');
    const buttons = listItem.querySelectorAll('button');
    const deleteButton = buttons[buttons.length - 1];

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteCompanyById).toHaveBeenCalledWith('1');
    });

    expect(localStorage.remove).toHaveBeenCalledWith('companySearchTerm');
  });

  it('skips deletion when confirmation is denied', async () => {
    localStorage.get.mockReturnValue(null);
    findAllCompanies.mockResolvedValue({ data: companies });
    window.confirm = jest.fn(() => false);

    renderList();

    await waitFor(() => {
      expect(screen.getByText('Alpha Inc')).toBeInTheDocument();
    });

    const listItem = screen.getByText('Alpha Inc').closest('li');
    const buttons = listItem.querySelectorAll('button');
    const deleteButton = buttons[buttons.length - 1];

    fireEvent.click(deleteButton);

    expect(deleteCompanyById).not.toHaveBeenCalled();
  });

  it('removes selected companies', async () => {
    localStorage.get.mockReturnValue(null);
    findAllCompanies.mockResolvedValue({ data: companies });
    deleteCompaniesByIds.mockResolvedValue({});

    renderList();

    await waitFor(() => {
      expect(screen.getByText('Alpha Inc')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    const deleteSelectedButton = await screen.findByRole('button', {
      name: 'Excluir Selecionadas (1)',
    });

    fireEvent.click(deleteSelectedButton);

    await waitFor(() => {
      expect(deleteCompaniesByIds).toHaveBeenCalledWith(['1']);
    });
  });

  it('toggles selected companies', async () => {
    localStorage.get.mockReturnValue(null);
    findAllCompanies.mockResolvedValue({ data: companies });

    renderList();

    await waitFor(() => {
      expect(screen.getByText('Alpha Inc')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(
      screen.getByRole('button', { name: 'Excluir Selecionadas (1)' })
    ).toBeInTheDocument();

    fireEvent.click(checkboxes[0]);

    expect(
      screen.queryByRole('button', { name: /Excluir Selecionadas/i })
    ).toBeNull();
  });
});
