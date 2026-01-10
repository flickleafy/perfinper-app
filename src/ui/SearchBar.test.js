import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from './SearchBar';
import { searchFields } from '../infrastructure/searcher/searchers';

jest.mock('../infrastructure/searcher/searchers', () => ({
  searchFields: jest.fn(),
}));

describe('SearchBar', () => {
  const sampleArray = [
    {
      companyCnpj: '123',
      companyName: 'Acme Inc',
      companySellerName: 'Jane',
      transactionName: 'Purchase',
      transactionDescription: 'Office supplies',
    },
  ];

  const expectedFields = [
    'companyCnpj',
    'companyName',
    'companySellerName',
    'transactionName',
    'transactionDescription',
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('focuses the input when the container is clicked', () => {
    const { container } = render(
      <SearchBar array={sampleArray} onDataChange={() => {}} />
    );

    const input = screen.getByLabelText('search');
    const clickable = input.closest('div') || container.firstChild;

    expect(document.activeElement).not.toBe(input);

    fireEvent.click(clickable);

    expect(document.activeElement).toBe(input);
  });

  it('clears results when the search term is shorter than 3 characters', () => {
    const onDataChange = jest.fn();

    render(<SearchBar array={sampleArray} onDataChange={onDataChange} />);

    const input = screen.getByLabelText('search');
    fireEvent.change(input, { target: { value: 'ab' } });

    expect(searchFields).not.toHaveBeenCalled();
    expect(onDataChange).toHaveBeenCalledWith('', []);
  });

  it('uses searchFields and forwards results for valid input', () => {
    const onDataChange = jest.fn();
    const results = [{ id: 'match' }];

    searchFields.mockReturnValue(results);

    render(<SearchBar array={sampleArray} onDataChange={onDataChange} />);

    const input = screen.getByLabelText('search');
    fireEvent.change(input, { target: { value: 'off' } });

    expect(searchFields).toHaveBeenCalledWith('off', sampleArray, expectedFields);
    expect(onDataChange).toHaveBeenCalledWith('off', results);
  });

  it('returns an empty list when no matches are found', () => {
    const onDataChange = jest.fn();

    searchFields.mockReturnValue([]);

    render(<SearchBar array={sampleArray} onDataChange={onDataChange} />);

    const input = screen.getByLabelText('search');
    fireEvent.change(input, { target: { value: 'none' } });

    expect(onDataChange).toHaveBeenCalledWith('none', []);
  });
});
