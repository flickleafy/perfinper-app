import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  MenuBook,
  SwapHoriz,
  Assignment,
  RemoveCircle,
  Receipt,
} from '@mui/icons-material';
import fiscalBookService from '../../services/fiscalBookService.js';

const FiscalBookBulkOperations = ({ 
  open, 
  onClose, 
  selectedTransactions = [],
  onOperationComplete 
}) => {
  const [fiscalBooks, setFiscalBooks] = useState([]);
  const [operation, setOperation] = useState(''); // 'assign', 'transfer', 'remove'
  const [sourceFiscalBookId, setSourceFiscalBookId] = useState('');
  const [targetFiscalBookId, setTargetFiscalBookId] = useState('');
  const [loading, setLoading] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      loadFiscalBooks();
      setOperation('');
      setSourceFiscalBookId('');
      setTargetFiscalBookId('');
      setError(null);
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

  const handleOperationChange = (value) => {
    setOperation(value);
    setSourceFiscalBookId('');
    setTargetFiscalBookId('');
    setError(null);
  };

  const handleExecuteOperation = async () => {
    if (!operation || selectedTransactions.length === 0) return;

    try {
      setOperationLoading(true);
      setError(null);

      const transactionIds = selectedTransactions.map(t => t.id);

      switch (operation) {
        case 'assign':
          if (!targetFiscalBookId) {
            setError('Selecione um livro fiscal para atribuir as transações');
            return;
          }
          await fiscalBookService.addTransactions(targetFiscalBookId, transactionIds);
          break;

        case 'transfer':
          if (!sourceFiscalBookId || !targetFiscalBookId) {
            setError('Selecione os livros de origem e destino para transferir as transações');
            return;
          }
          await fiscalBookService.transferTransactions(sourceFiscalBookId, targetFiscalBookId, transactionIds);
          break;

        case 'remove':
          if (!sourceFiscalBookId) {
            setError('Selecione o livro fiscal para remover as transações');
            return;
          }
          await fiscalBookService.removeTransactions(sourceFiscalBookId, transactionIds);
          break;

        default:
          /* istanbul ignore next */
          setError('Operação inválida');
          return;
      }

      if (onOperationComplete) {
        onOperationComplete(operation, {
          source: sourceFiscalBookId,
          target: targetFiscalBookId,
          transactionIds
        });
      }

      onClose();
    } catch (err) {
      console.error('Error executing bulk operation:', err);
      setError('Erro ao executar operação em lote');
    } finally {
      setOperationLoading(false);
    }
  };

  const getOperationTitle = () => {
    switch (operation) {
      case 'assign':
        return 'Atribuir ao Livro Fiscal';
      case 'transfer':
        return 'Transferir entre Livros Fiscais';
      case 'remove':
        return 'Remover do Livro Fiscal';
      default:
        return 'Selecione uma Operação';
    }
  };

  const getOperationDescription = () => {
    switch (operation) {
      case 'assign':
        return 'Atribuir as transações selecionadas a um livro fiscal';
      case 'transfer':
        return 'Transferir as transações selecionadas de um livro fiscal para outro';
      case 'remove':
        return 'Remover as transações selecionadas do livro fiscal atual';
      default:
        return 'Escolha uma operação para executar nas transações selecionadas';
    }
  };

  const getOperationIcon = () => {
    switch (operation) {
      case 'assign':
        return <Assignment color="success" />;
      case 'transfer':
        return <SwapHoriz color="primary" />;
      case 'remove':
        return <RemoveCircle color="error" />;
      default:
        return <MenuBook color="action" />;
    }
  };

  const activeFiscalBooks = fiscalBooks.filter(book => book.status === 'Ativo');
  const transactionsWithFiscalBook = selectedTransactions.filter(t => t.fiscalBookId);
  const transactionsWithoutFiscalBook = selectedTransactions.filter(t => !t.fiscalBookId);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getOperationIcon()}
          {getOperationTitle()}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {getOperationDescription()}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Operation Selection */}
            <FormControl fullWidth>
              <InputLabel>Tipo de Operação</InputLabel>
              <Select
                value={operation}
                onChange={(e) => handleOperationChange(e.target.value)}
                label="Tipo de Operação"
              >
                <MenuItem value="assign">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment color="success" />
                    Atribuir ao Livro Fiscal
                  </Box>
                </MenuItem>
                <MenuItem value="transfer">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SwapHoriz color="primary" />
                    Transferir entre Livros
                  </Box>
                </MenuItem>
                <MenuItem value="remove">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RemoveCircle color="error" />
                    Remover do Livro Fiscal
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Operation-specific controls */}
            {operation === 'assign' && (
              <FormControl fullWidth>
                <InputLabel>Livro Fiscal de Destino</InputLabel>
                <Select
                  value={targetFiscalBookId}
                  onChange={(e) => setTargetFiscalBookId(e.target.value)}
                  label="Livro Fiscal de Destino"
                >
                  {activeFiscalBooks.map((book) => (
                    <MenuItem key={book._id} value={book._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <MenuBook />
                        <Box sx={{ flex: 1 }}>
                          <Typography>{book.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {book.year} • {book.transactionCount || 0} transações
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {operation === 'transfer' && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Livro de Origem</InputLabel>
                  <Select
                    value={sourceFiscalBookId}
                    onChange={(e) => setSourceFiscalBookId(e.target.value)}
                    label="Livro de Origem"
                  >
                    {activeFiscalBooks.map((book) => (
                      <MenuItem key={book._id} value={book._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MenuBook />
                          {book.name} ({book.year})
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Livro de Destino</InputLabel>
                  <Select
                    value={targetFiscalBookId}
                    onChange={(e) => setTargetFiscalBookId(e.target.value)}
                    label="Livro de Destino"
                  >
                    {activeFiscalBooks
                      .filter(book => book._id !== sourceFiscalBookId)
                      .map((book) => (
                        <MenuItem key={book._id} value={book._id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MenuBook />
                            {book.name} ({book.year})
                          </Box>
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {operation === 'remove' && transactionsWithFiscalBook.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Livro Fiscal de Origem</InputLabel>
                <Select
                  value={sourceFiscalBookId}
                  onChange={(e) => setSourceFiscalBookId(e.target.value)}
                  label="Livro Fiscal de Origem"
                >
                  {[...new Set(transactionsWithFiscalBook.map(t => t.fiscalBookId))]
                    .map(bookId => fiscalBooks.find(b => b._id === bookId))
                    .filter(Boolean)
                    .map((book) => (
                      <MenuItem key={book._id} value={book._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MenuBook />
                          {book.name} ({book.year})
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}

            {/* Transaction Summary */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Transações Selecionadas ({selectedTransactions.length})
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {transactionsWithFiscalBook.length} com livro fiscal • {transactionsWithoutFiscalBook.length} sem livro fiscal
                </Typography>
              </Box>

              <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                {selectedTransactions.slice(0, 5).map((transaction) => (
                  <ListItem key={transaction.id}>
                    <ListItemIcon>
                      <Receipt fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={transaction.transactionDescription}
                      secondaryTypographyProps={{ component: 'div' }}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="caption">
                            R$ {transaction.transactionValue}
                          </Typography>
                          {transaction.fiscalBookId && (
                            <Chip
                              size="small"
                              label={`${transaction.fiscalBookName} (${transaction.fiscalBookYear})`}
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                {selectedTransactions.length > 5 && (
                  <ListItem>
                    <ListItemText
                      primary={`... e mais ${selectedTransactions.length - 5} transações`}
                      sx={{ textAlign: 'center', fontStyle: 'italic' }}
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={operationLoading}>
          Cancelar
        </Button>
        <Button
          onClick={handleExecuteOperation}
          variant="contained"
          disabled={!operation || selectedTransactions.length === 0 || operationLoading}
          startIcon={operationLoading ? <CircularProgress size={16} /> : getOperationIcon()}
        >
          {operationLoading ? 'Executando...' : 'Executar Operação'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

FiscalBookBulkOperations.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedTransactions: PropTypes.array,
  onOperationComplete: PropTypes.func,
};

export default FiscalBookBulkOperations;
