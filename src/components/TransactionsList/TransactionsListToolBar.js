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
  fiscalBookYear,
}) {
  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column' }}
      data-testid='toolbar'
      data-fiscal-book-year={fiscalBookYear || undefined}>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <AppBar
          position='static'
          color='primary'>
          <Toolbar sx={{ display: 'flex', gap: 2, width: '100%', minWidth: 0 }}>
            <Box sx={{ flex: '2 1 0', minWidth: 0 }}>
              <PeriodSelector
                currentPeriod={periodSelected}
                onDataChange={handleDataChangePeriodSelector}
                fiscalBookYear={fiscalBookYear}
                sx={{ width: '100%', margin: 0 }}
              />
            </Box>

            <Box sx={{ flex: '6 1 0', minWidth: 0 }}>
              <SearchBar
                array={fullTransactionsList}
                onDataChange={handleDataChangeSearchBar}
                sx={{ width: '100%', margin: 0 }}
              />
            </Box>

            <Box sx={{ flex: '2 1 0', minWidth: 0 }}>
              <FiscalBookFilter
                selectedFiscalBookId={selectedFiscalBookId}
                onFiscalBookChange={onFiscalBookChange}
                sx={{ width: '100%', minWidth: 0, maxWidth: '100%' }}
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
  fiscalBookYear: PropTypes.string,
};
