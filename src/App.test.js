import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./components/TransactionsImporter/TransactionsImporter.js', () => () => (
  <div data-testid="transactions-importer" />
));
jest.mock('./components/TransactionsExporter/TransactionsExporter.js', () => () => (
  <div data-testid="transactions-exporter" />
));
jest.mock('./components/TransactionsList/TransactionsList.js', () => () => (
  <div data-testid="transactions-list" />
));
jest.mock('./components/InsertTransaction/InsertTransaction.js', () => () => (
  <div data-testid="insert-transaction" />
));
jest.mock('./components/EditTransaction/EditTransaction.js', () => () => (
  <div data-testid="edit-transaction" />
));
jest.mock('./components/CompaniesList/CompaniesList.js', () => () => (
  <div data-testid="companies-list" />
));
jest.mock('./components/InsertCompany/InsertCompany.js', () => () => (
  <div data-testid="insert-company" />
));
jest.mock('./components/EditCompany/EditCompany.js', () => () => (
  <div data-testid="edit-company" />
));
jest.mock('./components/PeopleList/PeopleList.js', () => () => (
  <div data-testid="people-list" />
));
jest.mock('./components/InsertPerson/InsertPerson.js', () => () => (
  <div data-testid="insert-person" />
));
jest.mock('./components/EditPerson/EditPerson.js', () => () => (
  <div data-testid="edit-person" />
));
jest.mock('./components/FiscalBooksList/FiscalBooksList.js', () => () => (
  <div data-testid="fiscal-books-list" />
));
jest.mock('./components/InsertFiscalBook/InsertFiscalBook.js', () => () => (
  <div data-testid="insert-fiscal-book" />
));
jest.mock('./components/EditFiscalBook/EditFiscalBook.js', () => () => (
  <div data-testid="edit-fiscal-book" />
));

describe('App', () => {
  const setPath = (path) => {
    window.history.pushState({}, '', path);
  };

  afterEach(() => {
    setPath('/');
  });

  it('renders navigation links', () => {
    render(<App />);

    const links = screen.getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));

    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/lista',
        '/inserir',
        '/empresas',
        '/pessoas',
        '/livros-fiscais',
        '/importar',
        '/exportar',
      ])
    );
  });

  it('renders transactions list on the default route', () => {
    setPath('/');
    render(<App />);

    expect(screen.getByTestId('transactions-list')).toBeInTheDocument();
  });

  it('renders companies list for the companies route', () => {
    setPath('/empresas');
    render(<App />);

    expect(screen.getByTestId('companies-list')).toBeInTheDocument();
  });
});
