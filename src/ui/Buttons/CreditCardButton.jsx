import PropTypes from 'prop-types';
import { SquircleButton } from './SquircleButton';
import CreditCardIcon from '@mui/icons-material/CreditCard';

export function CreditCardButton({
  destination = '',
  onClick = () => {},
  backgroundColor = '#7f7f7f',
  highlightColor = '#f2f2f2',
}) {
  return (
    <SquircleButton
      backgroundColor={backgroundColor}
      destination={destination}
      onClick={onClick}>
      <CreditCardIcon sx={{ color: highlightColor }} />
    </SquircleButton>
  );
}

CreditCardButton.propTypes = {
  destination: PropTypes.string,
  onClick: PropTypes.func,
  backgroundColor: PropTypes.string,
  highlightColor: PropTypes.string,
};
