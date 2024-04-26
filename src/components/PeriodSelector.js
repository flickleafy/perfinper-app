import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { numberDateToExtenseDate } from '../helpers/objectsBuilder.js';
import TransactionsDataService from '../services/TransactionsService.js';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  styled,
  alpha,
} from '@mui/material';

const PeriodSelector = ({ onDataChange }) => {
  //const [currentPeriod, setCurrentPeriod] = useState('');
  const [periodsList, setPeriodsList] = useState([]);

  useEffect(() => {
    // ????????? get from local storage first ?????????????
    findPeriods();
  }, []);

  const findPeriods = () => {
    TransactionsDataService.findUniquePeriods()
      .then((response) => {
        const allPeriods = ['', ...response.data];
        setPeriodsList(allPeriods);
        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handlePeriodChange = (event) => {
    console.log(event.target.value);
    onDataChange(event.target.value);
  };

  return (
    <FormControl
      sx={{ width: '50%', margin: 'auto' }}
      fullWidth>
      <StyledInputLabel id='period-select-label'>Período</StyledInputLabel>
      <StyledSelect
        labelId='period-select-label'
        id='period-select'
        value={periodsList[0]} // Assuming you want to control the current period
        label='Período'
        onChange={handlePeriodChange}>
        {periodsList.map((period) => (
          <MenuItem
            key={period}
            value={period}>
            {period.length > 0
              ? numberDateToExtenseDate(period)
              : 'Selecione uma opção'}
          </MenuItem>
        ))}
      </StyledSelect>
    </FormControl>
  );
};

PeriodSelector.propTypes = {
  onDataChange: PropTypes.func.isRequired,
};

const StyledSelect = styled(Select)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
  },
  '& .MuiSelect-select': {
    width: '100%',
    borderRadius: theme.shape.borderRadius,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 0,
  },
  '& .MuiSelect-icon': {
    color: theme.palette.common.white,
  },
}));

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
  color: alpha(theme.palette.common.white, 0.55),
  top: -8,
  '&.Mui-focused, &.MuiInputLabel-shrink': {
    color: alpha(theme.palette.common.white, 0.95),
    top: 0,
  },
}));

export default PeriodSelector;
