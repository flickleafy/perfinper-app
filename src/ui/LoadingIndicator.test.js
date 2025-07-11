import React from 'react';
import { render, screen } from '@testing-library/react';
import { usePromiseTracker } from 'react-promise-tracker';
import LoadingIndicator from './LoadingIndicator';

jest.mock('react-promise-tracker', () => ({
  usePromiseTracker: jest.fn(),
}));

describe('LoadingIndicator', () => {
  it('shows progress when a promise is in progress', () => {
    usePromiseTracker.mockReturnValue({ promiseInProgress: true });

    render(<LoadingIndicator />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders nothing when no promise is in progress', () => {
    usePromiseTracker.mockReturnValue({ promiseInProgress: false });

    render(<LoadingIndicator />);

    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});
