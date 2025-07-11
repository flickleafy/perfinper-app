import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SimpleSearchBar from './SimpleSearchBar';

describe('SimpleSearchBar', () => {
  it('renders default placeholder and value', () => {
    render(<SimpleSearchBar searchTerm="" setSearchTerm={() => {}} />);

    const input = screen.getByPlaceholderText('Buscar...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('renders a custom placeholder', () => {
    render(
      <SimpleSearchBar
        searchTerm="value"
        setSearchTerm={() => {}}
        placeholder="Search transactions"
      />
    );

    expect(screen.getByPlaceholderText('Search transactions')).toBeInTheDocument();
  });

  it('calls setSearchTerm on change', () => {
    const setSearchTerm = jest.fn();
    render(<SimpleSearchBar searchTerm="" setSearchTerm={setSearchTerm} />);

    const input = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(input, { target: { value: 'Rent' } });

    expect(setSearchTerm).toHaveBeenCalledWith('Rent');
  });
});
