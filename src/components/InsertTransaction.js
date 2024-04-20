import React, { useState } from 'react';
import { transactionBuilder } from '../helpers/objectsBuilder.js';
import TransactionsDataService from '../services/TransactionsService.js';

// MUI Components
import {
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Typography,
  Box,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ptBR } from 'date-fns/locale';

const InsertTransaction = () => {
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
  const [transaction, setTransaction] = useState(initialTransactionState);
  const [submitted, setSubmitted] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [transactionType, setTransactionType] = useState('');

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setTransaction({ ...transaction, [name]: value });
  };

  const insertTransaction = () => {
    transaction.type = transactionType;
    let transactionData = transactionBuilder(transaction, startDate);
    if (transactionData) {
      TransactionsDataService.insertTransaction(transactionData)
        .then((response) => {
          // ????????? insert local storage too ?????????????
          setTransaction(response.data);
          setSubmitted(true);
          console.log(response.data);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  };

  const newTransaction = () => {
    setTransaction(initialTransactionState);
    setSubmitted(false);
  };

  const handleTypeChange = (event) => {
    setTransactionType(event.target.value);
  };

  return (
    <Box sx={{ p: 3 }}>
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
        <Box>
          <Typography variant='h4'>Inserir Lançamento</Typography>
          <TextField
            label='Categoria'
            variant='outlined'
            fullWidth
            name='category'
            required
            value={transaction.category}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            label='Descrição'
            variant='outlined'
            fullWidth
            name='description'
            required
            value={transaction.description}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <FormControl
            component='fieldset'
            sx={{ mb: 2 }}>
            <FormLabel component='legend'>Tipo</FormLabel>
            <RadioGroup
              row
              name='transactionType'
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
            label='Valor'
            type='number'
            variant='outlined'
            fullWidth
            name='value'
            required
            value={transaction.value}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}>
            <DatePicker
              label='Data'
              value={startDate}
              onChange={setStartDate}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
          <Button
            variant='contained'
            color='primary'
            onClick={insertTransaction}
            sx={{ mt: 2 }}>
            Inserir
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default InsertTransaction;
