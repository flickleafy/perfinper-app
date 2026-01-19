import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PeopleList from './PeopleList';
import localStorage from 'local-storage';
import { findAllPeople, deletePersonById } from '../../services/personService.js';

jest.mock('local-storage', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

jest.mock('../../services/personService.js', () => ({
  findAllPeople: jest.fn(),
  deletePersonById: jest.fn(),
}));

jest.mock('../../ui/LoadingIndicator.js', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-indicator" />,
}));

jest.mock('../../ui/SimpleSearchBar.js', () => ({
  __esModule: true,
  default: ({ searchTerm, setSearchTerm, placeholder }) => (
    <input
      data-testid="simple-search"
      placeholder={placeholder}
      value={searchTerm}
      onChange={(event) => setSearchTerm(event.target.value)}
    />
  ),
}));

describe('PeopleList', () => {
  const people = [
    {
      id: 'p1',
      fullName: 'Alice Doe',
      cpf: '12345678901',
      dateOfBirth: '1990-01-01T00:00:00.000Z',
      status: 'Ativo',
      gender: 'Feminino',
      address: { city: 'Sao Paulo', state: 'SP' },
      personalBusiness: {
        hasPersonalBusiness: true,
        businessName: 'Loja da Alice',
        businessCategory: 'Varejo',
        isFormalized: true,
      },
    },
    {
      id: 'p2',
      fullName: 'Bob Smith',
      cpf: '10987654321',
      status: 'Suspenso',
      address: { city: 'Rio', state: 'RJ' },
      personalBusiness: { hasPersonalBusiness: false },
    },
    {
      id: 'p3',
      fullName: 'Carol Green',
      cpf: '22233344455',
      status: 'Inativo',
      address: { city: 'Curitiba', state: 'PR' },
      personalBusiness: { hasPersonalBusiness: true, businessName: 'Studio' },
    },
    {
      id: 'p4',
      fullName: 'Dan Other',
      cpf: '',
      status: 'Outro',
    },
  ];

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <PeopleList />
      </MemoryRouter>
    );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.get.mockReturnValue(null);
    findAllPeople.mockResolvedValue({ data: people });
    deletePersonById.mockResolvedValue({});
    window.confirm = jest.fn(() => true);
  });

  it('uses cached people from local storage when available', async () => {
    localStorage.get.mockImplementation((key) => {
      if (key === 'fullPeopleList') return people;
      if (key === 'peoplePrintList') return people;
      if (key === 'peopleSearchTerm') return 'Alice';
      return null;
    });

    renderComponent();

    expect(findAllPeople).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('Alice Doe')).toBeInTheDocument();
    });

    expect(screen.getByTestId('simple-search')).toHaveValue('Alice');
  });

  it('fetches people when local storage is empty', async () => {
    renderComponent();

    await waitFor(() => {
      expect(findAllPeople).toHaveBeenCalled();
    });

    expect(localStorage.set).toHaveBeenCalledWith('fullPeopleList', people);
    expect(localStorage.set).toHaveBeenCalledWith('peoplePrintList', people);
  });

  it('filters people by search term', async () => {
    renderComponent();

    await screen.findByText('Alice Doe');

    fireEvent.change(screen.getByTestId('simple-search'), {
      target: { value: 'Rio' },
    });

    expect(await screen.findByText('Bob Smith')).toBeInTheDocument();
    expect(screen.queryByText('Alice Doe')).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId('simple-search'), {
      target: { value: '12345678901' },
    });

    expect(await screen.findByText('Alice Doe')).toBeInTheDocument();
  });

  it('toggles selection and deletes a person', async () => {
    renderComponent();

    await screen.findByText('Alice Doe');

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();

    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).not.toBeChecked();

    const deleteIcon = screen.getAllByTestId('DeleteIcon')[0];
    fireEvent.click(deleteIcon.closest('button'));

    await waitFor(() => {
      expect(deletePersonById).toHaveBeenCalledWith('p1');
      expect(findAllPeople).toHaveBeenCalledTimes(2);
    });

    expect(localStorage.remove).toHaveBeenCalledWith('peopleSearchTerm');
  });

  it('renders formatted cpf and date of birth', async () => {
    renderComponent();

    await screen.findByText('Alice Doe');

    expect(screen.getByText(/123\.456\.789-01/)).toBeInTheDocument();
    expect(screen.getByText(/Nascimento:/)).toBeInTheDocument();
  });

  it('shows an empty state message when no results are found', async () => {
    findAllPeople.mockResolvedValueOnce({ data: [] });

    renderComponent();

    expect(
      await screen.findByText('Nenhuma pessoa encontrada')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Comece adicionando uma nova pessoa')
    ).toBeInTheDocument();
  });

  it('shows search empty state when search yields no results', async () => {
    renderComponent();

    await screen.findByText('Alice Doe');

    fireEvent.change(screen.getByTestId('simple-search'), {
      target: { value: 'Nao Existe' },
    });

    expect(
      await screen.findByText('Nenhuma pessoa encontrada')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Tente ajustar os termos de busca')
    ).toBeInTheDocument();
  });
});
