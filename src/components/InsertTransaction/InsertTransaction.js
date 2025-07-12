import React, { useState, useEffect } from 'react';
import { transactionBuilder } from '../objectsBuilder.js';
import { currencyFormat } from '../../infrastructure/currency/currencyFormat.js';
import { insertTransaction } from '../../services/transactionService.js';
import { getCategories } from '../../services/categoryService.js';

// MUI Components
import { Button, Typography, Box, Grid } from '@mui/material';
import { transactionPrototype } from '../transactionPrototype.js';
import TransactionForm from '../TransactionForm.js';

const InsertTransaction = () => {
  const initialTransactionState = transactionPrototype();

  const [transaction, setTransaction] = useState(initialTransactionState);
  const [submitted, setSubmitted] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [categories, setCategories] = useState([]);
  const [selectedFiscalBook, setSelectedFiscalBook] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories();
      setCategories(data.data);
    };

    fetchCategories();
  }, []);

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

  const insertTransactionApi = () => {
    let transactionData = transactionBuilder(transaction, startDate);
    if (transactionData) {
      insertTransaction(transactionData)
        .then((response) => {
          // ????????? insert local storage too ?????????????
          setTransaction(response.data);
          setSubmitted(true);
          // console.log(response.data);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  };

  const newTransaction = () => {
    setTransaction(initialTransactionState);
    setSubmitted(false);
    setSelectedFiscalBook(null);
  };

  return (
    <Box
      paddingLeft={8}
      paddingRight={8}
      paddingBottom={8}>
      {submitted ? (
        <Box>
          <Typography variant='h4'>
            O lançamento foi inserido com sucesso!
          </Typography>
          <Button
            variant='contained'
            color='success'
            onClick={newTransaction}>
            Inserir Outro
          </Button>
        </Box>
      ) : (
        <>
          <TransactionForm
            formTitle={'Inserir Lançamento'}
            transaction={transaction}
            handleInputChange={handleInputChange}
            handleDateChange={setStartDate}
            handleItemsChange={handleItemsChange}
            handleFiscalBookChange={handleFiscalBookChange}
            categories={categories}
            dateValue={startDate}
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
              variant='contained'
              color='primary'
              onClick={insertTransactionApi}>
              Inserir
            </Button>
          </Grid>
          {/* {message && <Typography color='textPrimary'>{message}</Typography>} */}
        </>
      )}
    </Box>
  );
};

export default InsertTransaction;
