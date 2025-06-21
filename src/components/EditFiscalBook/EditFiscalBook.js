import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Breadcrumbs,
  Link,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import { 
  NavigateNext as NavigateNextIcon, 
  ArrowBack as ArrowBackIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import FiscalBookForm from '../FiscalBookForm';
import fiscalBookService from '../../services/fiscalBookService';
import { 
  formatFiscalBookForDisplay, 
  isFiscalBookEditable, 
} from '../fiscalBookPrototype';
import LoadingIndicator from '../../ui/LoadingIndicator';

/**
 * EditFiscalBook - Component for editing existing fiscal books
 * @param {Object} props - Component props
 * @param {string} props.fiscalBookId - ID of the fiscal book to edit
 * @param {Function} props.onSuccess - Callback when fiscal book is successfully updated
 * @param {Function} props.onCancel - Callback when editing is cancelled
 * @param {Function} props.onBack - Callback when back button is clicked
 */
function EditFiscalBook({ fiscalBookId, onSuccess, onCancel, onBack }) {
  const [fiscalBook, setFiscalBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load fiscal book data
  const loadFiscalBook = useCallback(async () => {
    if (!fiscalBookId) {
      setError('No fiscal book ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const bookData = await fiscalBookService.getById(fiscalBookId);
      const formattedBook = formatFiscalBookForDisplay(bookData);
      setFiscalBook(formattedBook);
    } catch (err) {
      console.error('Error loading fiscal book:', err);
      setError('Failed to load fiscal book. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fiscalBookId]);

  // Load fiscal book on component mount
  useEffect(() => {
    loadFiscalBook();
  }, [loadFiscalBook]);

  // Handle successful update
  const handleSuccess = (updatedFiscalBook) => {
    setSuccessMessage(`Livro fiscal "${updatedFiscalBook.bookName || updatedFiscalBook.name}" foi atualizado com sucesso!`);
    
    // Update local state
    const formattedBook = formatFiscalBookForDisplay(updatedFiscalBook);
    setFiscalBook(formattedBook);
    
    // Call success callback after a short delay to show the success message
    setTimeout(() => {
      if (onSuccess) {
        onSuccess(updatedFiscalBook);
      }
    }, 2000);
  };

  // Handle form cancellation
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // Get status chip color
  const getStatusChipColor = (status) => {
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

  // Get status chip label
  const getStatusChipLabel = (status) => {
    return status || 'Desconhecido';
  };

  if (loading) {
    return <LoadingIndicator message="Loading fiscal book..." />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={loadFiscalBook}>
            Tentar Novamente
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!fiscalBook) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="warning">
          Livro fiscal não encontrado.
        </Alert>
      </Container>
    );
  }

  const isEditable = isFiscalBookEditable(fiscalBook);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 2 }}
      >
        <Link
          component="button"
          variant="body1"
          onClick={handleBack}
          sx={{ textDecoration: 'none' }}
        >
          Livros Fiscais
        </Link>
        <Typography color="text.primary">
          Editar: {fiscalBook.bookName || fiscalBook.name}
        </Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 2 }}
      >
        Voltar aos Livros Fiscais
      </Button>

      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Main Content */}
      <Paper elevation={1} sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" component="h1">
                Editar Livro Fiscal
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                Modificar detalhes e configurações do livro fiscal
              </Typography>
            </Box>
            <Chip
              label={getStatusChipLabel(fiscalBook.status)}
              color={getStatusChipColor(fiscalBook.status)}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit' }}
            />
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Editability Warning */}
          {!isEditable && (
            <Alert 
              severity="warning" 
              sx={{ mb: 3 }}
              icon={<LockIcon />}
            >
              <Typography variant="body2">
                <strong>Este livro fiscal não pode ser editado</strong><br />
                {fiscalBook.status === 'Fechado'
                  ? 'Livros fiscais fechados são protegidos contra modificações. Você pode reabri-lo para fazer alterações.'
                  : 'Livros fiscais arquivados não podem ser modificados.'
                }
              </Typography>
            </Alert>
          )}

          {/* Fiscal Book Information */}
          <Box sx={{ mb: 3, p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Informações Atuais
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Transações:</strong> {fiscalBook.transactionCount || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Criado:</strong> {fiscalBook.createdAtFormatted || (fiscalBook.createdAt ? new Date(fiscalBook.createdAt).toLocaleDateString('pt-BR') : 'N/A')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Última Atualização:</strong> {fiscalBook.updatedAtFormatted || (fiscalBook.updatedAt ? new Date(fiscalBook.updatedAt).toLocaleDateString('pt-BR') : 'N/A')}
                </Typography>
              </Grid>
              {(fiscalBook.closedAtFormatted || fiscalBook.closedAt) && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="warning.main">
                    <strong>Fechado:</strong> {fiscalBook.closedAtFormatted || new Date(fiscalBook.closedAt).toLocaleDateString('pt-BR')}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {/* Financial Summary */}
            {(fiscalBook.totalIncome > 0 || fiscalBook.totalExpenses > 0) && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Resumo Financeiro
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="success.main">
                      <strong>Total de Receitas:</strong> {fiscalBook.formattedTotalIncome}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="error.main">
                      <strong>Total de Despesas:</strong> {fiscalBook.formattedTotalExpenses}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.primary">
                      <strong>Valor Líquido:</strong> {fiscalBook.formattedNetAmount}
                    </Typography>
                  </Grid>
                </Grid>
              </>
            )}
          </Box>

          {/* Edit Form */}
          <FiscalBookForm
            fiscalBook={fiscalBook}
            onSave={handleSuccess}
            onCancel={handleCancel}
            isEditing={true}
          />

          {/* Protection Notice */}
          {fiscalBook.transactionCount > 0 && (
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <CheckCircleIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Este livro fiscal contém {fiscalBook.transactionCount} transação(ões). 
                Alterações nas configurações do livro não afetarão transações existentes.
              </Typography>
            </Alert>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

EditFiscalBook.propTypes = {
  fiscalBookId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  onBack: PropTypes.func,
};

EditFiscalBook.defaultProps = {
  onSuccess: null,
  onCancel: null,
  onBack: null,
};

export default EditFiscalBook;
