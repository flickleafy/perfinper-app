import React, { useState, useEffect } from 'react';
import { transactionBuilder } from '../helpers/objectsBuilder.js';
import { insertTransaction } from '../services/transactionService.js';
import { getCategories } from '../services/categoryService.js';

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
  MenuItem,
  InputLabel,
  Select,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ptBR } from 'date-fns/locale';

const InsertTransaction = () => {
  const initialTransactionState = {
    id: null,
    transactionDate: new Date(),
    transactionPeriod: '',
    totalValue: '0,0',
    individualValue: '0,0',
    freightValue: '0,0',
    itemName: '',
    itemDescription: '',
    itemUnits: 1,
    transactionLocation: '',
    transactionType: '',
    transactionCategory: '',
    groupedItem: false,
    groupedItemsReference: '',
    transactionFiscalNote: '',
    transactionId: '',
    transactionStatus: '',
    companyName: '',
    companySellerName: '',
    companyCnpj: '',
    transactionOrigin: '',
  };
  const [transaction, setTransaction] = useState(initialTransactionState);
  const [submitted, setSubmitted] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories();
      setCategories(data.data);
    };

    fetchCategories();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setTransaction({ ...transaction, [name]: value });
    console.log('transaction obj', transaction);
  };

  const insertTransactionApi = () => {
    let transactionData = transactionBuilder(transaction, startDate);
    if (transactionData) {
      insertTransaction(transactionData)
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
          <FormControl
            fullWidth
            component='fieldset'
            sx={{ mb: 2 }}>
            <InputLabel id='categoria-select-label'>Categoria</InputLabel>
            <Select
              labelId='categoria-select-label'
              id='categoria'
              value={transaction.transactionCategory}
              label='Categoria'
              name='transactionCategory'
              onChange={handleInputChange}>
              {categories.map((category) => (
                <MenuItem
                  key={category.id}
                  value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label='Descrição'
            variant='outlined'
            fullWidth
            name='itemDescription'
            required
            value={transaction.itemDescription}
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
              value={transaction.transactionType}
              onChange={handleInputChange}>
              <FormControlLabel
                value='debit'
                control={<Radio />}
                label='Despesa'
              />
              <FormControlLabel
                value='credit'
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
            name='totalValue'
            required
            value={transaction.totalValue}
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
            onClick={insertTransactionApi}
            sx={{ mt: 2 }}>
            Inserir
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default InsertTransaction;
