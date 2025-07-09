import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  MenuItem,
  Box,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import { MenuBook } from '@mui/icons-material';
import fiscalBookService from '../../services/fiscalBookService.js';
import { StyledSelect } from '../../ui/Inputs/StyledSelect.js';
import { StyledInputLabel } from '../../ui/Inputs/StyledInputLabel.js';

const getStatusColor = (status) => {
  switch (status) {
    case 'Aberto':
      return 'success';
    case 'Fechado':
      return 'warning';
    case 'Em Revisão':
      return 'info';
    case 'Arquivado':
      return 'default';
    default:
      return 'default';
  }
};

const FiscalBookFilter = ({ selectedFiscalBookId, onFiscalBookChange, sx }) => {
  const [fiscalBooks, setFiscalBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactionCounts, setTransactionCounts] = useState({});
  const [isErrorToastOpen, setIsErrorToastOpen] = useState(false);

  useEffect(() => {
    loadFiscalBooks();
  }, []);

  useEffect(() => {
    if (error) {
      setIsErrorToastOpen(true);
    }
  }, [error]);

  const loadFiscalBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fiscalBookService.getAll();
      const books = response || [];
      setFiscalBooks(books);

      // Fetch transaction counts for each book
      const counts = {};
      await Promise.all(
        books.map(async (book) => {
          try {
            // Validate that book has a valid id before making API call
            if (!book.id || book.id === 'undefined' || typeof book.id !== 'string') {
              console.warn(`Invalid book ID for book:`, book);
              counts[book.id] = 0;
              return;
            }
            
            const transactions = await fiscalBookService.getTransactions(book.id);
            counts[book.id] = Array.isArray(transactions) ? transactions.length : 0;
          } catch (err) {
            console.warn(`Failed to load transaction count for book ${book.id}:`, err);
            counts[book.id] = 0;
          }
        })
      );
      setTransactionCounts(counts);
    } catch (err) {
      console.error('Error loading fiscal books:', err);
      setError('Erro ao carregar livros fiscais');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const value = event.target.value;
    onFiscalBookChange(value === 'all' ? null : value);
  };

  const renderSelectedValue = (value) => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <CircularProgress size={16} />
          <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Carregando...
          </Box>
        </Box>
      );
    }

    if (value === 'all') {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <MenuBook sx={{ mr: 1, fontSize: 18 }} />
          <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Todos os Livros
          </Box>
        </Box>
      );
    }

    if (value === 'none') {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <MenuBook sx={{ mr: 1, fontSize: 18 }} />
          <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Sem Livro Fiscal
          </Box>
        </Box>
      );
    }

    const book = fiscalBooks.find((b) => b.id === value);
    if (!book) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <MenuBook sx={{ mr: 1, fontSize: 18 }} />
          <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Livro Fiscal
          </Box>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        <MenuBook sx={{ fontSize: 18 }} />
        <Box
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
            flex: 1,
          }}
        >
          {book.bookName} ({book.bookPeriod})
        </Box>
        <Chip
          size="small"
          label={book.status}
          color={getStatusColor(book.status)}
          sx={{
            minWidth: 0,
            maxWidth: 110,
            flexShrink: 1,
            '& .MuiChip-label': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }}
        />
      </Box>
    );
  };

  return (
    <>
      <FormControl
        sx={{ width: '100%', minWidth: 0, maxWidth: '100%', ...sx }}
        data-testid="fiscal-book-filter"
      >
        <StyledInputLabel id="fiscal-book-filter-label">Livro Fiscal</StyledInputLabel>
        <StyledSelect
          labelId="fiscal-book-filter-label"
          id="fiscal-book-filter"
          value={selectedFiscalBookId || 'all'}
          label="Livro Fiscal"
          onChange={handleChange}
          renderValue={renderSelectedValue}
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
            },
          }}
        >
          <MenuItem value="all">Todos os Livros</MenuItem>
          <MenuItem value="none">Sem Livro Fiscal</MenuItem>
          {error ? (
            <MenuItem disabled>{error}</MenuItem>
          ) : (
            fiscalBooks
              .filter(
                (book) => book.id && book.id !== 'undefined' && typeof book.id === 'string'
              )
              .map((book) => (
                <MenuItem key={book.id} value={book.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', minWidth: 0 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {book.bookName}
                      </Box>
                      <Box
                        sx={{
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {book.bookPeriod} • {book.bookType} • {transactionCounts[book.id] || 0} transações
                      </Box>
                    </Box>
                    <Chip
                      size="small"
                      label={book.status}
                      color={getStatusColor(book.status)}
                      sx={{ flexShrink: 0 }}
                    />
                  </Box>
                </MenuItem>
              ))
          )}
        </StyledSelect>
      </FormControl>

      <Snackbar
        open={isErrorToastOpen}
        autoHideDuration={6000}
        onClose={() => setIsErrorToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setIsErrorToastOpen(false)}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

FiscalBookFilter.propTypes = {
  selectedFiscalBookId: PropTypes.string,
  onFiscalBookChange: PropTypes.func.isRequired,
  sx: PropTypes.object,
};

export default FiscalBookFilter;
