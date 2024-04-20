import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box } from '@mui/material';

const StatusBar = ({ array }) => {
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const revenue = calculateTotal(
      array.filter((item) => item.type === '+'),
      setTotalRevenue
    );
    const expense = calculateTotal(
      array.filter((item) => item.type === '-'),
      setTotalExpense
    );
    getBalance(revenue, expense);
  }, [array]);

  const calculateTotal = (transactions, setter) => {
    const total = transactions.reduce(
      (acc, current) => acc + Number(current.value),
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
          <Typography variant='body1'>Lançamentos: {array.length}</Typography>
        </Grid>
        <Grid
          item
          xs={6}
          sm={3}>
          <Typography variant='body1'>
            Receita: R${totalRevenue.toFixed(2)}
          </Typography>
        </Grid>
        <Grid
          item
          xs={6}
          sm={3}>
          <Typography variant='body1'>
            Despesa: R${totalExpense.toFixed(2)}
          </Typography>
        </Grid>
        <Grid
          item
          xs={6}
          sm={3}>
          <Typography variant='body1'>Saldo: R${balance.toFixed(2)}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

// StatusBar.propTypes = {
//   array: PropTypes.array.isRequired,
// };

export default StatusBar;
