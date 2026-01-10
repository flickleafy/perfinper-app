import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  Alert,
  CircularProgress,
  ListItemText,
} from '@mui/material';
import fiscalBookService from '../../services/fiscalBookService';
import { 
  formatFiscalBookForDisplay, 
} from '../fiscalBookPrototype';

/**
 * TransactionFiscalBookSelector - Component for selecting fiscal books for transactions
 * @param {Object} props - Component props
 * @param {Object} props.selectedFiscalBook - Current selected fiscal book object
 * @param {Function} props.onFiscalBookChange - Callback when fiscal book changes
 * @param {boolean} props.disabled - Whether selector is disabled
 * @param {boolean} props.showTransferOption - Whether to show transfer option
 * @param {Object} props.transaction - Transaction object
 */
function TransactionFiscalBookSelector({
  selectedFiscalBook = null,
  onFiscalBookChange,
  disabled = false,
  showTransferOption = false,
  transaction = null,
}) {
  const [fiscalBooks, setFiscalBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Load fiscal books on component mount
  useEffect(() => {
    loadFiscalBooks();
  }, []);

  // Load available fiscal books
  const loadFiscalBooks = async () => {
    try {
      setLoading(true);
      setLoadError('');
      
      const books = await fiscalBookService.getAll();
      
      // Filter out archived books for assignment and format for display
      const filteredBooks = books
        .filter(book => {
          const formattedBook = formatFiscalBookForDisplay(book);
          return formattedBook.status !== 'Arquivado';
        })
        .map(formatFiscalBookForDisplay)
        .sort((a, b) => {
          // Sort by bookPeriod (desc) then by bookName (asc)
          const aPeriod = a.bookPeriod || a.year?.toString() || '';
          const bPeriod = b.bookPeriod || b.year?.toString() || '';
          if (aPeriod !== bPeriod) {
            return bPeriod.localeCompare(aPeriod);
          }
          const aName = a.bookName || a.name || '';
          const bName = b.bookName || b.name || '';
          return aName.localeCompare(bName);
        });

      setFiscalBooks(filteredBooks);
    } catch (err) {
      console.error('Error loading fiscal books:', err);
      setLoadError('Failed to load fiscal books');
    } finally {
      setLoading(false);
    }
  };

  // Handle selection change
  const handleChange = (event) => {
    const selectedValue = event.target.value;
    const selectedBook = fiscalBooks.find(
      (book) => (book.id || book._id) === selectedValue
    );

    if (onFiscalBookChange) {
      onFiscalBookChange(selectedBook || null);
    }
  };

  // Get selected book details
  // Try finding in loaded list props list, OR fallback to passed prop object if ID matches
  const selectedBookId = selectedFiscalBook?.id || selectedFiscalBook?._id || '';
  const selectedBook = fiscalBooks.find((book) => (book.id || book._id) === selectedBookId)
    || (selectedBookId ? selectedFiscalBook : null);

  const selectableBooks = fiscalBooks.filter((book) => (book.id || book._id));

  // Helper function to get status label in Portuguese
  const getStatusLabel = (status) => {
    return status || 'Desconhecido';
  };

  // Helper function to get status color for chip
  const getStatusColorForChip = (status) => {
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

  if (loadError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {loadError}
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="inherit">
            Unable to load fiscal books. Please try refreshing the page.
          </Typography>
        </Box>
      </Alert>
    );
  }

  return (
    <Box>
      <FormControl 
        fullWidth 
        disabled={disabled || loading}
      >
        <InputLabel id="fiscal-book-selector-label">
          Selecionar Livro Fiscal
        </InputLabel>
        <Select
          labelId="fiscal-book-selector-label"
          id="fiscal-book-selector"
          value={selectedBookId}
          label="Selecionar Livro Fiscal"
          onChange={handleChange}
          disabled={disabled}
          startAdornment={loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
        >
          <MenuItem value="">
            <em>Nenhum livro fiscal selecionado</em>
          </MenuItem>
          
          {selectableBooks.map((book) => {
            const bookId = book.id || book._id;
            return (
              <MenuItem key={bookId} value={bookId}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <ListItemText
                  primaryTypographyProps={{ component: 'div' }}
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">
                        {book.bookName || book.name}
                      </Typography>
                      <Chip
                        label={book.bookPeriod || book.year}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                      <Chip
                        label={getStatusLabel(book.status)}
                        size="small"
                        color={getStatusColorForChip(book.status)}
                      />
                    </Box>
                  }
                  secondary={
                    (book.notes || book.description) ? (
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {book.notes || book.description}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        {book.transactionCount || 0} transação(ões)
                      </Typography>
                    )
                  }
                />
              </Box>
            </MenuItem>
            );
          })}
        </Select>
      </FormControl>

      {/* Selected book information */}
      {selectedBook && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Detalhes do Livro Fiscal Selecionado
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2">
              <strong>Nome:</strong> {selectedBook.bookName || selectedBook.name}
            </Typography>
            <Typography variant="body2">
              <strong>Período:</strong> {selectedBook.bookPeriod || selectedBook.year}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong> {getStatusLabel(selectedBook.status)}
            </Typography>
            <Typography variant="body2">
              <strong>Transações:</strong> {selectedBook.transactionCount || 0}
            </Typography>
          </Box>
          
          {(selectedBook.notes || selectedBook.description) && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Observações:</strong> {selectedBook.notes || selectedBook.description}
            </Typography>
          )}

          {/* Status warnings */}
          {selectedBook.status === 'Fechado' && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <Typography variant="body2">
                Este livro fiscal está fechado. Novas transações ainda podem ser atribuídas, 
                mas as configurações do livro não podem ser modificadas.
              </Typography>
            </Alert>
          )}
          
          {selectedBook.status === 'Arquivado' && (
            <Alert severity="error" sx={{ mt: 1 }}>
              <Typography variant="body2">
                Este livro fiscal está arquivado. Transações não podem ser atribuídas a livros arquivados.
              </Typography>
            </Alert>
          )}
        </Box>
      )}

      {/* No books available warning */}
      {!loading && fiscalBooks.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Nenhum livro fiscal está disponível para atribuição. 
            Livros arquivados são excluídos automaticamente.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}

TransactionFiscalBookSelector.propTypes = {
  selectedFiscalBook: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    bookName: PropTypes.string,
    bookPeriod: PropTypes.string,
    status: PropTypes.string,
    // Legacy field support
    name: PropTypes.string,
    year: PropTypes.number,
  }),
  onFiscalBookChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  showTransferOption: PropTypes.bool,
  transaction: PropTypes.object,
};

TransactionFiscalBookSelector.defaultProps = {
  selectedFiscalBook: null,
  disabled: false,
  showTransferOption: false,
  transaction: null,
};

export default TransactionFiscalBookSelector;
