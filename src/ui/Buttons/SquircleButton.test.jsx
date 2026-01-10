import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SquircleButton } from './SquircleButton';

describe('SquircleButton', () => {
  it('renders a link button and triggers onClick', () => {
    const onClick = jest.fn();

    render(
      <ThemeProvider theme={createTheme()}>
        <MemoryRouter>
          <SquircleButton destination="/target" onClick={onClick}>
            <span>Child</span>
          </SquircleButton>
        </MemoryRouter>
      </ThemeProvider>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/target');
    expect(screen.getByText('Child')).toBeInTheDocument();

    fireEvent.click(link);

    expect(onClick).toHaveBeenCalled();
  });
});
