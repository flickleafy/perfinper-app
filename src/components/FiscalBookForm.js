import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Grid,
} from '@mui/material';
import { 
  validateFiscalBookName, 
  validateFiscalBookPeriod, 
  FISCAL_BOOK_TYPES, 
  FISCAL_BOOK_STATUS,
  TAX_REGIMES,
  FISCAL_PERIOD_OPTIONS,
  isFiscalBookEditable 
} from './fiscalBookPrototype';
import fiscalBookService from '../services/fiscalBookService';

/**
 * FiscalBookForm - Component for creating and editing fiscal books
 * @param {Object} props - Component props
 * @param {Object} props.fiscalBook - Existing fiscal book data (for editing)
 * @param {Function} props.onSave - Callback when fiscal book is saved
 * @param {Function} props.onCancel - Callback when form is cancelled
 * @param {boolean} props.isEditing - Whether this is an edit operation
 * @param {boolean} props.loading - Whether form is in loading state
 */
function FiscalBookForm({ 
  fiscalBook = null, 
  onSave, 
  onCancel, 
  isEditing = false, 
  loading = false 
}) {
  const [formData, setFormData] = useState({
    bookName: '',
    bookType: 'Outros',
    bookPeriod: new Date().getFullYear().toString(),
    reference: '',
    status: 'Aberto',
    notes: '',
    fiscalData: {
      taxAuthority: '',
      fiscalYear: new Date().getFullYear(),
      fiscalPeriod: 'annual',
      taxRegime: 'Simples Nacional',
      submissionDate: null,
      dueDate: null,
    },
    companyId: null,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Initialize form data when editing
  useEffect(() => {
    if (isEditing && fiscalBook) {
      setFormData({
        bookName: fiscalBook.bookName || fiscalBook.name || '',
        bookType: fiscalBook.bookType || 'Outros',
        bookPeriod: fiscalBook.bookPeriod || (fiscalBook.year ? fiscalBook.year.toString() : new Date().getFullYear().toString()),
        reference: fiscalBook.reference || '',
        status: fiscalBook.status || 'Aberto',
        notes: fiscalBook.notes || fiscalBook.description || '',
        fiscalData: fiscalBook.fiscalData || {
          taxAuthority: '',
          fiscalYear: fiscalBook.fiscalData?.fiscalYear || new Date().getFullYear(),
          fiscalPeriod: fiscalBook.fiscalData?.fiscalPeriod || 'annual',
          taxRegime: fiscalBook.fiscalData?.taxRegime || 'Simples Nacional',
          submissionDate: fiscalBook.fiscalData?.submissionDate || null,
          dueDate: fiscalBook.fiscalData?.dueDate || null,
        },
        companyId: fiscalBook.companyId || null,
      });
    }
  }, [isEditing, fiscalBook]);

  // Handle input changes
  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : event.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle nested fiscal data changes
  const handleFiscalDataChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      fiscalData: {
        ...prev.fiscalData,
        [field]: value
      }
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Validate book name
    const nameValidation = validateFiscalBookName(formData.bookName);
    if (!nameValidation.isValid) {
      newErrors.bookName = nameValidation.error;
    }

    // Validate book period
    const periodValidation = validateFiscalBookPeriod(formData.bookPeriod);
    if (!periodValidation.isValid) {
      newErrors.bookPeriod = periodValidation.error;
    }

    // Additional business rules validation
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notas devem ter menos de 500 caracteres';
    }

    if (formData.reference && formData.reference.length > 100) {
      newErrors.reference = 'Referência deve ter menos de 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const submissionData = {
        bookName: formData.bookName.trim(),
        bookType: formData.bookType,
        bookPeriod: formData.bookPeriod.trim(),
        reference: formData.reference.trim(),
        status: formData.status,
        notes: formData.notes.trim(),
        fiscalData: formData.fiscalData,
        companyId: formData.companyId,
      };

      let result;
      if (isEditing && fiscalBook?._id) {
        result = await fiscalBookService.update(fiscalBook._id, submissionData);
      } else {
        result = await fiscalBookService.create(submissionData);
      }

      if (onSave) {
        onSave(result);
      }
    } catch (error) {
      console.error('Error saving fiscal book:', error);
      setSubmitError(error.message || 'Failed to save fiscal book');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Check if fiscal book is editable (for editing mode)
  const isEditable = !isEditing || (fiscalBook && isFiscalBookEditable(fiscalBook));

  // Get button text
  const getButtonText = () => {
    if (submitting) return 'Salvando...';
    return isEditing ? 'Atualizar' : 'Criar';
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {isEditing ? 'Editar Livro Fiscal' : 'Criar Novo Livro Fiscal'}
      </Typography>

      {!isEditable && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Este livro fiscal está fechado ou arquivado e não pode ser editado.
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* Book Name Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nome do Livro Fiscal *"
              value={formData.bookName}
              onChange={handleInputChange('bookName')}
              error={!!errors.bookName}
              helperText={errors.bookName || 'Digite um nome descritivo para este livro fiscal'}
              required
              disabled={!isEditable || loading}
              placeholder="ex: Livro de Entrada 2024"
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          {/* Book Type Field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Tipo do Livro *"
              value={formData.bookType}
              onChange={handleInputChange('bookType')}
              error={!!errors.bookType}
              helperText={errors.bookType || 'Selecione o tipo do livro fiscal'}
              required
              disabled={!isEditable || loading}
              SelectProps={{ native: true }}
            >
              {FISCAL_BOOK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </TextField>
          </Grid>

          {/* Book Period Field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Período *"
              value={formData.bookPeriod}
              onChange={handleInputChange('bookPeriod')}
              error={!!errors.bookPeriod}
              helperText={errors.bookPeriod || 'Período fiscal (YYYY ou YYYY-MM)'}
              required
              disabled={!isEditable || loading}
              placeholder="2024"
              inputProps={{ maxLength: 7 }}
            />
          </Grid>

          {/* Reference Field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Referência"
              value={formData.reference}
              onChange={handleInputChange('reference')}
              error={!!errors.reference}
              helperText={errors.reference || 'Referência fiscal ou interna (opcional)'}
              disabled={!isEditable || loading}
              placeholder="ex: CNPJ, inscrição municipal"
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          {/* Status Field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status}
              onChange={handleInputChange('status')}
              error={!!errors.status}
              helperText="Status atual do livro fiscal"
              disabled={!isEditable || loading}
              SelectProps={{ native: true }}
            >
              {FISCAL_BOOK_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </TextField>
          </Grid>

          {/* Notes Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Observações"
              multiline
              rows={3}
              value={formData.notes}
              onChange={handleInputChange('notes')}
              error={!!errors.notes}
              helperText={errors.notes || 'Observações adicionais sobre este livro fiscal'}
              disabled={!isEditable || loading}
              placeholder="Adicione observações ou notas..."
              inputProps={{ maxLength: 500 }}
            />
          </Grid>

          {/* Fiscal Data Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Dados Fiscais
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Órgão Fiscal"
                  value={formData.fiscalData.taxAuthority}
                  onChange={handleFiscalDataChange('taxAuthority')}
                  disabled={!isEditable || loading}
                  placeholder="ex: Receita Federal, Sefaz"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Regime Tributário"
                  value={formData.fiscalData.taxRegime}
                  onChange={handleFiscalDataChange('taxRegime')}
                  disabled={!isEditable || loading}
                  SelectProps={{ native: true }}
                >
                  {TAX_REGIMES.map((regime) => (
                    <option key={regime} value={regime}>
                      {regime}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Ano Fiscal"
                  value={formData.fiscalData.fiscalYear}
                  onChange={handleFiscalDataChange('fiscalYear')}
                  disabled={!isEditable || loading}
                  inputProps={{ 
                    min: 2000, 
                    max: new Date().getFullYear() + 1 
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Período Fiscal"
                  value={formData.fiscalData.fiscalPeriod}
                  onChange={handleFiscalDataChange('fiscalPeriod')}
                  disabled={!isEditable || loading}
                  SelectProps={{ native: true }}
                  helperText="Selecione o período fiscal"
                >
                  {FISCAL_PERIOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Grid>

          {/* Display additional info when editing */}
          {isEditing && fiscalBook && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Informações do Livro
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Transações: {fiscalBook.transactionCount || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Criado: {fiscalBook.createdAt ? new Date(fiscalBook.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Atualizado: {fiscalBook.updatedAt ? new Date(fiscalBook.updatedAt).toLocaleDateString('pt-BR') : 'N/A'}
                  </Typography>
                </Grid>
                {fiscalBook.closedAt && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="warning.main">
                      Fechado: {new Date(fiscalBook.closedAt).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
          )}
        </Grid>

        {/* Error Display */}
        {submitError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {submitError}
          </Alert>
        )}

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={submitting || loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isEditable || submitting || loading}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {getButtonText()}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

FiscalBookForm.propTypes = {
  fiscalBook: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    bookName: PropTypes.string,
    bookType: PropTypes.string,
    bookPeriod: PropTypes.string,
    reference: PropTypes.string,
    status: PropTypes.string,
    notes: PropTypes.string,
    fiscalData: PropTypes.shape({
      taxAuthority: PropTypes.string,
      fiscalYear: PropTypes.number,
      fiscalPeriod: PropTypes.string,
      taxRegime: PropTypes.string,
      submissionDate: PropTypes.string,
      dueDate: PropTypes.string,
    }),
    companyId: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    closedAt: PropTypes.string,
    transactionCount: PropTypes.number,
    // Legacy field support for compatibility
    name: PropTypes.string,
    description: PropTypes.string,
    year: PropTypes.number,
    isActive: PropTypes.bool,
  }),
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
  isEditing: PropTypes.bool,
  loading: PropTypes.bool,
};

FiscalBookForm.defaultProps = {
  fiscalBook: null,
  onSave: null,
  onCancel: null,
  isEditing: false,
  loading: false,
};

export default FiscalBookForm;
