import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SnapshotScheduleForm from './SnapshotScheduleForm';
import snapshotService from '../../services/snapshotService';

jest.mock('../../services/snapshotService', () => ({
  __esModule: true,
  default: {
    getSchedule: jest.fn(),
    updateSchedule: jest.fn(),
  },
}));

describe('SnapshotScheduleForm', () => {
  const mockSchedule = {
    enabled: true,
    frequency: 'monthly',
    dayOfMonth: 15,
    retentionCount: 24,
    autoTags: ['auto', 'monthly-backup'],
    nextExecutionAt: '2024-02-15T12:00:00.000Z',
  };

  const defaultProps = {
    fiscalBookId: 'fb1',
    onSave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    snapshotService.getSchedule.mockResolvedValue({ data: mockSchedule });
    snapshotService.updateSchedule.mockResolvedValue({ data: { success: true } });
  });

  // ===== Loading & Initial State =====
  describe('Loading & Initial State', () => {
    test('shows loading indicator on mount', async () => {
      snapshotService.getSchedule.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<SnapshotScheduleForm {...defaultProps} />);
      expect(screen.getByText('Carregando configuração...')).toBeInTheDocument();
    });

    test('loads and displays existing schedule', async () => {
      render(<SnapshotScheduleForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('Carregando configuração...')).not.toBeInTheDocument();
      });

      // Enabled switch Checked
      expect(screen.getByRole('checkbox', { name: /Habilitar snapshots/ })).toBeChecked();

      // Frequency select
      expect(screen.getByText('Mensal')).toBeInTheDocument();

      // Day of month input
      expect(screen.getByLabelText('Dia do Mês')).toHaveValue(15);

      // Retention count
      expect(screen.getByLabelText('Quantidade máxima de snapshots automáticos')).toHaveValue(24);

      // Tags
      expect(screen.getByText('monthly-backup')).toBeInTheDocument();
    });

    test('shows warning if no fiscalBookId', () => {
      render(<SnapshotScheduleForm fiscalBookId="" />);
      expect(screen.getByText(/Nenhum livro fiscal selecionado/)).toBeInTheDocument();
    });
  });

  // ===== Toggle Enable/Disable =====
  describe('Toggle Enable/Disable', () => {
    test('hides options when disabled', async () => {
      const user = userEvent.setup();
      snapshotService.getSchedule.mockResolvedValue({ data: { enabled: false } });

      render(<SnapshotScheduleForm {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando configuração...')).not.toBeInTheDocument();
      });

      // Check switch is off
      const switchControl = screen.getByRole('checkbox', { name: /Habilitar/ });
      expect(switchControl).not.toBeChecked();

      // Inputs hidden
      expect(screen.queryByLabelText('Frequência')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Dia do Mês')).not.toBeInTheDocument();
    });

    test('shows options when enabled', async () => {
      const user = userEvent.setup();
      snapshotService.getSchedule.mockResolvedValue({ data: { enabled: false } });

      render(<SnapshotScheduleForm {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando configuração...')).not.toBeInTheDocument();
      });

      const switchControl = screen.getByRole('checkbox', { name: /Habilitar/ });
      await user.click(switchControl);

      expect(screen.getAllByText('Mensal')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Quantidade máxima de snapshots automáticos')[0]).toBeInTheDocument();
    });
  });

  // ===== Form Interactions =====
  describe('Form Interactions', () => {
    test('changes frequency and shows correct fields', async () => {
      const user = userEvent.setup();
      render(<SnapshotScheduleForm {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando configuração...')).not.toBeInTheDocument();
      });

      // Switch to Weekly using fireEvent.change on the Select's hidden input
      // This bypasses flaky UI interactions with MUI menus in JSDOM
      const frequencyInput = screen.getByDisplayValue('monthly', { hidden: true });
      fireEvent.change(frequencyInput, { target: { value: 'weekly' } });

      expect(screen.getByText('Domingo')).toBeInTheDocument();
      expect(screen.queryByText('Dia do Mês')).not.toBeInTheDocument();
    });

    test('validates day of month input', async () => {
      render(<SnapshotScheduleForm {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando configuração...')).not.toBeInTheDocument();
      });

      const dayInput = screen.getByLabelText('Dia do Mês');
      // Use fireEvent.change to test the strict validation logic directly
      fireEvent.change(dayInput, { target: { value: '50' } });
      expect(dayInput).toHaveValue(31);

      fireEvent.change(dayInput, { target: { value: '-5' } });
      expect(dayInput).toHaveValue(1);
    });

    test('validates retention count input', async () => {
      render(<SnapshotScheduleForm {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando configuração...')).not.toBeInTheDocument();
      });

      const retentionInput = screen.getByLabelText('Quantidade máxima de snapshots automáticos');
      
      // Test 0 -> should default to 12 (because 0 is falsy, triggers default || 12)
      fireEvent.change(retentionInput, { target: { value: '0' } });
      expect(retentionInput).toHaveValue(12);
      
      // Test invalid -> should default to 12
      fireEvent.change(retentionInput, { target: { value: '' } });
      expect(retentionInput).toHaveValue(12);
    });

    test('adds tags', async () => {
      const user = userEvent.setup();
      render(<SnapshotScheduleForm {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando configuração...')).not.toBeInTheDocument();
      });

      const tagsInput = screen.getByLabelText('Tags automáticas');
      await user.type(tagsInput, 'new-tag{enter}');

      expect(screen.getByText('new-tag')).toBeInTheDocument();
    });
  });

  // ===== Save Actions =====
  describe('Save Actions', () => {
    test('saves configuration successfully', async () => {
      const user = userEvent.setup();
      render(<SnapshotScheduleForm {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando configuração...')).not.toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: 'Salvar Configuração' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(snapshotService.updateSchedule).toHaveBeenCalledWith('fb1', expect.objectContaining({
          enabled: true,
          frequency: 'monthly',
          dayOfMonth: 15,
          retentionCount: 24,
        }));
      });

      expect(screen.getByText('Configuração salva com sucesso!')).toBeInTheDocument();
    });

    test('shows loading state while saving', async () => {
      const user = userEvent.setup();
      snapshotService.updateSchedule.mockImplementation(
        () => new Promise(() => {})
      );

      render(<SnapshotScheduleForm {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando configuração...')).not.toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: 'Salvar Configuração' });
      await user.click(saveButton);

      expect(screen.getByText('Salvando...')).toBeInTheDocument();
      expect(saveButton).toBeDisabled();
    });

    test('displays error message on save failure', async () => {
      const user = userEvent.setup();
      snapshotService.updateSchedule.mockRejectedValue(new Error('Save failed'));

      render(<SnapshotScheduleForm {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando configuração...')).not.toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: 'Salvar Configuração' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Save failed')).toBeInTheDocument();
      });
    });

    test('sends correct data for weekly schedule', async () => {
      const user = userEvent.setup();
      render(<SnapshotScheduleForm {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando configuração...')).not.toBeInTheDocument();
      });

      // Change to Weekly
      // 1. Open Frequency Select (currently "Mensal")
      const frequencySelect = screen.getAllByText('Mensal')[0];
      fireEvent.mouseDown(frequencySelect);
      // 2. Click Semanal
      const weeklyOption = await screen.findByRole('option', { name: 'Semanal' });
      fireEvent.click(weeklyOption);

      // Change Day of Week
      // 1. Open Day Select (default "Domingo")
      const daySelect = screen.getAllByText('Domingo')[0];
      fireEvent.mouseDown(daySelect);
      // 2. Click Segunda-feira
      const mondayOption = await screen.findByRole('option', { name: 'Segunda-feira' });
      fireEvent.click(mondayOption);

      const saveButton = screen.getByRole('button', { name: 'Salvar Configuração' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(snapshotService.updateSchedule).toHaveBeenCalledWith('fb1', expect.objectContaining({
          frequency: 'weekly',
          dayOfWeek: 1, // Monday
          dayOfMonth: undefined,
        }));
      });
    });
  });

  // ===== Edge Cases =====
  describe('Edge Cases', () => {
    test('handles empty schedule response (new schedule)', async () => {
      snapshotService.getSchedule.mockResolvedValue({ data: null });
      render(<SnapshotScheduleForm {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando configuração...')).not.toBeInTheDocument();
      });

      // Check defaults
      expect(screen.getByRole('checkbox', { name: /Habilitar/ })).not.toBeChecked();
      expect(screen.queryByLabelText('Frequência')).not.toBeInTheDocument();
    });

    test('handles API error on load', async () => {
      snapshotService.getSchedule.mockRejectedValue(new Error('Load failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<SnapshotScheduleForm {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando configuração...')).not.toBeInTheDocument();
      });

      // Should default to basic state without crashing
      expect(screen.getByRole('checkbox', { name: /Habilitar/ })).not.toBeChecked();

      consoleSpy.mockRestore();
    });

    test('can dismiss success alert', async () => {
      const user = userEvent.setup();
      render(<SnapshotScheduleForm {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando configuração...')).not.toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: 'Salvar Configuração' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Configuração salva com sucesso!')).toBeInTheDocument();
      });

      // Dismiss the success alert
      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);

      expect(screen.queryByText('Configuração salva com sucesso!')).not.toBeInTheDocument();
    });

    test('can dismiss error alert', async () => {
      const user = userEvent.setup();
      snapshotService.updateSchedule.mockRejectedValue(new Error('Save failed'));

      render(<SnapshotScheduleForm {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando configuração...')).not.toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: 'Salvar Configuração' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Save failed')).toBeInTheDocument();
      });

      // Dismiss the error alert
      const closeButton = screen.getByRole('button', { name: 'Close' });
      await user.click(closeButton);

      expect(screen.queryByText('Save failed')).not.toBeInTheDocument();
    });

    test('shows fallback error message when no error.message', async () => {
      const user = userEvent.setup();
      snapshotService.updateSchedule.mockRejectedValue({});

      render(<SnapshotScheduleForm {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando configuração...')).not.toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: 'Salvar Configuração' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to save schedule configuration')).toBeInTheDocument();
      });
    });

    test('works without onSave callback', async () => {
      const user = userEvent.setup();
      render(<SnapshotScheduleForm fiscalBookId="fb1" />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando configuração...')).not.toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: 'Salvar Configuração' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Configuração salva com sucesso!')).toBeInTheDocument();
      });
    });

    test('shows before-status-change info alert', async () => {
      render(<SnapshotScheduleForm {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando configuração...')).not.toBeInTheDocument();
      });

      // Change to before-status-change
      const frequencyInput = screen.getByDisplayValue('monthly', { hidden: true });
      fireEvent.change(frequencyInput, { target: { value: 'before-status-change' } });

      expect(screen.getByText(/snapshot será criado automaticamente antes de cada mudança/)).toBeInTheDocument();
    });
  });
});
