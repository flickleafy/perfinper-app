import React from 'react';
import { render } from '@testing-library/react';
import { IncomeButton } from './IncomeButton';
import { TransportButton } from './TransportButton';
import { HealthButton } from './HealthButton';
import { EntertainmentButton } from './EntertainmentButton';
import { GroceryButton } from './GroceryButton';
import { CreditCardButton } from './CreditCardButton';
import { GiftCardButton } from './GiftCardButton';
import { UnknownButton } from './UnknownButton';

var mockSquircle;

jest.mock('./SquircleButton', () => {
  mockSquircle = jest.fn(({ children }) => <div data-testid="squircle">{children}</div>);
  return {
    SquircleButton: (props) => mockSquircle(props),
  };
});

describe('Category buttons', () => {
  const cases = [
    { name: 'IncomeButton', Component: IncomeButton },
    { name: 'TransportButton', Component: TransportButton },
    { name: 'HealthButton', Component: HealthButton },
    { name: 'EntertainmentButton', Component: EntertainmentButton },
    { name: 'GroceryButton', Component: GroceryButton },
    { name: 'CreditCardButton', Component: CreditCardButton },
    { name: 'GiftCardButton', Component: GiftCardButton },
    { name: 'UnknownButton', Component: UnknownButton },
  ];

  beforeEach(() => {
    mockSquircle.mockClear();
  });

  it.each(cases)('renders %s with highlight color on icon', ({ Component }) => {
    const onClick = jest.fn();

    render(
      <Component
        destination="/dest"
        onClick={onClick}
        backgroundColor="#123456"
        highlightColor="#abcdef"
      />
    );

    expect(mockSquircle).toHaveBeenCalled();

    const props = mockSquircle.mock.calls[0][0];
    expect(props.destination).toBe('/dest');
    expect(props.onClick).toBe(onClick);
    expect(props.backgroundColor).toBe('#123456');
    expect(props.children.props.sx.color).toBe('#abcdef');
  });
});
