import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  Box,
} from '@mui/material';

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
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sortDirection={orderDirection.transactionDate}>
              <TableSortLabel
                active={true}
                direction={orderDirection.transactionDate}
                onClick={() => handleSort('transactionDate')}>
                Date
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={true}
                direction={orderDirection.transactionCategory}
                onClick={() => handleSort('transactionCategory')}>
                Category
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={true}
                direction={orderDirection.itemDescription}
                onClick={() => handleSort('itemDescription')}>
                Description
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={true}
                direction={orderDirection.totalValue}
                onClick={() => handleSort('totalValue')}>
                Total Value
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
      </Table>
    </Box>
  );
};

TransactionsListHeader.propTypes = {
  onSortChange: PropTypes.func.isRequired,
};
