import React, { useState } from 'react';
import { searchDescription } from '../helpers/searchers.js';
import { AppBar, Toolbar, TextField, Box } from '@mui/material';
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
    <AppBar
      position='static'
      color='primary'>
      <Toolbar>
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
              [theme.breakpoints.down('sm')]: { width: '100%' },
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

// SearchBar.propTypes = {
//   array: PropTypes.array.isRequired,
//   onDataChange: PropTypes.func.isRequired,
// };

export default SearchBar;
