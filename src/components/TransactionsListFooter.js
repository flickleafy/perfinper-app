import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Button } from '@mui/material';

export function TransactionsListFooter({
  disabled,
  deleteAllTransactions,
  restoreToFullTransactionsList,
}) {
  return (
    <Grid
      container
      justifyContent='right'
      sx={{ paddingTop: 2 }}>
      <Button
        variant='contained'
        color='error'
        disabled={disabled}
        onClick={deleteAllTransactions}
        sx={{ marginRight: 2 }}>
        Deletar Itens Listados
      </Button>
      <Button
        variant='contained'
        color='primary'
        disabled={disabled}
        onClick={restoreToFullTransactionsList}>
        Resetar Lista
      </Button>
    </Grid>
  );
}

TransactionsListFooter.propTypes = {
  disabled: PropTypes.bool,
  deleteAllTransactions: PropTypes.func,
  restoreToFullTransactionsList: PropTypes.func,
};
