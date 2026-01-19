import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  RadioGroup,
  Radio,
  FormControlLabel,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  GetApp as DownloadIcon,
  Code as JsonIcon,
  TableChart as CsvIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import snapshotService from '../../services/snapshotService';

/**
 * SnapshotExportDialog - Dialog for selecting export format and downloading snapshot
 */
function SnapshotExportDialog({ open, onClose, snapshot }) {
  const [format, setFormat] = useState('json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatOptions = [
    {
      value: 'json',
      label: 'JSON',
      icon: <JsonIcon />,
      description: 'Formato completo com todos os metadados. Ideal para backup e importação.',
    },
    {
      value: 'csv',
      label: 'CSV',
      icon: <CsvIcon />,
      description: 'Formato tabular compatível com Excel. Contém dados das transações.',
    },
    {
      value: 'pdf',
      label: 'PDF',
      icon: <PdfIcon />,
      description: 'Relatório formatado para impressão. (Em desenvolvimento)',
      disabled: true,
    },
  ];

  const handleEnter = () => {
    setFormat('json');
    setError('');
  };

  const handleExport = async () => {
    if (!snapshot) return;

    try {
      setLoading(true);
      setError('');

      const snapshotId = snapshot.id || snapshot._id;
      const fileName = `snapshot-${snapshot.snapshotName || 'export'}-${new Date().toISOString().split('T')[0]}.${format}`;

      await snapshotService.downloadExport(snapshotId, format, fileName);

      onClose();
    } catch (err) {
      console.error('Error exporting snapshot:', err);
      setError(err.message || 'Failed to export snapshot');
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DownloadIcon color="primary" />
          Exportar Snapshot
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Snapshot info */}
        <Alert severity="info" sx={{ mb: 3 }}>
          Exportando: <strong>{snapshot?.snapshotName || 'Snapshot'}</strong>
          {snapshot?.statistics?.transactionCount && (
            <> • {snapshot.statistics.transactionCount} transações</>
          )}
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Format selection */}
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Selecione o formato de exportação:
        </Typography>

        <RadioGroup
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          {formatOptions.map((option) => (
            <Box
              key={option.value}
              sx={{
                border: 1,
                borderColor: format === option.value ? 'primary.main' : 'divider',
                borderRadius: 1,
                mb: 1,
                p: 2,
                cursor: option.disabled ? 'not-allowed' : 'pointer',
                opacity: option.disabled ? 0.5 : 1,
                bgcolor: format === option.value ? 'primary.light' : 'transparent',
                '&:hover': {
                  bgcolor: option.disabled ? 'transparent' : 'action.hover',
                },
              }}
              onClick={() => !option.disabled && setFormat(option.value)}
            >
              <FormControlLabel
                value={option.value}
                control={<Radio disabled={option.disabled || loading} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {option.icon}
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {option.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                  </Box>
                }
                disabled={option.disabled || loading}
                sx={{ width: '100%', m: 0 }}
              />
            </Box>
          ))}
        </RadioGroup>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
        >
          {loading ? 'Exportando...' : 'Exportar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

SnapshotExportDialog.propTypes = {
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
};

SnapshotExportDialog.defaultProps = {
  snapshot: null,
};

export default SnapshotExportDialog;
