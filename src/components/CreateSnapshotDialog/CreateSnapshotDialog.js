import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Autocomplete,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
} from '@mui/icons-material';
import snapshotService from '../../services/snapshotService';

/**
 * CreateSnapshotDialog - Dialog for creating a new snapshot
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether dialog is open
 * @param {Function} props.onClose - Callback when dialog is closed
 * @param {string} props.fiscalBookId - Fiscal book ID to snapshot
 * @param {string} props.fiscalBookName - Fiscal book name for display
 * @param {Function} props.onSuccess - Callback when snapshot is created successfully
 */
function CreateSnapshotDialog({ open, onClose, fiscalBookId, fiscalBookName, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Predefined tag suggestions
  const tagSuggestions = [
    'audit-ready',
    'pre-tax-submission',
    'monthly-close',
    'quarterly-close',
    'annual-close',
    'backup',
    'review',
  ];

  // Reset form when dialog opens
  const handleEnter = () => {
    setName('');
    setDescription('');
    setTags([]);
    setError('');
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const snapshotData = {
        name: name.trim() || undefined,
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      };

      const result = await snapshotService.createSnapshot(fiscalBookId, snapshotData);

      if (onSuccess) {
        onSuccess(result.data || result);
      }

      onClose();
    } catch (err) {
      console.error('Error creating snapshot:', err);
      setError(err.message || 'Failed to create snapshot');
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{ onEnter: handleEnter }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CameraIcon color="primary" />
          Criar Snapshot
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Fiscal book name info */}
          <Alert severity="info" sx={{ mb: 3 }}>
            Criando snapshot do livro fiscal: <strong>{fiscalBookName || 'Livro Fiscal'}</strong>
          </Alert>

          {/* Error display */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Snapshot name */}
          <TextField
            label="Nome do Snapshot (opcional)"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Snapshot ${new Date().toISOString().split('T')[0]}`}
            disabled={loading}
            sx={{ mb: 2 }}
            helperText="Se não informado, será gerado automaticamente com a data atual"
          />

          {/* Description */}
          <TextField
            label="Descrição (opcional)"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o motivo ou contexto deste snapshot..."
            disabled={loading}
            sx={{ mb: 2 }}
          />

          {/* Tags */}
          <Autocomplete
            multiple
            freeSolo
            options={tagSuggestions}
            value={tags}
            onChange={(event, newValue) => {
              // Normalize tags to lowercase
              const normalizedTags = newValue.map(tag => tag.toLowerCase().trim());
              setTags(normalizedTags);
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...otherProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    label={option}
                    size="small"
                    {...otherProps}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags (opcional)"
                placeholder="Adicionar tag..."
                helperText="Digite e pressione Enter para adicionar tags personalizadas"
              />
            )}
            disabled={loading}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <CameraIcon />}
        >
          {loading ? 'Criando...' : 'Criar Snapshot'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CreateSnapshotDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fiscalBookId: PropTypes.string.isRequired,
  fiscalBookName: PropTypes.string,
  onSuccess: PropTypes.func,
};

CreateSnapshotDialog.defaultProps = {
  fiscalBookName: '',
  onSuccess: null,
};

export default CreateSnapshotDialog;
