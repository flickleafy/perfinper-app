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

export default TransactionForm;

TransactionForm.propTypes = {
  formTitle: PropTypes.string,
  transaction: PropTypes.any,
  handleInputChange: PropTypes.func,
  handleDateChange: PropTypes.func,
  categories: PropTypes.array,
  dateValue: PropTypes.any,
};
