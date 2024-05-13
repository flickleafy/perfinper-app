import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TableSortLabel, Box, Typography } from '@mui/material';

export const TransactionsListHeader = ({ onSortChange }) => {
  const [orderDirection, setOrderDirection] = useState({
    transactionDate: 'asc',
    transactionCategory: 'asc',
    itemDescription: 'asc',
    totalValue: 'asc',
  });

  const handleSort = (column) => {
    const columnIsNumeric = column === 'totalValue';
    const isAsc = orderDirection[column] === 'asc';
    setOrderDirection({
      ...orderDirection,
      [column]: isAsc ? 'desc' : 'asc',
    });
    onSortChange(column, isAsc ? 'desc' : 'asc', columnIsNumeric);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          p: 1,
          bgcolor: 'background.paper',
        }}>
        <Typography
          style={{
            flexGrow: 0,
            paddingLeft: 24,
            paddingRight: 24,
            cursor: 'pointer',
          }}
          onClick={() => handleSort('transactionDate')}>
          <TableSortLabel direction={orderDirection.transactionDate}>
            Data
          </TableSortLabel>
        </Typography>
        <Typography
          style={{ flexGrow: 0, cursor: 'pointer' }}
          onClick={() => handleSort('transactionCategory')}>
          <TableSortLabel direction={orderDirection.transactionCategory}>
            Categoria
          </TableSortLabel>
        </Typography>
        <Typography
          style={{ flexGrow: 1, paddingLeft: 8, cursor: 'pointer' }}
          onClick={() => handleSort('itemDescription')}>
          <TableSortLabel direction={orderDirection.itemDescription}>
            Descrição
          </TableSortLabel>
        </Typography>
        <Typography
          style={{ flexGrow: 0, paddingRight: 164, cursor: 'pointer' }}
          onClick={() => handleSort('totalValue')}>
          <TableSortLabel direction={orderDirection.totalValue}>
            Valor
          </TableSortLabel>
        </Typography>
      </Box>
    </Box>
  );
};

TransactionsListHeader.propTypes = {
  onSortChange: PropTypes.func.isRequired,
};
