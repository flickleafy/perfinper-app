import React from 'react';
import { render, screen } from '@testing-library/react';
import { IconByCategory } from './IconByCategory';

const mockCategory = jest.fn();
const mockUnknown = jest.fn();

jest.mock('./categories.map', () => {
  const React = require('react');
  return {
    __esModule: true,
    CategoriesMap: {
      Mercado: (props) => {
        mockCategory(props);
        return React.createElement('div', { 'data-testid': 'category-button' });
      },
    },
  };
});

jest.mock('./UnknownButton', () => {
  const React = require('react');
  return {
    __esModule: true,
    UnknownButton: (props) => {
      mockUnknown(props);
      return React.createElement('div', { 'data-testid': 'unknown-button' });
    },
  };
});

jest.mock('./useTransactionTypeColor.hook', () => ({
  useTransactionTypeColor: () => ({
    backgroundColor: 'bg',
    highlightColor: 'hl',
  }),
}));

describe('IconByCategory', () => {
  beforeEach(() => {
    mockCategory.mockClear();
    mockUnknown.mockClear();
  });

  it('renders the mapped category button when available', () => {
    const onClick = jest.fn();

    render(
      <IconByCategory
        category="Mercado"
        type="credit"
        destination="/dest"
        onClick={onClick}
      />
    );

    expect(screen.getByTestId('category-button')).toBeInTheDocument();
    expect(mockCategory).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: '/dest',
        backgroundColor: 'bg',
        highlightColor: 'hl',
      })
    );
    expect(mockUnknown).not.toHaveBeenCalled();
  });

  it('renders the unknown button when no category match exists', () => {
    render(<IconByCategory category="Other" type="debit" destination="/dest" />);

    expect(screen.getByTestId('unknown-button')).toBeInTheDocument();
    expect(mockUnknown).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: '/dest',
        backgroundColor: 'bg',
        highlightColor: 'hl',
      })
    );
    expect(mockCategory).not.toHaveBeenCalled();
  });
});
