import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FiscalBookForm from './FiscalBookForm';
import fiscalBookService from '../services/fiscalBookService';

jest.mock('../services/fiscalBookService', () => ({
  create: jest.fn(),
  update: jest.fn(),
}));

describe('FiscalBookForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates required fields before submit', async () => {
    render(<FiscalBookForm onSave={() => {}} onCancel={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByText('Nome do livro \u00e9 obrigat\u00f3rio')).toBeInTheDocument();
    expect(fiscalBookService.create).not.toHaveBeenCalled();
  });

  it('submits a new fiscal book and calls onSave', async () => {
    const onSave = jest.fn();
    let resolveCreate;
    const createPromise = new Promise((resolve) => {
      resolveCreate = resolve;
    });

    fiscalBookService.create.mockReturnValue(createPromise);

    render(<FiscalBookForm onSave={onSave} onCancel={() => {}} />);

        fireEvent.change(screen.getByPlaceholderText(/ex: Livro de Entrada/i), {
      target: { value: 'Livro 2024' },
    });
    fireEvent.change(screen.getByPlaceholderText('2024'), {
      target: { value: '2024' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));

    expect(screen.getByRole('button', { name: /Salvando/i })).toBeInTheDocument();

    resolveCreate({ id: '1' });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({ id: '1' });
    });
  });

  it('shows warning and disables submit when not editable', () => {
    render(
      <FiscalBookForm
        isEditing
        fiscalBook={{ _id: '1', status: 'Fechado', closedAt: '2024-01-01T00:00:00Z' }}
        onSave={() => {}}
        onCancel={() => {}}
      />
    );

    expect(
      screen.getByText(/n\u00e3o pode ser editado/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Atualizar/i })).toBeDisabled();
  });

  it('updates an existing fiscal book when editing', async () => {
    fiscalBookService.update.mockResolvedValue({ id: '1' });
    const onSave = jest.fn();

    render(
      <FiscalBookForm
        isEditing
        fiscalBook={{ _id: '1', bookName: 'Old', bookPeriod: '2023' }}
        onSave={onSave}
        onCancel={() => {}}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/ex: Livro/i), {
      target: { value: 'Updated' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Atualizar/i }));

    await waitFor(() => {
      expect(fiscalBookService.update).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ bookName: 'Updated' })
      );
    });
  });

  it('shows submit error when save fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fiscalBookService.create.mockRejectedValue(new Error('save failed'));

    render(<FiscalBookForm onSave={() => {}} onCancel={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText(/ex: Livro/i), {
      target: { value: 'Livro 2024' },
    });
    fireEvent.change(screen.getByPlaceholderText('2024'), {
      target: { value: '2024' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByText('save failed')).toBeInTheDocument();
    console.error.mockRestore();
  });

  it('clears submit error when fiscal data changes', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fiscalBookService.create.mockRejectedValue(new Error('save failed'));

    render(<FiscalBookForm onSave={() => {}} onCancel={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText(/ex: Livro/i), {
      target: { value: 'Livro 2024' },
    });
    fireEvent.change(screen.getByPlaceholderText('2024'), {
      target: { value: '2024' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByText('save failed')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('\u00d3rg\u00e3o Fiscal'), {
      target: { value: 'Something' },
    });

    expect(screen.queryByText('save failed')).not.toBeInTheDocument();
    console.error.mockRestore();
  });

  it('clears submit error when top level field changes', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fiscalBookService.create.mockRejectedValue(new Error('save failed'));

    render(<FiscalBookForm onSave={() => {}} onCancel={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText(/ex: Livro/i), { target: { value: 'Book' } });
    fireEvent.change(screen.getByPlaceholderText('2024'), { target: { value: '2024' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));
    
    expect(await screen.findByText('save failed')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/ex: Livro/i), { target: { value: 'Book Updated' } });
    
    expect(screen.queryByText('save failed')).not.toBeInTheDocument();
    console.error.mockRestore();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn();

    render(<FiscalBookForm onSave={() => {}} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('validates lengthy notes and references', async () => {
    // Mock validate functions if necessary or rely on logic. 
    // The component uses internal logic for length check.

    render(<FiscalBookForm onSave={() => {}} onCancel={() => {}} />);

    const longRef = 'a'.repeat(101);
    const longNotes = 'a'.repeat(501);

    fireEvent.change(screen.getByPlaceholderText(/ex: Livro/i), {
      target: { value: 'Livro 2024' },
    });
    fireEvent.change(screen.getByPlaceholderText('2024'), {
      target: { value: '2024' },
    });

    fireEvent.change(screen.getByLabelText('Referência'), {
      target: { value: longRef },
    });
    fireEvent.change(screen.getByLabelText('Observações'), {
      target: { value: longNotes },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));

    expect(screen.getByText('Referência deve ter menos de 100 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Notas devem ter menos de 500 caracteres')).toBeInTheDocument();

    // Now clear errors by typing
    fireEvent.change(screen.getByLabelText('Referência'), {
      target: { value: 'Short Ref' },
    });
    expect(screen.queryByText('Referência deve ter menos de 100 caracteres')).not.toBeInTheDocument();
  });

  it('updates an existing fiscal book when editing with only id (no _id)', async () => {
    fiscalBookService.update.mockResolvedValue({ id: '1' });
    const onSave = jest.fn();

    render(
      <FiscalBookForm
        isEditing
        fiscalBook={{ id: '1', bookName: 'Old', bookPeriod: '2023' }}
        onSave={onSave}
        onCancel={() => {}}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/ex: Livro/i), {
      target: { value: 'Updated' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Atualizar/i }));

    await waitFor(() => {
      expect(fiscalBookService.update).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ bookName: 'Updated' })
      );
    });
  });
});
