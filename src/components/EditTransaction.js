import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  findTransactionById,
  updateTransactionById,
} from '../services/transactionService.js';
import { getCategories } from '../services/categoryService.js';
import { transactionBuilder } from '../helpers/objectsBuilder.js';
import {
  searchByID,
  getIndexOfElement,
} from '../infrastructure/searcher/searchers.js';
import localStorage from 'local-storage';

// MUI Imports
import { Button, Box, Typography, Grid } from '@mui/material';
import { currencyFormat } from '../infrastructure/currency/currencyFormat.js';
import { transactionPrototype } from './transactionPrototype.js';
import TransactionForm from './TransactionForm.js';

const EditTransaction = () => {
  const { id } = useParams();

  const initialTransactionState = transactionPrototype();
  const [transaction, setTransaction] = useState(initialTransactionState);
  const [message, setMessage] = useState('');
  const [transactionDate, setTransactionDate] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories();
      setCategories(data.data);
    };

    fetchCategories();
  }, []);

  const initializeFromLocalStorage = useCallback(() => {
    const tmpFTL = localStorage.get('fullTransactionsList');
    if (tmpFTL) {
      const tmpTrans = searchByID(id, tmpFTL);
      setTransaction(tmpTrans);
      setTransactionDate(new Date(tmpTrans.transactionDate));
      return true;
    }
    return false;
  }, [id, setTransaction, setTransactionDate]);

  useEffect(() => {
    // if (!initializeFromLocalStorage()) {
    if (id) {
      getTransaction(id);
    }
    // }
  }, [id, initializeFromLocalStorage]);

  const getTransaction = (id) => {
    findTransactionById(id)
      .then((response) => {
        setTransaction(response.data);
        setTransactionDate(new Date(response.data.transactionDate));
        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const storeToLocalStorage = (updatedTransaction) => {
    let tmpFTL = localStorage.get('fullTransactionsList');
    let tmpTPL = localStorage.get('transactionsPrintList');

    updatedTransaction.id = id;
    if (tmpFTL && tmpTPL) {
      let indexFTL = getIndexOfElement(id, tmpFTL);
      let indexTPL = getIndexOfElement(id, tmpTPL);

      tmpFTL[indexFTL] = updatedTransaction;
      if (indexTPL > -1) {
        tmpTPL[indexTPL] = updatedTransaction;
      }

      localStorage.set('fullTransactionsList', tmpFTL);
      localStorage.set('transactionsPrintList', tmpTPL);
      return true;
    }
    return false;
  };

  const handleInputChange = (event) => {
    let { name, value } = event.target;
    if (name === 'transactionValue') {
      value = currencyFormat(value);
    }
    setTransaction({ ...transaction, [name]: value });
  };

  const updateTransaction = () => {
    let updatedTransaction = transactionBuilder(transaction, transactionDate);
    updateTransactionById(transaction.id, updatedTransaction)
      .then(() => {
        storeToLocalStorage(updatedTransaction);
        setMessage('O lançamento foi atualizado com sucesso!');
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <Box
      paddingLeft={8}
      paddingRight={8}>
      <>
        <TransactionForm
          formTitle={'Editar Lançamentto'}
          transaction={transaction}
          handleInputChange={handleInputChange}
          handleDateChange={setTransactionDate}
          categories={categories}
          dateValue={transactionDate}
        />
        <Grid
          container
          justifyContent='right'
          sx={{ paddingTop: 2 }}>
          <Button
            variant='contained'
            color='secondary'
            onClick={() => {}}
            sx={{ marginRight: 2 }}>
            Voltar
          </Button>
          <Button
            color='error'
            variant='contained'
            sx={{ marginRight: 2 }}>
            Deletar
          </Button>
          <Button
            color='primary'
            variant='contained'
            onClick={updateTransaction}>
            Atualizar
          </Button>
        </Grid>
        {message && <Typography color='textPrimary'>{message}</Typography>}
      </>
    </Box>
  );
};

export default EditTransaction;
