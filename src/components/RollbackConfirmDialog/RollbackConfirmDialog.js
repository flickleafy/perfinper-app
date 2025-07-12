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
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import snapshotService from '../../services/snapshotService';

/**
 * RollbackConfirmDialog - Critical confirmation dialog for rollback operation
 * Requires user to type fiscal book name to confirm the destructive action
 */
function RollbackConfirmDialog({
  open,
  onClose,
  snapshot,
  fiscalBookName,
  onSuccess,
}) {
  const [confirmText, setConfirmText] = useState('');
  const [createBackup, setCreateBackup] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isConfirmed = confirmText.toLowerCase() === fiscalBookName?.toLowerCase();

  const handleEnter = () => {
    setConfirmText('');
    setCreateBackup(true);
    setError('');
  };

  const handleRollback = async () => {
    if (!isConfirmed || !snapshot) return;

    try {
      setLoading(true);
      setError('');

      const snapshotId = snapshot.id || snapshot._id;
      const result = await snapshotService.rollbackToSnapshot(snapshotId, {
        createPreRollbackSnapshot: createBackup,
      });

      if (onSuccess) {
        onSuccess(result.data || result);
      }

      onClose();
    } catch (err) {
      console.error('Error performing rollback:', err);
      setError(err.message || 'Failed to rollback to snapshot');
    } finally {
      setLoading(false);
    }
  };

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <WarningIcon />
          Confirmar Rollback
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            ⚠️ Ação Destrutiva
          </Typography>
          <Typography variant="body2">
            O rollback irá <strong>substituir permanentemente</strong> todos os dados atuais
            do livro fiscal pelo conteúdo do snapshot "<strong>{snapshot?.snapshotName}</strong>".
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Esta ação <strong>não pode ser desfeita</strong>, a menos que você crie um backup antes.
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Backup option */}
        <FormControlLabel
          control={
            <Checkbox
              checked={createBackup}
              onChange={(e) => setCreateBackup(e.target.checked)}
              disabled={loading}
            />
          }
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Criar snapshot de backup antes do rollback
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Recomendado: permite reverter caso necessário
              </Typography>
            </Box>
          }
          sx={{ mb: 3, alignItems: 'flex-start' }}
        />

        {/* Confirmation input */}
        <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Para confirmar, digite o nome do livro fiscal:
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 'bold',
              mb: 2,
              p: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
            }}
          >
            {fiscalBookName}
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Digite o nome do livro fiscal"
            disabled={loading}
            error={confirmText.length > 0 && !isConfirmed}
            helperText={
              confirmText.length > 0 && !isConfirmed
                ? 'O nome não corresponde'
                : ''
            }
          />
        </Box>

        {/* What will happen */}
        <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            O que acontecerá:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ m: 0, pl: 2 }}>
            <li>Todas as transações atuais serão excluídas</li>
            <li>{snapshot?.statistics?.transactionCount || 0} transações do snapshot serão restauradas</li>
            <li>Os metadados do livro fiscal serão restaurados ao estado do snapshot</li>
            {createBackup && <li>Um snapshot de backup será criado automaticamente</li>}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleRollback}
          disabled={!isConfirmed || loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RestoreIcon />}
        >
          {loading ? 'Executando Rollback...' : 'Executar Rollback'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

RollbackConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  snapshot: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    snapshotName: PropTypes.string,
    statistics: PropTypes.shape({
      transactionCount: PropTypes.number,
    }),
  }),
  fiscalBookName: PropTypes.string,
  onSuccess: PropTypes.func,
};

RollbackConfirmDialog.defaultProps = {
  snapshot: null,
  fiscalBookName: '',
  onSuccess: null,
};

export default RollbackConfirmDialog;
