import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, InputBase } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { searchFields } from '../infrastructure/searcher/searchers.js';

const SearchBar = ({ array, onDataChange, sx }) => {
  const fields = [
    'companyCnpj',
    'companyName',
    'companySellerName',
    'transactionName',
    'transactionDescription',
  ];
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);

  const onChangeSearchTransaction = (searchName) => {
    let transactionsSearchList = searchFields(searchName, array, fields);

    if (transactionsSearchList.length > 0) {
      onDataChange(searchName, transactionsSearchList);
    } else {
      onDataChange(searchName, []);
    }
  };

  return (
    <Box
      sx={{ width: '50%', margin: 'auto', ...sx }}>
      <Search onClick={() => inputRef.current?.focus()}>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          inputRef={inputRef}
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
  sx: PropTypes.object,
};

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  cursor: 'text',
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  // marginRight: theme.spacing(2),
  // marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    // marginLeft: theme.spacing(3),
    width: '100%',
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
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
  },
}));

export default SearchBar;
