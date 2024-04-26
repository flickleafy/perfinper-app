import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import TransactionsDataService from '../services/TransactionsService.js';
import { transactionBuilder, buildDateObj } from '../helpers/objectsBuilder.js';
import { searchByID, getIndexOfElement } from '../helpers/searchers.js';
import localStorage from 'local-storage';

// MUI Imports
import {
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Box,
  Typography,
  Grid,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ptBR } from 'date-fns/locale';

const EditTransaction = () => {
  const { id } = useParams();

  const initialTransactionState = {
    _id: null,
    category: '',
    description: '',
    type: '',
    value: '',
    day: '',
    month: '',
    year: '',
    yearMonth: '',
    yearMonthDay: '',
  };

  const [currentTransaction, setCurrentTransaction] = useState(
    initialTransactionState
  );
  const [message, setMessage] = useState('');
  const [transactionDate, setTransactionDate] = useState(null);
  const [transactionType, setTransactionType] = useState('');

  const initializeFromLocalStorage = useCallback(() => {
    let tmpFTL = localStorage.get('fullTransactionsList');
    if (tmpFTL) {
      let tmpTrans = searchByID(id, tmpFTL);
      setCurrentTransaction(tmpTrans);
      setTransactionDate(buildDateObj(tmpTrans));
      setTransactionType(tmpTrans.type);
      return true;
    }
    return false;
  }, [id, setCurrentTransaction, setTransactionDate, setTransactionType]);

  useEffect(() => {
    if (!initializeFromLocalStorage()) {
      getTransaction(id);
    }
  }, [id, initializeFromLocalStorage]);

  const getTransaction = (id) => {
    TransactionsDataService.findTransactionById(id)
      .then((response) => {
        setCurrentTransaction(response.data);
        setTransactionDate(buildDateObj(response.data));
        setTransactionType(response.data.type);
        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const storeToLocalStorage = (updatedTransaction) => {
    let tmpFTL = localStorage.get('fullTransactionsList');
    let tmpTPL = localStorage.get('transactionsPrintList');

    updatedTransaction._id = id;
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
    if (name === 'value') {
      value = parseInt(value);
    }
    setCurrentTransaction({ ...currentTransaction, [name]: value });
  };

  const updateTransaction = () => {
    let updatedTransaction = transactionBuilder(
      currentTransaction,
      transactionDate
    );
    TransactionsDataService.updateTransactionById(
      currentTransaction._id,
      updatedTransaction
    )
      .then(() => {
        storeToLocalStorage(updatedTransaction);
        setMessage('O lançamento foi atualizado com sucesso!');
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // const ExampleCustomInput = ({ value, onClick }) => (
  //   <button className="example-custom-input" onClick={onClick}>
  //     {value}
  //   </button>
  // );

  const handleTypeChange = (event) => {
    setTransactionType(event.target.value);
  };

  return (
    <Box
      paddingLeft={8}
      paddingRight={8}>
      <Typography variant='h4'>Editar Lançamento</Typography>
      <Box
        component='form'
        noValidate
        autoComplete='on'>
        <TextField
          fullWidth
          label='Categoria'
          name='category'
          value={currentTransaction.category}
          onChange={handleInputChange}
          margin='normal'
          variant='outlined'
        />
        <TextField
          fullWidth
          label='Descrição'
          name='description'
          value={currentTransaction.description}
          onChange={handleInputChange}
          margin='normal'
          variant='outlined'
        />
        <FormControl
          component='fieldset'
          margin='normal'>
          <FormLabel component='legend'>Tipo</FormLabel>
          <RadioGroup
            row
            name='type'
            value={transactionType}
            onChange={handleTypeChange}>
            <FormControlLabel
              value='-'
              control={<Radio />}
              label='Despesa'
            />
            <FormControlLabel
              value='+'
              control={<Radio />}
              label='Receita'
            />
          </RadioGroup>
        </FormControl>
        <TextField
          fullWidth
          label='Valor'
          name='value'
          type='number'
          value={currentTransaction.value}
          onChange={handleInputChange}
          margin='normal'
          variant='outlined'
        />
        <LocalizationProvider
          dateAdapter={AdapterDateFns}
          adapterLocale={ptBR}>
          <DatePicker
            label='Data'
            value={transactionDate}
            onChange={setTransactionDate}
            sx={{ marginTop: 2, marginBottom: 1, width: '100%' }}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
        <Grid
          container
          justifyContent='right'
          sx={{ paddingTop: 2 }}>
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
      </Box>
    </Box>
  );
};

export default EditTransaction;
