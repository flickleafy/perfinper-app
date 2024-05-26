import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  findTransactionById,
  updateTransactionById,
} from '../services/transactionService.js';
import { getCategories } from '../services/categoryService.js';
import { transactionBuilder } from '../helpers/objectsBuilder.js';
import { buildDateObj } from '../infrastructure/date/buildDateObj.js';
import {
  searchByID,
  getIndexOfElement,
} from '../infrastructure/searcher/searchers.js';
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
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ptBR } from 'date-fns/locale';
import { currencyFormat } from '../infrastructure/currency/currencyFormat.js';

const EditTransaction = () => {
  const { id } = useParams();

  const initialTransactionState = {
    id: null,
    transactionDate: new Date(),
    transactionPeriod: '', // month and year of transaction
    totalValue: '0,0',
    individualValue: '0,0', // only applicable for grouped item
    freightValue: '0,0', // only applicable for online transaction of physical product
    itemName: '', // brief description, or name
    itemDescription: '', // detailed information about the transaction
    itemUnits: 1,
    transactionLocation: '', // online / local
    transactionType: '', // credit / debit
    transactionCategory: '', // category id
    groupedItem: false, // if it is part of grouped transaction
    groupedItemsReference: '', // reference of the grouped transaction
    transactionFiscalNote: '', // fiscal note key
    transactionId: '', // transaction id from the transaction source
    transactionStatus: '', // concluded, refunded, started
    companyName: '', // company name
    companySellerName: '', // seller name from the company
    companyCnpj: '', // company identification key
    transactionSource: '', // manual, nubank, mercadolivre, digio
  };

  const [currentTransaction, setCurrentTransaction] = useState(
    initialTransactionState
  );
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
      setCurrentTransaction(tmpTrans);
      setTransactionDate(new Date(tmpTrans.transactionDate));
      return true;
    }
    return false;
  }, [id, setCurrentTransaction, setTransactionDate]);

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
        setCurrentTransaction(response.data);
        setTransactionDate(buildDateObj(response.data));
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
    if (name === 'totalValue') {
      value = currencyFormat(value);
    }
    setCurrentTransaction({ ...currentTransaction, [name]: value });
  };

  const updateTransaction = () => {
    let updatedTransaction = transactionBuilder(
      currentTransaction,
      transactionDate
    );
    updateTransactionById(currentTransaction.id, updatedTransaction)
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
      <Typography variant='h4'>Editar Lançamento</Typography>
      <Box
        component='form'
        noValidate
        autoComplete='on'>
        <FormControl
          fullWidth
          component='fieldset'
          sx={{ mb: 2 }}>
          <InputLabel id='categoria-select-label'>Categoria</InputLabel>
          <Select
            labelId='categoria-select-label'
            id='categoria'
            value={currentTransaction.transactionCategory}
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
          fullWidth
          label='Descrição'
          name='itemDescription'
          value={currentTransaction.itemDescription}
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
            name='transactionType'
            value={currentTransaction.transactionType}
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
          fullWidth
          label='Valor'
          name='totalValue'
          type='text'
          value={currentTransaction.totalValue}
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
