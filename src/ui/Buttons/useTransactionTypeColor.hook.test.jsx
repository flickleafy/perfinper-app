import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useTransactionTypeColor, transactionTypeColor } from './useTransactionTypeColor.hook';

const TestComponent = ({ type }) => {
  const { backgroundColor, highlightColor } = useTransactionTypeColor(type);

  return (
    <div
      data-testid="colors"
      data-background={backgroundColor}
      data-highlight={highlightColor}
    />
  );
};

describe('useTransactionTypeColor', () => {
  it('uses primary colors for debit transactions', () => {
    const theme = createTheme({
      palette: {
        primary: { main: '#111111', light: '#222222' },
        secondary: { main: '#333333', light: '#444444' },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <TestComponent type="debit" />
      </ThemeProvider>
    );

    const target = screen.getByTestId('colors');
    expect(target).toHaveAttribute('data-background', '#111111');
    expect(target).toHaveAttribute('data-highlight', '#222222');
  });

  it('uses secondary colors for non-debit transactions', () => {
    const theme = createTheme({
      palette: {
        primary: { main: '#101010', light: '#202020' },
        secondary: { main: '#303030', light: '#404040' },
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <TestComponent type="credit" />
      </ThemeProvider>
    );

    const target = screen.getByTestId('colors');
    expect(target).toHaveAttribute('data-background', '#303030');
    expect(target).toHaveAttribute('data-highlight', '#404040');
  });
});

describe('transactionTypeColor', () => {
  it('returns the primary color for debit', () => {
    expect(transactionTypeColor('debit', 'primary', 'secondary')).toBe('primary');
  });

  it('returns the secondary color for non-debit', () => {
    expect(transactionTypeColor('credit', 'primary', 'secondary')).toBe('secondary');
  });
});
