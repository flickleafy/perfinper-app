import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { searchDescription } from '../helpers/searchers.js';
import { TextField, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const SearchBar = ({ array, onDataChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();

  const onChangeSearchTransaction = (searchName) => {
    let transactionsSearchList = searchDescription(searchName, array);

    if (transactionsSearchList.length > 0) {
      onDataChange(searchName, transactionsSearchList);
    } else {
      onDataChange(searchName, []);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
      <TextField
        variant='outlined'
        placeholder='Buscar por descrição'
        value={searchTerm}
        onChange={(event) => {
          const { value } = event.target;
          setSearchTerm(value);
          if (value.length >= 3) {
            onChangeSearchTransaction(value);
          } else {
            onDataChange('', []);
          }
        }}
        sx={{
          width: '50%',
          background: theme.palette.background.paper, // Set the background color to match the theme's paper color
          borderRadius: '4px', // Match border radius to theme standards
          [theme.breakpoints.down('sm')]: { width: '100%' },
        }}
      />
    </Box>
  );
};

SearchBar.propTypes = {
  array: PropTypes.array.isRequired,
  onDataChange: PropTypes.func.isRequired,
};

export default SearchBar;
