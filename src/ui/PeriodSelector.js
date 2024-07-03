import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  findUniquePeriods,
  findUniqueYears,
} from '../services/transactionService.js';
import { FormControl, MenuItem } from '@mui/material';
import { StyledSelect } from './Inputs/StyledSelect.js';
import { StyledInputLabel } from './Inputs/StyledInputLabel.js';
import { numberDateToExtenseDate } from '../infrastructure/date/numberDateToExtenseDate.js';

const PeriodSelector = ({ onDataChange }) => {
  //const [currentPeriod, setCurrentPeriod] = useState('');
  const [periodsList, setPeriodsList] = useState([]);

  useEffect(() => {
    // ????????? get from local storage first ?????????????
    findPeriods();
  }, []);

  const findPeriods = async () => {
    try {
      const [yearsResponse, periodsResponse] = await Promise.all([
        findUniqueYears(),
        findUniquePeriods(),
      ]);

      const allPeriods = ['', ...yearsResponse.data, ...periodsResponse.data];

      setPeriodsList(allPeriods);
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
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

export default PeriodSelector;
