import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Comment as CommentIcon,
  Person as PersonIcon,
  Add as AddIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import snapshotService from '../../services/snapshotService';

/**
 * SnapshotAnnotations - Component for viewing and adding annotations to snapshots
 */
function SnapshotAnnotations({ snapshot, onAnnotationAdded }) {
  const [newAnnotation, setNewAnnotation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const annotations = snapshot?.annotations || [];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddAnnotation = async () => {
    if (!newAnnotation.trim() || !snapshot) return;

    try {
      setSaving(true);
      setError('');

      const snapshotId = snapshot.id || snapshot._id;
      await snapshotService.addSnapshotAnnotation(snapshotId, newAnnotation.trim());

      setNewAnnotation('');

      if (onAnnotationAdded) {
        onAnnotationAdded();
      }
    } catch (err) {
      console.error('Error adding annotation:', err);
      setError(err.message || 'Failed to add annotation');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAddAnnotation();
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <CommentIcon color="primary" />
        <Typography variant="h6">
          Anotações
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ({annotations.length})
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Add new annotation */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Adicionar uma anotação..."
          value={newAnnotation}
          onChange={(e) => setNewAnnotation(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={saving}
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Ctrl+Enter para salvar
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={handleAddAnnotation}
            disabled={!newAnnotation.trim() || saving}
            startIcon={saving ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {saving ? 'Salvando...' : 'Adicionar'}
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Annotations list */}
      {annotations.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CommentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Nenhuma anotação ainda.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Adicione anotações para documentar observações importantes.
          </Typography>
        </Box>
      ) : (
        <List disablePadding>
          {annotations.map((annotation, index) => (
            <ListItem
              key={index}
              alignItems="flex-start"
              sx={{
                px: 0,
                borderBottom: index < annotations.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {annotation.createdBy || 'Usuário'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(annotation.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                }
                secondary={
                  <Typography
                    variant="body2"
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      color: 'text.primary',
                    }}
                  >
                    {annotation.content}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

SnapshotAnnotations.propTypes = {
  snapshot: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    annotations: PropTypes.arrayOf(
      PropTypes.shape({
        content: PropTypes.string,
        createdBy: PropTypes.string,
        createdAt: PropTypes.string,
      })
    ),
  }),
  onAnnotationAdded: PropTypes.func,
};

SnapshotAnnotations.defaultProps = {
  snapshot: null,
  onAnnotationAdded: null,
};

export default SnapshotAnnotations;
