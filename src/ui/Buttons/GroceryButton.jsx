import PropTypes from 'prop-types';
import { SquircleButton } from './SquircleButton';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';

export function GroceryButton({
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
      <LocalGroceryStoreIcon sx={{ color: highlightColor }} />
    </SquircleButton>
  );
}

GroceryButton.propTypes = {
  destination: PropTypes.string,
  onClick: PropTypes.func,
  backgroundColor: PropTypes.string,
  highlightColor: PropTypes.string,
};
