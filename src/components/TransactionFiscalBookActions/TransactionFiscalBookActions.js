import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  MoreVert,
  MenuBook,
  SwapHoriz,
  Assignment,
  RemoveCircle,
} from '@mui/icons-material';
import fiscalBookService from '../../services/fiscalBookService.js';

const TransactionFiscalBookActions = ({ 
  transaction, 
  onTransactionUpdated,
  anchorEl,
  open,
  onClose,
  onOpen,
}) => {
  const [fiscalBooks, setFiscalBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadFiscalBooks();
    }
  }, [open]);

  const loadFiscalBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fiscalBookService.getAll();
      setFiscalBooks(response || []);
    } catch (err) {
      console.error('Error loading fiscal books:', err);
      setError('Erro ao carregar livros fiscais');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToBook = async (fiscalBookId) => {
    try {
      setOperationLoading(true);
      setError(null);
      
      await fiscalBookService.addTransactions(fiscalBookId, [transaction.id]);
      
      if (onTransactionUpdated) {
        onTransactionUpdated({
          ...transaction,
          fiscalBookId,
          fiscalBookName: fiscalBooks.find(b => b._id === fiscalBookId)?.name,
          fiscalBookYear: fiscalBooks.find(b => b._id === fiscalBookId)?.year,
        });
      }
      
      onClose();
    } catch (err) {
      console.error('Error assigning transaction to fiscal book:', err);
      setError('Erro ao atribuir transação ao livro fiscal');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleRemoveFromBook = async () => {
    try {
      setOperationLoading(true);
      setError(null);
      
      await fiscalBookService.removeTransactions(transaction.fiscalBookId, [transaction.id]);
      
      if (onTransactionUpdated) {
        onTransactionUpdated({
          ...transaction,
          fiscalBookId: null,
          fiscalBookName: null,
          fiscalBookYear: null,
        });
      }
      
      onClose();
    } catch (err) {
      console.error('Error removing transaction from fiscal book:', err);
      setError('Erro ao remover transação do livro fiscal');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleTransferToBook = async (targetFiscalBookId) => {
    try {
      setOperationLoading(true);
      setError(null);
      
      await fiscalBookService.transferTransactions(
        transaction.fiscalBookId,
        targetFiscalBookId,
        [transaction.id]
      );
      
      if (onTransactionUpdated) {
        onTransactionUpdated({
          ...transaction,
          fiscalBookId: targetFiscalBookId,
          fiscalBookName: fiscalBooks.find(b => b._id === targetFiscalBookId)?.name,
          fiscalBookYear: fiscalBooks.find(b => b._id === targetFiscalBookId)?.year,
        });
      }
      
      onClose();
    } catch (err) {
      console.error('Error transferring transaction:', err);
      setError('Erro ao transferir transação');
    } finally {
      setOperationLoading(false);
    }
  };

  const availableBooksForAssignment = fiscalBooks.filter(book => 
    book.status === 'Ativo' && book._id !== transaction.fiscalBookId
  );

  const availableBooksForTransfer = fiscalBooks.filter(book => 
    book.status === 'Ativo' && book._id !== transaction.fiscalBookId
  );

  return (
    <>
      <IconButton onClick={onOpen} size="small">
        <MoreVert />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: '300px',
          },
        }}
      >
        {/* Current fiscal book info */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Livro Fiscal Atual:
          </Typography>
          {transaction.fiscalBookId ? (
            <Chip
              size="small"
              icon={<MenuBook />}
              label={`${transaction.fiscalBookName || 'Desconhecido'} (${transaction.fiscalBookYear || 'N/A'})`}
              color="primary"
              variant="outlined"
              sx={{ mt: 0.5, display: 'block', width: 'fit-content' }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nenhum livro fiscal atribuído
            </Typography>
          )}
        </Box>

        <Divider />

        {loading && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Carregando livros fiscais...
            </Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error" size="small">
              {error}
            </Alert>
          </Box>
        )}

        {!loading && !error && (
          <>
            {/* Remove from current book */}
            {transaction.fiscalBookId && (
              <>
                <MenuItem 
                  onClick={handleRemoveFromBook}
                  disabled={operationLoading}
                >
                  <ListItemIcon>
                    <RemoveCircle color="error" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Remover do Livro Fiscal"
                    secondary="Remove a transação do livro atual"
                  />
                </MenuItem>
                <Divider />
              </>
            )}

            {/* Assign to book */}
            {!transaction.fiscalBookId && availableBooksForAssignment.length > 0 && (
              <>
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Atribuir ao Livro:
                  </Typography>
                </Box>
                {availableBooksForAssignment.map((book) => (
                  <MenuItem 
                    key={book._id}
                    onClick={() => handleAssignToBook(book._id)}
                    disabled={operationLoading}
                  >
                    <ListItemIcon>
                      <Assignment color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={book.name}
                      secondary={`${book.year} • ${book.transactionCount || 0} transações`}
                    />
                  </MenuItem>
                ))}
                <Divider />
              </>
            )}

            {/* Transfer to book */}
            {transaction.fiscalBookId && availableBooksForTransfer.length > 0 && (
              <>
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Transferir para:
                  </Typography>
                </Box>
                {availableBooksForTransfer.map((book) => (
                  <MenuItem 
                    key={book._id}
                    onClick={() => handleTransferToBook(book._id)}
                    disabled={operationLoading}
                  >
                    <ListItemIcon>
                      <SwapHoriz color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={book.name}
                      secondary={`${book.year} • ${book.transactionCount || 0} transações`}
                    />
                  </MenuItem>
                ))}
              </>
            )}

            {/* No books available message */}
            {availableBooksForAssignment.length === 0 && availableBooksForTransfer.length === 0 && !transaction.fiscalBookId && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhum livro fiscal ativo disponível
                </Typography>
              </Box>
            )}
          </>
        )}

        {operationLoading && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
          }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Menu>
    </>
  );
};

TransactionFiscalBookActions.propTypes = {
  transaction: PropTypes.object.isRequired,
  onTransactionUpdated: PropTypes.func,
  anchorEl: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
};

export default TransactionFiscalBookActions;
