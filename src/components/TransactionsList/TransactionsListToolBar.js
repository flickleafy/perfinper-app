import React from 'react';
import PropTypes from 'prop-types';
import { Box, AppBar, Toolbar } from '@mui/material';
import SearchBar from '../../ui/SearchBar.js';
import StatusBar from '../../ui/StatusBar.js';
import PeriodSelector from '../../ui/PeriodSelector.js';
import FiscalBookFilter from '../FiscalBookFilter/FiscalBookFilter.js';

export function TransactionsListToolBar({
  periodSelected,
  handleDataChangePeriodSelector,
  fullTransactionsList,
  handleDataChangeSearchBar,
  transactionsPrintList,
  selectedFiscalBookId,
  onFiscalBookChange,
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
            <Box sx={{ ml: 2 }}>
              <FiscalBookFilter
                selectedFiscalBookId={selectedFiscalBookId}
                onFiscalBookChange={onFiscalBookChange}
              />
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
      <Box marginTop={2}>
        <StatusBar array={transactionsPrintList} />
      </Box>
    </Box>
  );
}

TransactionsListToolBar.propTypes = {
  periodSelected: PropTypes.string,
  handleDataChangePeriodSelector: PropTypes.func,
  fullTransactionsList: PropTypes.array,
  handleDataChangeSearchBar: PropTypes.func,
  transactionsPrintList: PropTypes.array,
  selectedFiscalBookId: PropTypes.string,
  onFiscalBookChange: PropTypes.func,
};
