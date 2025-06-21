import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  CircularProgress,
} from '@mui/material';
import { MenuBook, Clear } from '@mui/icons-material';
import fiscalBookService from '../../services/fiscalBookService.js';

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

  useEffect(() => {
    loadFiscalBooks();
  }, []);

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

  const handleClear = () => {
    onFiscalBookChange(null);
  };

  const selectedBook = fiscalBooks.find(book => book.id === selectedFiscalBookId);

  return (
    <Box sx={{ minWidth: 200, ...sx }}>
      <FormControl fullWidth size="small">
        <InputLabel id="fiscal-book-filter-label">
          Livro Fiscal
        </InputLabel>
        <Select
          labelId="fiscal-book-filter-label"
          id="fiscal-book-filter"
          value={selectedFiscalBookId || 'all'}
          label="Livro Fiscal"
          onChange={handleChange}
          startAdornment={
            loading ? (
              <CircularProgress size={16} sx={{ mr: 1 }} />
            ) : (
              <MenuBook sx={{ mr: 1, color: 'action.active' }} />
            )
          }
          endAdornment={
            selectedFiscalBookId && (
              <Clear
                sx={{ 
                  cursor: 'pointer', 
                  mr: 1,
                  color: 'action.active',
                  '&:hover': { color: 'primary.main' }
                }}
                onClick={handleClear}
              />
            )
          }
        >
          <MenuItem value="all">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MenuBook sx={{ mr: 1, fontSize: 18 }} />
              Todos os Livros
            </Box>
          </MenuItem>
          
          <MenuItem value="none">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Clear sx={{ mr: 1, fontSize: 18 }} />
              Sem Livro Fiscal
            </Box>
          </MenuItem>

          {fiscalBooks
            .filter(book => book.id && book.id !== 'undefined' && typeof book.id === 'string')
            .map((book) => (
            <MenuItem key={book.id} value={book.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <MenuBook sx={{ mr: 1, fontSize: 18 }} />
                <Box sx={{ flex: 1 }}>
                  <Box>{book.bookName}</Box>
                  <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {book.bookPeriod} • {book.bookType} • {transactionCounts[book.id] || 0} transações
                  </Box>
                </Box>
                <Chip
                  size="small"
                  label={book.status}
                  color={getStatusColor(book.status)}
                  sx={{ ml: 1 }}
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Show selected book info */}
      {selectedBook && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
          <Chip
            size="small"
            icon={<MenuBook />}
            label={`${selectedBook.bookName} (${selectedBook.bookPeriod})`}
            color="primary"
            variant="outlined"
            onDelete={handleClear}
          />
        </Box>
      )}

      {error && (
        <Box sx={{ mt: 1, color: 'error.main', fontSize: '0.75rem' }}>
          {error}
        </Box>
      )}
    </Box>
  );
};

FiscalBookFilter.propTypes = {
  selectedFiscalBookId: PropTypes.string,
  onFiscalBookChange: PropTypes.func.isRequired,
  sx: PropTypes.object,
};

export default FiscalBookFilter;
