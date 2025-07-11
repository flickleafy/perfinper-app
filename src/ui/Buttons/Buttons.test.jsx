import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CreditCardButton } from './CreditCardButton';
import { EntertainmentButton } from './EntertainmentButton';
import { GiftCardButton } from './GiftCardButton';
import { GroceryButton } from './GroceryButton';
import { HealthButton } from './HealthButton';
import { IncomeButton } from './IncomeButton';
import { TransportButton } from './TransportButton';
import { UnknownButton } from './UnknownButton';
import { SquircleButton } from './SquircleButton';

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

const buttonCases = [
  ['CreditCardButton', CreditCardButton, 'CreditCardIcon'],
  ['EntertainmentButton', EntertainmentButton, 'DirectionsBikeIcon'],
  ['GiftCardButton', GiftCardButton, 'CardGiftcardIcon'],
  ['GroceryButton', GroceryButton, 'LocalGroceryStoreIcon'],
  ['HealthButton', HealthButton, 'LocalHospitalIcon'],
  ['IncomeButton', IncomeButton, 'AttachMoneyIcon'],
  ['TransportButton', TransportButton, 'DirectionsCarIcon'],
  ['UnknownButton', UnknownButton, 'HelpOutlineIcon'],
];

describe('Buttons', () => {
  it.each(buttonCases)('renders %s with defaults', (_, Component, iconTestId) => {
    renderWithRouter(<Component />);

    const icon = screen.getByTestId(iconTestId);
    expect(icon).toBeInTheDocument();
    expect(icon.closest('a')).toBeInTheDocument();
  });

  it.each(buttonCases)('handles click and custom props for %s', (_, Component, iconTestId) => {
    const onClick = jest.fn();

    renderWithRouter(
      <Component
        destination="/destino"
        onClick={onClick}
        backgroundColor="#111111"
        highlightColor="#eeeeee"
      />
    );

    const icon = screen.getByTestId(iconTestId);
    fireEvent.click(icon.closest('a'));

    expect(onClick).toHaveBeenCalled();
    expect(icon).toBeInTheDocument();
  });

  it('renders SquircleButton with defaults and custom children', () => {
    const onClick = jest.fn();

    const { rerender } = renderWithRouter(<SquircleButton />);
    expect(document.querySelector('a')).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <SquircleButton destination="/rota" onClick={onClick} backgroundColor="#222222">
          <span>Child</span>
        </SquircleButton>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Child').closest('a'));
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByText('Child')).toBeInTheDocument();
  });
});
