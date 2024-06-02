import React from 'react';
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
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { ptBR } from 'date-fns/locale';

// interface TransactionFormProps {
//   transaction: any;
//   handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
//   handleDateChange: (date: Date | null) => void;
//   categories: Array<{ id: string, name: string }>;
//   dateValue: Date | null;
// }

const TransactionForm = ({
  formTitle,
  transaction,
  handleInputChange,
  handleDateChange,
  categories,
  dateValue,
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
    { id: 'digio', name: 'Digio' },
    { id: 'mercadolivre', name: 'Mercado Livre' },
    { id: 'flash', name: 'Flash' },
  ];
  const transactionStatuses = [
    { id: 'concluded', name: 'Concluido' },
    { id: 'refunded', name: 'Estornado' },
    { id: 'started', name: 'Iniciado' },
  ];
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
        value={transaction.transactionValue}
        onChange={handleInputChange}
        margin='normal'
        variant='outlined'
      />
      <TextField
        fullWidth
        label='Valor do Frete'
        name='freightValue'
        value={transaction.freightValue}
        onChange={handleInputChange}
        margin='normal'
        disabled={transaction.transactionLocation === 'local'}
        variant='outlined'
      />
      <FormControl
        fullWidth
        component='fieldset'
        sx={{ mb: 2 }}>
        <InputLabel id='source-select-label'>Origem</InputLabel>
        <Select
          labelId='source-select-label'
          id='source'
          value={transaction.transactionSource}
          name='transactionSource'
          label='Origem'
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
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
            />
          )}
        />
      </LocalizationProvider>
    </Box>
  );
};

TransactionForm.propTypes = {
  formTitle: PropTypes.string,
  transaction: PropTypes.any,
  handleInputChange: PropTypes.func,
  handleDateChange: PropTypes.func,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  dateValue: PropTypes.any,
};

export default TransactionForm;
