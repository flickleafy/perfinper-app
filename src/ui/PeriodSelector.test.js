import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PeriodSelector from './PeriodSelector';
import * as transactionService from '../services/transactionService';

jest.mock('../services/transactionService');

describe('PeriodSelector', () => {
  const mockOnDataChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    transactionService.findUniqueYears.mockResolvedValue({
      data: ['2023', '2024', '2022'],
    });
    transactionService.findUniquePeriods.mockResolvedValue({
      data: ['2024-01', '2023-01', '2023-12', '2023-02'],
    });
  });

  it('should render period selector', async () => {
    render(<PeriodSelector onDataChange={mockOnDataChange} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Período')).toBeInTheDocument();
    });
  });

  it('should fetch and display periods on mount', async () => {
    render(<PeriodSelector onDataChange={mockOnDataChange} />);

    await waitFor(() => {
      expect(transactionService.findUniqueYears).toHaveBeenCalled();
      expect(transactionService.findUniquePeriods).toHaveBeenCalled();
    });
  });

  it('should call onDataChange when period is selected', async () => {
    render(<PeriodSelector onDataChange={mockOnDataChange} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Período')).toBeInTheDocument();
    });

    const selector = screen.getByLabelText('Período');
    fireEvent.mouseDown(selector);

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      const option2023 = options.find(opt => opt.getAttribute('data-value') === '2023');
      expect(option2023).toBeInTheDocument();
      fireEvent.click(option2023);
    });

    expect(mockOnDataChange).toHaveBeenCalledWith('2023');
  });

  it('should sort periods with newest year first', async () => {
    render(<PeriodSelector onDataChange={mockOnDataChange} />);

    await waitFor(() => {
      expect(screen.getByTestId('period-selector')).toBeInTheDocument();
    });

    const selector = screen.getByLabelText('Período');
    fireEvent.mouseDown(selector);

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      const optionValues = options.map(opt => opt.getAttribute('data-value'));

      expect(optionValues).toEqual([
        '',
        '2024',
        '2024-01',
        '2023',
        '2023-12',
        '2023-02',
        '2023-01',
        '2022',
      ]);
    });
  });

  it('should filter periods by fiscal book year when provided', async () => {
    const { rerender } = render(
      <PeriodSelector onDataChange={mockOnDataChange} fiscalBookYear={null} />
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Período')).toBeInTheDocument();
    });

    // Initially shows all periods
    const selector = screen.getByLabelText('Período');
    fireEvent.mouseDown(selector);
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      const optionTexts = options.map(opt => opt.textContent);
      expect(optionTexts.some(text => text.includes('2022'))).toBe(true);
      expect(optionTexts.some(text => text.includes('2024'))).toBe(true);
    });
    fireEvent.keyDown(selector, { key: 'Escape' });

    // Filter by fiscal book year
    rerender(<PeriodSelector onDataChange={mockOnDataChange} fiscalBookYear="2023" />);

    fireEvent.mouseDown(selector);
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      const optionTexts = options.map(opt => opt.textContent);
      // Should show 2023 periods
      expect(optionTexts.some(text => text.includes('2023'))).toBe(true);
      // Should not show standalone 2022 or 2024 years
      const has2022Only = optionTexts.some(text => text === 'Ano de 2022');
      const has2024Only = optionTexts.some(text => text === 'Ano de 2024');
      const hasAny2024 = optionTexts.some(text => String(text).includes('2024'));
      expect(has2022Only).toBe(false);
      expect(has2024Only).toBe(false);
      expect(hasAny2024).toBe(false);
    });
  });

  it('should show all periods when fiscalBookYear is cleared', async () => {
    const { rerender } = render(
      <PeriodSelector onDataChange={mockOnDataChange} fiscalBookYear="2023" />
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Período')).toBeInTheDocument();
    });

    // Clear fiscal book filter
    rerender(<PeriodSelector onDataChange={mockOnDataChange} fiscalBookYear={null} />);

    const selector = screen.getByLabelText('Período');
    fireEvent.mouseDown(selector);
    await waitFor(() => {
      // Check that periods from different years are visible
      const options = screen.getAllByRole('option');
      const optionTexts = options.map(opt => opt.textContent);
      // Should include years and months from all periods
      expect(optionTexts.some(text => text.includes('2022'))).toBe(true);
      expect(optionTexts.some(text => text.includes('2024'))).toBe(true);
    });
  });

  it('should handle errors when fetching periods', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    transactionService.findUniqueYears.mockRejectedValue(new Error('Network error'));
    transactionService.findUniquePeriods.mockRejectedValue(new Error('Network error'));

    render(<PeriodSelector onDataChange={mockOnDataChange} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching periods:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});
