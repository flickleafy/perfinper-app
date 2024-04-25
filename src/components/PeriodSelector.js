import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { numberDateToExtenseDate } from '../helpers/objectsBuilder.js';
import TransactionsDataService from '../services/TransactionsService.js';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

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
      <InputLabel id='period-select-label'>Período</InputLabel>
      <Select
        labelId='period-select-label'
        id='period-select'
        value={periodsList[0]} // Assuming you want to control the current period
        label='Período'
        onChange={handlePeriodChange}
        sx={{}}>
        {periodsList.map((period) => (
          <MenuItem
            key={period}
            value={period}>
            {period.length > 0
              ? numberDateToExtenseDate(period)
              : 'Selecione uma opção'}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

PeriodSelector.propTypes = {
  onDataChange: PropTypes.func.isRequired,
};

export default PeriodSelector;
