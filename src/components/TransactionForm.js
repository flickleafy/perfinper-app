import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Box,
  Typography,
  IconButton,
  Button,
  Grid,
  Alert,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LockIcon from '@mui/icons-material/Lock';
const { AdapterDateFns } = require('../infrastructure/date/AdapterDateFnsCompat');
const { DatePicker, LocalizationProvider } = require('@mui/x-date-pickers');
import { ptBR } from 'date-fns/locale';
import { currencyFormat } from '../infrastructure/currency/currencyFormat';
import TransactionFiscalBookSelector from './TransactionFiscalBookSelector/TransactionFiscalBookSelector';

const TransactionForm = ({
  formTitle,
  transaction,
  handleInputChange,
  handleDateChange,
  handleItemsChange,
  handleFiscalBookChange,
  categories,
  dateValue,
  isEditing = false,
  selectedFiscalBook = null,
  isInArchivedBook = false,
}) => {
  const paymentMethods = [
    { id: 'money', name: 'Dinheiro' },
    { id: 'pix', name: 'Pix' },
    { id: 'boleto', name: 'Boleto' },
    { id: 'debit card', name: 'Cartão de débito' },
    { id: 'credit card', name: 'Cartão de crédito' },
    { id: 'benefit card', name: 'Cartão de benefício' },
    { id: 'other', name: 'Outro' },
  ];
  const transactionLocations = [
    { id: 'online', name: 'Online' },
    { id: 'local', name: 'Local' },
    { id: 'other', name: 'Outro' },
  ];
  const transactionSources = [
    { id: 'manual', name: 'Manual' },
    { id: 'nubank', name: 'Nubank' },
    { id: 'nubank-credit', name: 'Crédito Nubank' },
    { id: 'digio-credit', name: 'Crédito Digio' },
    { id: 'mercadolivre', name: 'Mercado Livre' },
    { id: 'flash', name: 'Flash' },
  ];
  const transactionStatuses = [
    { id: 'concluded', name: 'Concluido' },
    { id: 'refunded', name: 'Estornado' },
    { id: 'started', name: 'Iniciado' },
  ];
  const [items, setItems] = useState(transaction.items || []);

  useEffect(() => {
    if (transaction.items) {
      setItems(transaction.items);
    }
  }, [transaction.items]);

  const handleAddItem = () => {
    const newItem = {
      itemName: '',
      itemDescription: '',
      itemValue: '0,00',
      itemUnits: 1,
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    handleItemsChange(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    handleItemsChange(newItems);
  };

  const handleItemChange = (index, event) => {
    const newItems = [...items];
    let { name, value } = event.target;
    if (name === 'itemValue') {
      value = currencyFormat(value);
    }
    newItems[index] = {
      ...newItems[index],
      [name]: value,
    };
    setItems(newItems);
    handleItemsChange(newItems);
  };
  return (
    <Box
      component='form'
      noValidate
      autoComplete='on'>
      <Typography
        variant='h4'
        paddingBottom={2}>
        {formTitle}
      </Typography>
      <FormControl
        fullWidth
        component='fieldset'
        sx={{ mb: 2 }}>
        <InputLabel id='category-select-label'>Categoria</InputLabel>
        <Select
          labelId='category-select-label'
          id='category'
          value={transaction.transactionCategory}
          name='transactionCategory'
          label='Categoria'
          data-testid='transaction-category-select'
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
      
      {/* Fiscal Book Selection */}
      {/* <Box sx={{ mb: 2 }}>
        {isInArchivedBook && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LockIcon fontSize="small" />
              <Typography variant="body2">
                Esta transação pertence a um livro fiscal arquivado e não pode ser editada.
              </Typography>
            </Box>
          </Alert>
        )}
        
        <TransactionFiscalBookSelector
          selectedFiscalBook={selectedFiscalBook}
          onFiscalBookChange={handleFiscalBookChange}
          disabled={isInArchivedBook}
          showTransferOption={isEditing}
          transaction={transaction}
        />
        
        {selectedFiscalBook && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MenuBookIcon color="action" fontSize="small" />
            <Typography variant="caption" color="text.secondary">
              Livro Fiscal: {selectedFiscalBook.name} ({selectedFiscalBook.year})
              {selectedFiscalBook.status === 'archived' && ' - Arquivado'}
            </Typography>
          </Box>
        )}
      </Box> */}

      {/* Fiscal Book Section */}
      <Box sx={{ mb: 2 }}>
        {isInArchivedBook && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LockIcon fontSize="small" />
              Esta transação pertence a um livro fiscal arquivado e não pode ser editada.
            </Box>
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <MenuBookIcon color="primary" />
          <Typography variant="h6">Livro Fiscal</Typography>
        </Box>
        
        {selectedFiscalBook && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Livro atual:
            </Typography>
            <Chip
              label={`${selectedFiscalBook.name} (${selectedFiscalBook.year})`}
              color={selectedFiscalBook.status === 'archived' ? 'default' : 'primary'}
              variant="outlined"
              icon={selectedFiscalBook.status === 'archived' ? <LockIcon /> : <MenuBookIcon />}
            />
          </Box>
        )}
        
        <TransactionFiscalBookSelector
          selectedFiscalBook={selectedFiscalBook}
          onFiscalBookChange={handleFiscalBookChange}
          disabled={isInArchivedBook}
          showTransferOption={isEditing && selectedFiscalBook}
          transaction={transaction}
        />
      </Box>

      <TextField
        fullWidth
        label='Nome da Transação'
        name='transactionName'
        value={transaction.transactionName}
        onChange={handleInputChange}
        margin='normal'
        variant='outlined'
      />
      <TextField
        fullWidth
        label='Descrição da Transação'
        name='transactionDescription'
        value={transaction.transactionDescription}
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
        fullWidth
        label='Valor'
        name='transactionValue'
        type='text'
        value={currencyFormat(transaction.transactionValue)}
        onChange={handleInputChange}
        margin='normal'
        variant='outlined'
      />
      <TextField
        fullWidth
        label='Valor do Frete'
        name='freightValue'
        type='text'
        value={
          transaction.transactionLocation !== 'online'
            ? ''
            : currencyFormat(transaction.freightValue)
        }
        onChange={handleInputChange}
        margin='normal'
        disabled={transaction.transactionLocation !== 'online'}
        variant='outlined'
      />
      <FormControl
        fullWidth
        component='fieldset'
        sx={{ mb: 2 }}>
        <InputLabel id='source-select-label'>Origem da transação</InputLabel>
        <Select
          labelId='source-select-label'
          id='source'
          value={transaction.transactionSource}
          name='transactionSource'
          label='Origem da transação'
          data-testid='transaction-source-select'
          onChange={handleInputChange}>
          {transactionSources.map((source) => (
            <MenuItem
              key={source.id}
              value={source.id}>
              {source.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl
        fullWidth
        component='fieldset'
        sx={{ mb: 2 }}>
        <InputLabel id='status-select-label'>Status</InputLabel>
        <Select
          labelId='status-select-label'
          id='status'
          value={transaction.transactionStatus}
          name='transactionStatus'
          label='Status'
          data-testid='transaction-status-select'
          onChange={handleInputChange}>
          {transactionStatuses.map((status) => (
            <MenuItem
              key={status.id}
              value={status.id}>
              {status.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl
        fullWidth
        component='fieldset'
        sx={{ mb: 2 }}>
        <InputLabel id='payment-method-select-label'>
          Método de Pagamento
        </InputLabel>
        <Select
          labelId='payment-method-select-label'
          id='paymentMethod'
          value={transaction.paymentMethod}
          name='paymentMethod'
          label='Método de Pagamento'
          data-testid='payment-method-select'
          onChange={handleInputChange}>
          {paymentMethods.map((method) => (
            <MenuItem
              key={method.id}
              value={method.id}>
              {method.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl
        fullWidth
        component='fieldset'
        sx={{ mb: 2 }}>
        <InputLabel id='location-select-label'>Localização</InputLabel>
        <Select
          labelId='location-select-label'
          id='location'
          value={transaction.transactionLocation}
          name='transactionLocation'
          label='Localização'
          data-testid='transaction-location-select'
          onChange={handleInputChange}>
          {transactionLocations.map((location) => (
            <MenuItem
              key={location.id}
              value={location.id}>
              {location.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <LocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={ptBR}>
        <DatePicker
          label='Data'
          value={dateValue}
          onChange={handleDateChange}
          sx={{ marginTop: 2, marginBottom: 1, width: '100%' }}
          slotProps={{
            textField: {
              fullWidth: true,
            },
          }}
        />
      </LocalizationProvider>
      <TextField
        fullWidth
        label='Nome da Empresa'
        name='companyName'
        value={transaction.companyName}
        onChange={handleInputChange}
        margin='normal'
        variant='outlined'
      />
      <TextField
        fullWidth
        label='Nome do Vendedor da Empresa'
        name='companySellerName'
        value={transaction.companySellerName}
        onChange={handleInputChange}
        margin='normal'
        variant='outlined'
        disabled={transaction.transactionType !== 'debit'}
      />
      <TextField
        fullWidth
        label='CNPJ da Empresa'
        name='companyCnpj'
        value={transaction.companyCnpj}
        onChange={handleInputChange}
        margin='normal'
        variant='outlined'
      />
      <TextField
        fullWidth
        label='Nota Fiscal'
        name='transactionFiscalNote'
        type='text'
        value={transaction.transactionFiscalNote}
        onChange={handleInputChange}
        margin='normal'
        variant='outlined'
        disabled={transaction.transactionType !== 'debit'}
      />

      {/* Itens da compra */}
      {transaction.transactionType === 'debit' && (
        <>
          <Typography
            variant='h5'
            paddingTop={3}
            paddingBottom={2}>
            Itens inclusos na despesa
          </Typography>
          <Grid
            container
            spacing={2}>
            {items.map((item, index) => (
              <Grid
                item
                xs={12}
                md={6}
                key={`item${index + 1}`}>
                <Box
                  sx={{
                    border: '1px dashed grey',
                    padding: 2,
                    marginBottom: 2,
                    position: 'relative',
                  }}>
                  <Typography
                    variant='h6'
                    sx={{ display: 'inline-block', marginRight: '8px' }}>
                    Item {index + 1}
                  </Typography>
                  <IconButton
                    aria-label='delete'
                    onClick={() => handleRemoveItem(index)}
                    sx={{ position: 'absolute', top: '8px', right: '8px' }}>
                    <DeleteIcon color='warning' />
                  </IconButton>
                  {/*  */}
                  <TextField
                    fullWidth
                    label='Nome do Item'
                    name='itemName'
                    value={item.itemName}
                    onChange={(e) => handleItemChange(index, e)}
                    margin='normal'
                    variant='outlined'
                  />
                  <TextField
                    fullWidth
                    label='Descrição do Item'
                    name='itemDescription'
                    value={item.itemDescription}
                    onChange={(e) => handleItemChange(index, e)}
                    margin='normal'
                    variant='outlined'
                  />
                  <TextField
                    fullWidth
                    label='Valor do Item'
                    name='itemValue'
                    type='text'
                    value={currencyFormat(item.itemValue)}
                    onChange={(e) => handleItemChange(index, e)}
                    margin='normal'
                    variant='outlined'
                  />
                  <TextField
                    fullWidth
                    label='Unidades do Item'
                    name='itemUnits'
                    type='number'
                    value={item.itemUnits}
                    onChange={(e) => handleItemChange(index, e)}
                    margin='normal'
                    variant='outlined'
                    inputProps={{ min: '1', step: '1' }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
          <Button
            variant='contained'
            color='primary'
            onClick={handleAddItem}
            sx={{ mt: 2, mb: 2 }}>
            Adicionar Item
          </Button>
        </>
      )}
    </Box>
  );
};

TransactionForm.propTypes = {
  formTitle: PropTypes.string,
  transaction: PropTypes.shape({
    id: PropTypes.string,
    transactionDate: PropTypes.instanceOf(Date),
    transactionPeriod: PropTypes.string, // month and year of transaction
    transactionSource: PropTypes.string, // manual, nubank, digio, mercadolivre, flash
    transactionValue: PropTypes.string,
    transactionName: PropTypes.string, // brief description/name about the transaction
    transactionDescription: PropTypes.string, // detailed information about the transaction
    transactionFiscalNote: PropTypes.string, // fiscal note key
    transactionId: PropTypes.string, // transaction id from the transaction source
    transactionStatus: PropTypes.string, // concluded, refunded, started
    transactionLocation: PropTypes.string, // 'online', 'local'
    transactionType: PropTypes.string, // 'credit', 'debit'
    transactionCategory: PropTypes.string, // category id
    freightValue: PropTypes.string, // only applicable for online transaction of physical product
    paymentMethod: PropTypes.string, // 'money', 'pix', 'boleto', 'debit card', 'credit card', 'benefit card', 'other'
    items: PropTypes.arrayOf(
      PropTypes.shape({
        itemName: PropTypes.string, // brief description/name about the item
        itemDescription: PropTypes.string, // detailed information about the item
        itemValue: PropTypes.string, // individual value of item
        itemUnits: PropTypes.number, // amount of units of the same item
      })
    ),
    companyName: PropTypes.string, // company name
    companySellerName: PropTypes.string, // seller name from the company
    companyCnpj: PropTypes.string, // company identification key
  }),
  handleInputChange: PropTypes.func,
  handleDateChange: PropTypes.func,
  handleItemsChange: PropTypes.func,
  handleFiscalBookChange: PropTypes.func,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  dateValue: PropTypes.instanceOf(Date),
  isEditing: PropTypes.bool,
  selectedFiscalBook: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    year: PropTypes.number,
    status: PropTypes.string,
  }),
  isInArchivedBook: PropTypes.bool,
};

export default TransactionForm;
