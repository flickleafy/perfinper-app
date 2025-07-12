import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CompareArrows as CompareIcon,
  GetApp as ExportIcon,
  ContentCopy as CloneIcon,
  MoreVert as MoreIcon,
  LocalOffer as TagIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Refresh as RefreshIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import snapshotService from '../../services/snapshotService';
import CreateSnapshotDialog from '../CreateSnapshotDialog/CreateSnapshotDialog';
import SnapshotComparison from '../SnapshotComparison/SnapshotComparison';
import RollbackConfirmDialog from '../RollbackConfirmDialog/RollbackConfirmDialog';
import SnapshotExportDialog from '../SnapshotExportDialog/SnapshotExportDialog';
import SnapshotTagsPopover from '../SnapshotTagsPopover/SnapshotTagsPopover';

/**
 * SnapshotsList - Displays list of snapshots for a fiscal book
 * @param {Object} props - Component props
 * @param {string} props.fiscalBookId - Fiscal book ID
 * @param {string} props.fiscalBookName - Fiscal book name for display
 * @param {Function} props.onSnapshotCreated - Callback when snapshot is created
 */
function SnapshotsList({ fiscalBookId, fiscalBookName, onSnapshotCreated }) {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [selectedSnapshotForComparison, setSelectedSnapshotForComparison] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [tagFilter, setTagFilter] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [tagsPopoverAnchor, setTagsPopoverAnchor] = useState(null);

  // Predefined system tags
  const systemTags = ['audit-ready', 'pre-tax-submission', 'monthly-close', 'protected', 'auto'];

  // Load snapshots
  const loadSnapshots = useCallback(async () => {
    if (!fiscalBookId) return;

    try {
      setLoading(true);
      setError('');
      const result = await snapshotService.getSnapshots(fiscalBookId, {
        tags: tagFilter.length > 0 ? tagFilter : undefined,
        limit: 50,
      });

      const snapshotData = result.data || [];
      setSnapshots(snapshotData);

      // Extract available tags from snapshots
      const allTags = new Set(systemTags);
      snapshotData.forEach(snapshot => {
        if (snapshot.tags) {
          snapshot.tags.forEach(tag => allTags.add(tag));
        }
      });
      setAvailableTags(Array.from(allTags));
    } catch (err) {
      console.error('Error loading snapshots:', err);
      setError('Failed to load snapshots');
    } finally {
      setLoading(false);
    }
  }, [fiscalBookId, tagFilter]);

  useEffect(() => {
    loadSnapshots();
  }, [loadSnapshots]);

  // Handle menu open
  const handleMenuOpen = (event, snapshot) => {
    setMenuAnchor(event.currentTarget);
    setSelectedSnapshot(snapshot);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedSnapshot(null);
  };

  // Handle snapshot creation success
  const handleSnapshotCreated = async (snapshot) => {
    setCreateDialogOpen(false);
    await loadSnapshots();
    if (onSnapshotCreated) {
      onSnapshotCreated(snapshot);
    }
  };

  // Handle delete snapshot
  const handleDelete = async () => {
    if (!selectedSnapshot) return;

    try {
      await snapshotService.deleteSnapshot(selectedSnapshot.id || selectedSnapshot._id);
      handleMenuClose();
      await loadSnapshots();
    } catch (err) {
      console.error('Error deleting snapshot:', err);
      setError(err.message || 'Failed to delete snapshot');
    }
  };

  // Handle compare
  const handleCompare = () => {
    setSelectedSnapshotForComparison(selectedSnapshot);
    setComparisonOpen(true);
    handleMenuClose();
  };

  // Handle export
  const handleExport = async (format = 'json') => {
    if (!selectedSnapshot) return;

    try {
      const snapshotId = selectedSnapshot.id || selectedSnapshot._id;
      await snapshotService.downloadExport(snapshotId, format, `snapshot-${selectedSnapshot.snapshotName}.${format}`);
      handleMenuClose();
    } catch (err) {
      console.error('Error exporting snapshot:', err);
      setError('Failed to export snapshot');
    }
  };

  // Handle toggle protection
  const handleToggleProtection = async () => {
    if (!selectedSnapshot) return;

    try {
      const snapshotId = selectedSnapshot.id || selectedSnapshot._id;
      await snapshotService.toggleProtection(snapshotId, !selectedSnapshot.isProtected);
      handleMenuClose();
      await loadSnapshots();
    } catch (err) {
      console.error('Error toggling protection:', err);
      setError('Failed to toggle protection');
    }
  };

  // Handle clone
  const handleClone = async () => {
    if (!selectedSnapshot) return;

    try {
      const snapshotId = selectedSnapshot.id || selectedSnapshot._id;
      await snapshotService.cloneToNewFiscalBook(snapshotId);
      handleMenuClose();
      // Optionally redirect to new fiscal book or show success message
    } catch (err) {
      console.error('Error cloning snapshot:', err);
      setError('Failed to clone snapshot to new fiscal book');
    }
  };

  // Handle rollback
  const handleOpenRollback = () => {
    setRollbackDialogOpen(true);
    handleMenuClose();
  };

  const handleRollbackSuccess = () => {
    loadSnapshots();
    if (onSnapshotCreated) {
      onSnapshotCreated(); // Refresh parent
    }
  };

  // Handle export dialog
  const handleOpenExportDialog = () => {
    setExportDialogOpen(true);
    handleMenuClose();
  };

  // Handle tags popover
  const handleOpenTagsPopover = (event) => {
    setTagsPopoverAnchor(event.currentTarget);
    handleMenuClose();
  };

  const handleTagsUpdate = (updatedSnapshot) => {
    setSnapshots(prev =>
      prev.map(s =>
        (s.id || s._id) === (updatedSnapshot.id || updatedSnapshot._id) ? updatedSnapshot : s
      )
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render empty state
  const renderEmptyState = () => (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <CameraIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Nenhum Snapshot
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Crie um snapshot para preservar o estado atual do livro fiscal.
      </Typography>
      <Button
        variant="contained"
        startIcon={<CameraIcon />}
        onClick={() => setCreateDialogOpen(true)}
      >
        Criar Primeiro Snapshot
      </Button>
    </Box>
  );

  // Render snapshot card
  const renderSnapshotCard = (snapshot) => {
    const snapshotId = snapshot.id || snapshot._id;

    return (
      <Card key={snapshotId} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {snapshot.snapshotName}
                </Typography>
                {snapshot.isProtected && (
                  <Tooltip title="Snapshot protegido">
                    <LockIcon color="warning" fontSize="small" />
                  </Tooltip>
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                📅 {formatDate(snapshot.createdAt)} • 📊 {snapshot.statistics?.transactionCount || 0} transações
              </Typography>

              {snapshot.snapshotDescription && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {snapshot.snapshotDescription}
                </Typography>
              )}

              {/* Tags */}
              {snapshot.tags && snapshot.tags.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                  {snapshot.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                      icon={<TagIcon fontSize="small" />}
                    />
                  ))}
                </Box>
              )}

              {/* Quick actions */}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  size="small"
                  startIcon={<CompareIcon />}
                  onClick={() => {
                    setSelectedSnapshotForComparison(snapshot);
                    setComparisonOpen(true);
                  }}
                >
                  Comparar
                </Button>
                <Button
                  size="small"
                  startIcon={<ExportIcon />}
                  onClick={() => snapshotService.downloadExport(snapshotId, 'json', `${snapshot.snapshotName}.json`)}
                >
                  Exportar
                </Button>
              </Box>
            </Box>

            <IconButton onClick={(e) => handleMenuOpen(e, snapshot)}>
              <MoreIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CameraIcon color="primary" />
          <Typography variant="h6">
            Snapshots
          </Typography>
          <IconButton size="small" onClick={loadSnapshots} disabled={loading}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
        <Button
          variant="contained"
          startIcon={<CameraIcon />}
          onClick={() => setCreateDialogOpen(true)}
          disabled={loading}
        >
          Criar Snapshot
        </Button>
      </Box>

      {/* Tag Filter */}
      {availableTags.length > 0 && (
        <FormControl size="small" sx={{ mb: 2, minWidth: 200 }}>
          <InputLabel>Filtrar por Tags</InputLabel>
          <Select
            multiple
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            input={<OutlinedInput label="Filtrar por Tags" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {availableTags.map((tag) => (
              <MenuItem key={tag} value={tag}>
                {tag}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Carregando snapshots...
          </Typography>
        </Box>
      )}

      {/* Snapshots list */}
      {!loading && snapshots.length === 0 && renderEmptyState()}
      {!loading && snapshots.length > 0 && snapshots.map(renderSnapshotCard)}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleCompare}>
          <ListItemIcon>
            <CompareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Comparar com Atual</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('json')}>
          <ListItemIcon>
            <ExportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar JSON</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>
          <ListItemIcon>
            <ExportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClone}>
          <ListItemIcon>
            <CloneIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Clonar para Novo Livro</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleToggleProtection}>
          <ListItemIcon>
            {selectedSnapshot?.isProtected ? <UnlockIcon fontSize="small" /> : <LockIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {selectedSnapshot?.isProtected ? 'Remover Proteção' : 'Proteger'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} disabled={selectedSnapshot?.isProtected}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color={selectedSnapshot?.isProtected ? 'disabled' : 'error'} />
          </ListItemIcon>
          <ListItemText sx={{ color: selectedSnapshot?.isProtected ? 'text.disabled' : 'error.main' }}>
            Excluir
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleOpenRollback}>
          <ListItemIcon>
            <RestoreIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>Rollback para este Snapshot</ListItemText>
        </MenuItem>
        <MenuItem onClick={(e) => handleOpenTagsPopover(e)}>
          <ListItemIcon>
            <TagIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Gerenciar Tags</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOpenExportDialog}>
          <ListItemIcon>
            <ExportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar...</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create Snapshot Dialog */}
      <CreateSnapshotDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        fiscalBookId={fiscalBookId}
        fiscalBookName={fiscalBookName}
        onSuccess={handleSnapshotCreated}
      />

      {/* Snapshot Comparison Dialog */}
      <SnapshotComparison
        open={comparisonOpen}
        onClose={() => {
          setComparisonOpen(false);
          setSelectedSnapshotForComparison(null);
        }}
        snapshot={selectedSnapshotForComparison}
      />

      {/* Rollback Confirm Dialog */}
      <RollbackConfirmDialog
        open={rollbackDialogOpen}
        onClose={() => setRollbackDialogOpen(false)}
        snapshot={selectedSnapshot}
        fiscalBookName={fiscalBookName}
        onSuccess={handleRollbackSuccess}
      />

      {/* Export Dialog */}
      <SnapshotExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        snapshot={selectedSnapshot}
      />

      {/* Tags Popover */}
      <SnapshotTagsPopover
        anchorEl={tagsPopoverAnchor}
        onClose={() => setTagsPopoverAnchor(null)}
        snapshot={selectedSnapshot}
        onUpdate={handleTagsUpdate}
      />
    </Box>
  );
}

SnapshotsList.propTypes = {
  fiscalBookId: PropTypes.string.isRequired,
  fiscalBookName: PropTypes.string,
  onSnapshotCreated: PropTypes.func,
};

SnapshotsList.defaultProps = {
  fiscalBookName: '',
  onSnapshotCreated: null,
};

export default SnapshotsList;
