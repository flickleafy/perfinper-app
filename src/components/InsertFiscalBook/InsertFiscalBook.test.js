import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InsertFiscalBook from './InsertFiscalBook';
import { useNavigate } from 'react-router-dom';

let mockSavedBook = { id: 'fb1', bookName: 'Livro X' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../FiscalBookForm', () => ({
  __esModule: true,
  default: ({ onSave, onCancel }) => (
    <div>
      <button type="button" onClick={() => onSave(mockSavedBook)}>
        Save
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

describe('InsertFiscalBook', () => {
  const navigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSavedBook = { id: 'fb1', bookName: 'Livro X' };
    useNavigate.mockReturnValue(navigate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('navigates back via breadcrumb and back button', () => {
    render(<InsertFiscalBook />);

    fireEvent.click(screen.getByRole('button', { name: 'Livros Fiscais' }));
    fireEvent.click(screen.getByRole('button', { name: 'Voltar aos Livros Fiscais' }));

    expect(navigate).toHaveBeenCalledWith('/livros-fiscais');
  });

  it('handles cancel flow', () => {
    const onCancel = jest.fn();

    render(<InsertFiscalBook onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/livros-fiscais');
  });

  it('shows success message then calls onSuccess and navigates', async () => {
    jest.useFakeTimers();
    const onSuccess = jest.fn();

    render(<InsertFiscalBook onSuccess={onSuccess} />);

    fireEvent.click(screen.getByText('Save'));

    expect(
      screen.getByText('Livro fiscal "Livro X" foi criado com sucesso!')
    ).toBeInTheDocument();

    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ bookName: 'Livro X' })
      );
    });
    expect(navigate).toHaveBeenCalledWith('/livros-fiscais');

  });

  it('handles cancel properly when no onCancel prop is provided', () => {
    render(<InsertFiscalBook />); // No onCancel prop

    fireEvent.click(screen.getByText('Cancel'));

    expect(navigate).toHaveBeenCalledWith('/livros-fiscais');
  });

  it('handles success properly when no onSuccess prop is provided', async () => {
    jest.useFakeTimers();
    
    render(<InsertFiscalBook />); // No onSuccess prop

    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText(/foi criado com sucesso/i)).toBeInTheDocument();

    jest.advanceTimersByTime(2000);

    // Should verify navigate was called
    await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('/livros-fiscais');
    });
  });

  it('uses legacy name field in success message if bookName is missing', () => {
    mockSavedBook = { id: 'fb2', name: 'Legacy Book' };

    render(<InsertFiscalBook />);

    fireEvent.click(screen.getByText('Save'));

    expect(
      screen.getByText('Livro fiscal "Legacy Book" foi criado com sucesso!')
    ).toBeInTheDocument();
  });
});
