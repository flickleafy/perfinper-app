import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FormControl, MenuItem } from '@mui/material';
import { StyledSelect } from './StyledSelect';

describe('StyledSelect', () => {
  it('renders the selected value', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <FormControl>
          <StyledSelect value="one" onChange={() => {}} labelId="test-select-label">
            <MenuItem value="one">One</MenuItem>
          </StyledSelect>
        </FormControl>
      </ThemeProvider>
    );

    expect(screen.getByText('One')).toBeInTheDocument();
  });
});
