import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Grid, Typography, Box } from '@mui/material';

import { parseMonetaryValue } from '../infrastructure/currency/currencyFormat';

const StatusBar = ({ array }) => {
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const revenue = calculateTotal(
      array.filter((item) => item.transactionType === 'credit'),
      setTotalRevenue
    );
    const expense = calculateTotal(
      array.filter((item) => item.transactionType === 'debit'),
      setTotalExpense
    );
    getBalance(revenue, expense);
  }, [array]);

  const calculateTotal = (transactions, setter) => {
    const total = transactions.reduce(
      (acc, current) => acc + parseMonetaryValue(current.transactionValue),
      0
    );
    setter(total);
    return total;
  };

  const getBalance = (revenue, expense) => {
    setBalance(revenue - expense);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid
        container
        spacing={2}>
        <Grid
          item
          xs={6}
          sm={3}>
          <Typography
            sx={{ textAlign: 'center' }}
            variant='body1'>
            Lançamentos: {array.length}
          </Typography>
        </Grid>
        <Grid
          item
          xs={6}
          sm={3}>
          <Typography
            sx={{ textAlign: 'center' }}
            variant='body1'>
            Receita: R$ {totalRevenue.toFixed(2).replace('.', ',')}
          </Typography>
        </Grid>
        <Grid
          item
          xs={6}
          sm={3}>
          <Typography
            sx={{ textAlign: 'center' }}
            variant='body1'>
            Despesa: R$ {totalExpense.toFixed(2).replace('.', ',')}
          </Typography>
        </Grid>
        <Grid
          item
          xs={6}
          sm={3}>
          <Typography
            sx={{ textAlign: 'center' }}
            variant='body1'>
            Saldo: R$ {balance.toFixed(2).replace('.', ',')}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

StatusBar.propTypes = {
  array: PropTypes.array.isRequired,
};

export default StatusBar;
