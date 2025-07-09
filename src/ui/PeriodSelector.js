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
import { sortPeriods } from './sortPeriods.js';

const PeriodSelector = ({ onDataChange, fiscalBookYear, sx }) => {
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [periodsList, setPeriodsList] = useState([]);
  const [allPeriods, setAllPeriods] = useState([]);

  useEffect(() => {
    // ????????? get from local storage first ?????????????
    findPeriods();
  }, []);

  useEffect(() => {
    // Filter periods when fiscal book year changes
    if (fiscalBookYear && allPeriods.length > 0) {
      const filteredPeriods = allPeriods.filter(period => {
        if (period === '') return true; // Keep the empty option
        // Check if period starts with the fiscal book year
        return period.startsWith(fiscalBookYear);
      });
      setPeriodsList(filteredPeriods);
    } else {
      setPeriodsList(allPeriods);
    }
  }, [fiscalBookYear, allPeriods]);

  const findPeriods = async () => {
    try {
      const [yearsResponse, periodsResponse] = await Promise.all([
        findUniqueYears(),
        findUniquePeriods(),
      ]);

      const periods = sortPeriods(['', ...yearsResponse.data, ...periodsResponse.data]);
      setAllPeriods(periods);
      setPeriodsList(periods);
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  const handlePeriodChange = (event) => {
    const value = event.target.value;
    console.log(value);
    setCurrentPeriod(value);
    onDataChange(value);
  };

  return (
    <FormControl
      sx={{ width: '50%', margin: 'auto', ...sx }}
      fullWidth
      data-testid="period-selector"
      data-fiscal-book-year={fiscalBookYear || undefined}>
      <StyledInputLabel id='period-select-label'>Período</StyledInputLabel>
      <StyledSelect
        labelId='period-select-label'
        id='period-select'
        value={currentPeriod}
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
  fiscalBookYear: PropTypes.string,
  sx: PropTypes.object,
};

export default PeriodSelector;
