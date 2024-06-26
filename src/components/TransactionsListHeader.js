import React from 'react';
import PropTypes from 'prop-types';
import { Box, AppBar, Toolbar } from '@mui/material';
import SearchBar from './SearchBar.js';
import StatusBar from './StatusBar.js';
import PeriodSelector from './PeriodSelector.js';

export function TransactionsListHeader({
  periodSelected,
  handleDataChangePeriodSelector,
  fullTransactionsList,
  handleDataChangeSearchBar,
  transactionsPrintList,
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <AppBar
          position='static'
          color='primary'>
          <Toolbar>
            <PeriodSelector
              currentPeriod={periodSelected}
              onDataChange={handleDataChangePeriodSelector}
            />
            <SearchBar
              array={fullTransactionsList}
              onDataChange={handleDataChangeSearchBar}
            />
          </Toolbar>
        </AppBar>
      </Box>
      <Box marginTop={2}>
        <StatusBar array={transactionsPrintList} />
      </Box>
    </Box>
  );
}

TransactionsListHeader.propTypes = {
  periodSelected: PropTypes.string,
  handleDataChangePeriodSelector: PropTypes.func,
  fullTransactionsList: PropTypes.array,
  handleDataChangeSearchBar: PropTypes.func,
  transactionsPrintList: PropTypes.array,
};
