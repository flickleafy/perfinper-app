import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import localStorage from 'local-storage';
import {
  findTransactionById,
  separateTransactionById,
  updateTransactionById,
} from '../../services/transactionService.js';
import { getCategories } from '../../services/categoryService.js';
import { transactionBuilder } from '../objectsBuilder.js';
import {
  searchByID,
  getIndexOfElement,
} from '../../infrastructure/searcher/searchers.js';

// MUI Imports
import { Button, Box, Typography, Grid } from '@mui/material';
import { currencyFormat } from '../../infrastructure/currency/currencyFormat.js';
import { transactionPrototype } from '../transactionPrototype.js';
import TransactionForm from '../TransactionForm.js';

const EditTransaction = () => {
  const { id } = useParams();

  const initialTransactionState = useMemo(() => transactionPrototype(), []);
  const [transaction, setTransaction] = useState(initialTransactionState);
  const [message, setMessage] = useState('');
  const [transactionDate, setTransactionDate] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedFiscalBook, setSelectedFiscalBook] = useState(null);

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
      if (!tmpTrans) {
        return false;
      }
      const nextTransaction = {
        ...initialTransactionState,
        ...tmpTrans,
        items: tmpTrans.items || [],
      };
      setTransaction(nextTransaction);
      setTransactionDate(
        tmpTrans.transactionDate ? new Date(tmpTrans.transactionDate) : null
      );
      setSelectedFiscalBook(
        tmpTrans.fiscalBookId
          ? {
              id: tmpTrans.fiscalBookId,
              name: tmpTrans.fiscalBookName || tmpTrans.fiscalBookId,
              year: tmpTrans.fiscalBookYear || null,
            }
          : null
      );
      return true;
    }
    return false;
  }, [id, initialTransactionState, setTransaction, setTransactionDate]);

  useEffect(() => {
    if (id) {
      initializeFromLocalStorage();
      getTransaction(id);
    }
  }, [id, initializeFromLocalStorage]);

  const getTransaction = (id) => {
    findTransactionById(id)
      .then((response) => {
        setTransaction(response.data);
        setTransactionDate(new Date(response.data.transactionDate));
        setSelectedFiscalBook(
          response.data.fiscalBookId
            ? {
                id: response.data.fiscalBookId,
                name: response.data.fiscalBookName || response.data.fiscalBookId,
                year: response.data.fiscalBookYear || null,
              }
            : null
        );
        // console.log(response.data);
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
    if (name === 'transactionValue' || name === 'freightValue') {
      value = currencyFormat(value);
    }
    // value = String(value).trim();
    setTransaction({ ...transaction, [name]: value });
  };

  // const handlePaste = (event) => {
  //   // You can access the pasted data via event.clipboardData if needed
  //   const paste = event.clipboardData.getData('text');
  //   setInputValue(paste);
  //   setLastInputMethod('paste');
  //   // Optionally, prevent the default paste action if you want custom handling
  //   // event.preventDefault();
  // };

  const handleItemsChange = (newItems) => {
    setTransaction((prevTransaction) => ({
      ...prevTransaction,
      items: newItems,
    }));
  };

  const handleFiscalBookChange = (book) => {
    setSelectedFiscalBook(book || null);
    setTransaction((prevTransaction) => ({
      ...prevTransaction,
      fiscalBookId: book?.id || book?._id || null,
      fiscalBookName: book?.bookName || book?.name || '',
      fiscalBookYear: book?.year || null,
    }));
  };

  const updateTransaction = async () => {
    try {
      let updatedTransaction = transactionBuilder(transaction, transactionDate);
      await updateTransactionById(transaction.id, updatedTransaction);
      storeToLocalStorage(updatedTransaction);
      setMessage('O lançamento foi atualizado com sucesso!');
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

  const separateItemsTransaction = async () => {
    try {
      await updateTransaction();
      await separateTransactionById(transaction.id);
      setMessage('A transação foi separada com sucesso!');
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Box
      paddingLeft={8}
      paddingRight={8}
      paddingBottom={8}>
      <>
        <TransactionForm
          formTitle={'Editar Lançamento'}
          transaction={transaction}
          handleInputChange={handleInputChange}
          handleDateChange={setTransactionDate}
          handleItemsChange={handleItemsChange}
          handleFiscalBookChange={handleFiscalBookChange}
          categories={categories}
          dateValue={transactionDate}
          selectedFiscalBook={selectedFiscalBook}
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
            onClick={separateItemsTransaction}
            disabled={transaction.items.length < 2}
            sx={{ marginRight: 2 }}>
            Separar Items para Transações
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
