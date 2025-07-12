import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Autocomplete,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import snapshotService from '../../services/snapshotService';

/**
 * SnapshotScheduleForm - Form for configuring automatic snapshot scheduling
 */
function SnapshotScheduleForm({ fiscalBookId, onSave }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState('monthly');
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [retentionCount, setRetentionCount] = useState(12);
  const [autoTags, setAutoTags] = useState(['auto']);

  const weekDays = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' },
  ];

  const tagSuggestions = ['auto', 'scheduled', 'backup', 'monthly', 'weekly'];

  // Load existing schedule
  useEffect(() => {
    if (fiscalBookId) {
      loadSchedule();
    }
  }, [fiscalBookId]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await snapshotService.getSchedule(fiscalBookId);
      const schedule = result.data;

      if (schedule) {
        setEnabled(schedule.enabled || false);
        setFrequency(schedule.frequency || 'monthly');
        setDayOfWeek(schedule.dayOfWeek || 0);
        setDayOfMonth(schedule.dayOfMonth || 1);
        setRetentionCount(schedule.retentionCount || 12);
        setAutoTags(schedule.autoTags || ['auto']);
      }
    } catch (err) {
      console.error('Error loading schedule:', err);
      // It's OK if there's no schedule yet
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await snapshotService.updateSchedule(fiscalBookId, {
        enabled,
        frequency,
        dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
        dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
        retentionCount,
        autoTags,
      });

      setSuccess('Configuração salva com sucesso!');

      if (onSave) {
        onSave();
      }
    } catch (err) {
      console.error('Error saving schedule:', err);
      setError(err.message || 'Failed to save schedule configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Carregando configuração...
        </Typography>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <ScheduleIcon color="primary" />
          <Typography variant="h6">
            Snapshots Automáticos
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Enable/Disable toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              disabled={saving}
            />
          }
          label={
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Habilitar snapshots automáticos
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Crie snapshots automaticamente em intervalos regulares
              </Typography>
            </Box>
          }
          sx={{ mb: 3, alignItems: 'flex-start' }}
        />

        {enabled && (
          <>
            <Divider sx={{ my: 2 }} />

            {/* Frequency selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Frequência</InputLabel>
              <Select
                value={frequency}
                label="Frequência"
                onChange={(e) => setFrequency(e.target.value)}
                disabled={saving}
              >
                <MenuItem value="weekly">Semanal</MenuItem>
                <MenuItem value="monthly">Mensal</MenuItem>
                <MenuItem value="before-status-change">Antes de mudança de status</MenuItem>
              </Select>
            </FormControl>

            {/* Day of week (for weekly) */}
            {frequency === 'weekly' && (
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Dia da Semana</InputLabel>
                <Select
                  value={dayOfWeek}
                  label="Dia da Semana"
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  disabled={saving}
                >
                  {weekDays.map((day) => (
                    <MenuItem key={day.value} value={day.value}>
                      {day.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Day of month (for monthly) */}
            {frequency === 'monthly' && (
              <TextField
                fullWidth
                type="number"
                label="Dia do Mês"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))}
                inputProps={{ min: 1, max: 31 }}
                disabled={saving}
                helperText="Dia 1-31. Se o mês não tiver esse dia, será no último dia do mês."
                sx={{ mb: 3 }}
              />
            )}

            {frequency === 'before-status-change' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Um snapshot será criado automaticamente antes de cada mudança de status do livro fiscal
                (ex: de "Aberto" para "Fechado").
              </Alert>
            )}

            {/* Retention policy */}
            <TextField
              fullWidth
              type="number"
              label="Quantidade máxima de snapshots automáticos"
              value={retentionCount}
              onChange={(e) => setRetentionCount(Math.max(1, parseInt(e.target.value) || 12))}
              inputProps={{ min: 1, max: 100 }}
              disabled={saving}
              helperText="Snapshots mais antigos serão excluídos automaticamente"
              sx={{ mb: 3 }}
            />

            {/* Auto tags */}
            <Autocomplete
              multiple
              freeSolo
              options={tagSuggestions}
              value={autoTags}
              onChange={(event, newValue) => {
                setAutoTags(newValue.map((tag) => tag.toLowerCase().trim()));
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
                  label="Tags automáticas"
                  placeholder="Adicionar tag..."
                  helperText="Tags aplicadas automaticamente aos snapshots criados"
                />
              )}
              disabled={saving}
              sx={{ mb: 3 }}
            />
          </>
        )}

        {/* Save button */}
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {saving ? 'Salvando...' : 'Salvar Configuração'}
        </Button>
      </CardContent>
    </Card>
  );
}

SnapshotScheduleForm.propTypes = {
  fiscalBookId: PropTypes.string.isRequired,
  onSave: PropTypes.func,
};

SnapshotScheduleForm.defaultProps = {
  onSave: null,
};

export default SnapshotScheduleForm;
