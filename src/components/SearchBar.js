import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import { searchDescription } from '../helpers/searchers.js';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const SearchBar = ({ array, onDataChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const onChangeSearchTransaction = (searchName) => {
    let transactionsSearchList = searchDescription(searchName, array);

    if (transactionsSearchList.length > 0) {
      onDataChange(searchName, transactionsSearchList);
    } else {
      onDataChange(searchName, []);
    }
  };

  return (
    <Box
      sx={{ width: '50%', margin: 'auto' }}
      fullWidth>
      <Search sx={{ borderRadius: 2 }}>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder='Buscar...'
          inputProps={{ 'aria-label': 'search' }}
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
        />
      </Search>
    </Box>
  );
};

SearchBar.propTypes = {
  array: PropTypes.array.isRequired,
  onDataChange: PropTypes.func.isRequired,
};

export default SearchBar;
