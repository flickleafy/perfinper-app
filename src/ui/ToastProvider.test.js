import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastProvider';

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Snackbar: ({ open, onClose, children }) => {
      if (!open) {
        return <div data-testid="snackbar" data-open="false" />;
      }
      return (
        <div data-testid="snackbar" data-open="true">
          <button
            type="button"
            data-testid="clickaway"
            onClick={() => onClose({}, 'clickaway')}>
            clickaway
          </button>
          <button
            type="button"
            data-testid="close"
            onClick={() => onClose({}, 'timeout')}>
            close
          </button>
          {children}
        </div>
      );
    },
    Alert: ({ onClose, children }) => (
      <div role="alert">
        <button type="button" onClick={() => onClose({}, 'timeout')}>
          dismiss
        </button>
        {children}
      </div>
    ),
  };
});

const Trigger = ({ message = 'Saved', severity, options }) => {
  const { showToast } = useToast();

  return (
    <button type="button" onClick={() => showToast(message, severity, options)}>
      Show
    </button>
  );
};

describe('ToastProvider', () => {
  it('shows toast message and closes on request', () => {
    render(
      <ToastProvider>
        <Trigger message="Saved" severity="success" options={{ autoHideDuration: 3000 }} />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Saved');
    expect(screen.getByTestId('snackbar')).toHaveAttribute('data-open', 'true');

    fireEvent.click(screen.getByTestId('close'));

    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByTestId('snackbar')).toHaveAttribute('data-open', 'false');
  });

  it('ignores clickaway close requests', () => {
    render(
      <ToastProvider>
        <Trigger message="Clickaway test" severity="info" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    fireEvent.click(screen.getByTestId('clickaway'));

    expect(screen.getByRole('alert')).toHaveTextContent('Clickaway test');
    expect(screen.getByTestId('snackbar')).toHaveAttribute('data-open', 'true');
  });

  it('defaults severity when not provided', () => {
    render(
      <ToastProvider>
        <Trigger message="Default severity" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Default severity');
  });

  it('useToast returns safe no-op when used outside ToastProvider', () => {
    // Component that uses useToast without ToastProvider wrapper
    const OrphanComponent = () => {
      const { showToast } = useToast();
      return (
        <button type="button" onClick={() => showToast('Test message')}>
          Orphan Show
        </button>
      );
    };

    // Render without ToastProvider - should not throw
    render(<OrphanComponent />);
    
    // Click should invoke the default no-op showToast without error
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Orphan Show' }));
    }).not.toThrow();
  });
});
