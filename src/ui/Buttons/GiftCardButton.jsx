import PropTypes from 'prop-types';
import { SquircleButton } from './SquircleButton';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

export function GiftCardButton({
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
      <CardGiftcardIcon sx={{ color: highlightColor }} />
    </SquircleButton>
  );
}

GiftCardButton.propTypes = {
  destination: PropTypes.string,
  onClick: PropTypes.func,
  backgroundColor: PropTypes.string,
  highlightColor: PropTypes.string,
};
