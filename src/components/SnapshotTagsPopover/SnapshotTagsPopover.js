import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Popover,
  Box,
  Typography,
  Chip,
  Autocomplete,
  TextField,
  Button,
  IconButton,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  LocalOffer as TagIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import snapshotService from '../../services/snapshotService';

/**
 * SnapshotTagsPopover - Popover for managing snapshot tags and protection
 */
function SnapshotTagsPopover({
  anchorEl,
  onClose,
  snapshot,
  onUpdate,
}) {
  const [tags, setTags] = useState(snapshot?.tags || []);
  const [isProtected, setIsProtected] = useState(snapshot?.isProtected || false);
  const [saving, setSaving] = useState(false);

  const open = Boolean(anchorEl);

  const tagSuggestions = [
    'audit-ready',
    'pre-tax-submission',
    'monthly-close',
    'quarterly-close',
    'annual-close',
    'backup',
    'review',
    'protected',
    'important',
  ];

  const handleSaveTags = async () => {
    if (!snapshot) return;

    try {
      setSaving(true);
      const snapshotId = snapshot.id || snapshot._id;
      await snapshotService.updateTags(snapshotId, tags);

      if (onUpdate) {
        onUpdate({ ...snapshot, tags });
      }
    } catch (err) {
      console.error('Error updating tags:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleProtection = async () => {
    if (!snapshot) return;

    try {
      setSaving(true);
      const snapshotId = snapshot.id || snapshot._id;
      const newProtectedState = !isProtected;
      await snapshotService.toggleProtection(snapshotId, newProtectedState);
      setIsProtected(newProtectedState);

      if (onUpdate) {
        onUpdate({ ...snapshot, isProtected: newProtectedState });
      }
    } catch (err) {
      console.error('Error toggling protection:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = tags.filter((t) => t !== tagToRemove);
    setTags(newTags);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <Box sx={{ p: 2, minWidth: 300, maxWidth: 400 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TagIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Gerenciar Tags
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Current tags */}
        {tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                onDelete={() => handleRemoveTag(tag)}
                disabled={saving}
              />
            ))}
          </Box>
        )}

        {/* Add tags */}
        <Autocomplete
          multiple
          freeSolo
          options={tagSuggestions.filter((t) => !tags.includes(t))}
          value={tags}
          onChange={(event, newValue) => {
            setTags(newValue.map((t) => t.toLowerCase().trim()));
          }}
          renderTags={() => null} // We render tags above
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Adicionar tags"
              placeholder="Digite e pressione Enter..."
            />
          )}
          disabled={saving}
          sx={{ mb: 2 }}
        />

        <Button
          fullWidth
          variant="outlined"
          onClick={handleSaveTags}
          disabled={saving}
          sx={{ mb: 2 }}
        >
          Salvar Tags
        </Button>

        <Divider sx={{ my: 2 }} />

        {/* Protection toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={isProtected}
              onChange={handleToggleProtection}
              disabled={saving}
              color="warning"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isProtected ? <LockIcon color="warning" fontSize="small" /> : <UnlockIcon fontSize="small" />}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {isProtected ? 'Protegido' : 'Não protegido'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isProtected
                    ? 'Este snapshot não pode ser excluído'
                    : 'Este snapshot pode ser excluído'}
                </Typography>
              </Box>
            </Box>
          }
          sx={{ m: 0 }}
        />
      </Box>
    </Popover>
  );
}

SnapshotTagsPopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func.isRequired,
  snapshot: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    isProtected: PropTypes.bool,
  }),
  onUpdate: PropTypes.func,
};

SnapshotTagsPopover.defaultProps = {
  anchorEl: null,
  snapshot: null,
  onUpdate: null,
};

export default SnapshotTagsPopover;
