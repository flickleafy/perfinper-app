import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { StyledInputLabel } from './StyledInputLabel';

describe('StyledInputLabel', () => {
  it('renders the label text', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <StyledInputLabel id="label">Label</StyledInputLabel>
      </ThemeProvider>
    );

    expect(screen.getByText('Label')).toBeInTheDocument();
  });
});
