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
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
} from '@mui/material';
import {
  CompareArrows as CompareIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  CheckCircle as UnchangedIcon,
  ExpandMore as ExpandMoreIcon,
  GetApp as ExportIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import snapshotService from '../../services/snapshotService';

/**
 * SnapshotComparison - Dialog for comparing snapshot with current fiscal book state
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether dialog is open
 * @param {Function} props.onClose - Callback when dialog is closed
 * @param {Object} props.snapshot - Snapshot to compare
 */
function SnapshotComparison({ open, onClose, snapshot }) {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState('added');

  // Load comparison data
  useEffect(() => {
    if (open && snapshot) {
      loadComparison();
    }
  }, [open, snapshot]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      setError('');
      const snapshotId = snapshot.id || snapshot._id;
      const result = await snapshotService.compareSnapshot(snapshotId);
      setComparison(result.data || result);
    } catch (err) {
      console.error('Error loading comparison:', err);
      setError(err.message || 'Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    const numValue = parseFloat(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Handle accordion change
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Handle export comparison
  const handleExportComparison = () => {
    if (!comparison) return;

    const exportData = {
      snapshotName: comparison.snapshotName,
      snapshotDate: comparison.snapshotDate,
      comparedAt: new Date().toISOString(),
      summary: comparison.summary,
      counts: comparison.counts,
      added: comparison.added,
      removed: comparison.removed,
      modified: comparison.modified,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison-${comparison.snapshotName}-${formatDate(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Render summary card
  const renderSummary = () => {
    if (!comparison) return null;

    const { summary, counts } = comparison;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Resumo das Diferenças
          </Typography>

          {/* Counts */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="h4" color="success.dark">
                  {counts.added}
                </Typography>
                <Typography variant="caption" color="success.dark">
                  + Adicionadas
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                <Typography variant="h4" color="error.dark">
                  {counts.removed}
                </Typography>
                <Typography variant="caption" color="error.dark">
                  - Removidas
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                <Typography variant="h4" color="warning.dark">
                  {counts.modified}
                </Typography>
                <Typography variant="caption" color="warning.dark">
                  ∿ Modificadas
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.200', borderRadius: 1 }}>
                <Typography variant="h4" color="text.secondary">
                  {counts.unchanged}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  = Inalteradas
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Financial differences */}
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                SNAPSHOT
              </Typography>
              <Typography variant="body2">
                Total: {formatCurrency(summary.snapshotStats.netAmount)}
              </Typography>
              <Typography variant="body2">
                Transações: {summary.snapshotStats.transactionCount}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                ATUAL
              </Typography>
              <Typography variant="body2">
                Total: {formatCurrency(summary.currentStats.netAmount)}
              </Typography>
              <Typography variant="body2">
                Transações: {summary.currentStats.transactionCount}
              </Typography>
            </Grid>
          </Grid>

          {/* Difference highlight */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Diferença: {' '}
              <strong style={{ color: summary.differences.netAmountDiff >= 0 ? 'green' : 'red' }}>
                {summary.differences.netAmountDiff >= 0 ? '+' : ''}
                {formatCurrency(summary.differences.netAmountDiff)}
              </strong>
              {' '} ({summary.differences.transactionCountDiff >= 0 ? '+' : ''}
              {summary.differences.transactionCountDiff} transações)
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render transaction item
  const renderTransactionItem = (item, type) => {
    const transaction = item.transaction || item.current;
    
    return (
      <ListItem key={item.id} divider>
        <ListItemIcon>
          {type === 'added' && <AddIcon color="success" />}
          {type === 'removed' && <RemoveIcon color="error" />}
          {type === 'modified' && <EditIcon color="warning" />}
        </ListItemIcon>
        <ListItemText
          primary={transaction?.transactionName || 'Transação sem nome'}
          secondary={
            <>
              {formatCurrency(transaction?.transactionValue)} • {formatDate(transaction?.transactionDate)}
              {type === 'modified' && item.changes && (
                <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                  {item.changes.map((change, idx) => (
                    <Chip
                      key={idx}
                      label={`${change.field}: ${change.oldValue || '(vazio)'} → ${change.newValue || '(vazio)'}`}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              )}
            </>
          }
        />
      </ListItem>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CompareIcon color="primary" />
            Comparação: "{snapshot?.snapshotName}" vs Atual
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Loading state */}
        {loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Carregando comparação...
            </Typography>
          </Box>
        )}

        {/* Error state */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Comparison content */}
        {!loading && comparison && (
          <>
            {renderSummary()}

            {/* Added transactions */}
            <Accordion
              expanded={expanded === 'added'}
              onChange={handleAccordionChange('added')}
              disabled={comparison.counts.added === 0}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddIcon color="success" />
                  <Typography>
                    Transações Adicionadas ({comparison.counts.added})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {comparison.added.map(item => renderTransactionItem(item, 'added'))}
                </List>
              </AccordionDetails>
            </Accordion>

            {/* Removed transactions */}
            <Accordion
              expanded={expanded === 'removed'}
              onChange={handleAccordionChange('removed')}
              disabled={comparison.counts.removed === 0}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RemoveIcon color="error" />
                  <Typography>
                    Transações Removidas ({comparison.counts.removed})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {comparison.removed.map(item => renderTransactionItem(item, 'removed'))}
                </List>
              </AccordionDetails>
            </Accordion>

            {/* Modified transactions */}
            <Accordion
              expanded={expanded === 'modified'}
              onChange={handleAccordionChange('modified')}
              disabled={comparison.counts.modified === 0}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EditIcon color="warning" />
                  <Typography>
                    Transações Modificadas ({comparison.counts.modified})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {comparison.modified.map(item => renderTransactionItem(item, 'modified'))}
                </List>
              </AccordionDetails>
            </Accordion>

            {/* No changes message */}
            {comparison.counts.added === 0 && 
             comparison.counts.removed === 0 && 
             comparison.counts.modified === 0 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Nenhuma diferença encontrada! O snapshot está idêntico ao estado atual do livro fiscal.
                </Typography>
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          startIcon={<ExportIcon />}
          onClick={handleExportComparison}
          disabled={!comparison || loading}
        >
          Exportar Relatório
        </Button>
        <Button onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

SnapshotComparison.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  snapshot: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    snapshotName: PropTypes.string,
    createdAt: PropTypes.string,
  }),
};

SnapshotComparison.defaultProps = {
  snapshot: null,
};

export default SnapshotComparison;
