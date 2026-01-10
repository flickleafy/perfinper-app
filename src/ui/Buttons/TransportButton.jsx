import PropTypes from 'prop-types';
import { SquircleButton } from './SquircleButton';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

export function TransportButton({
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
      <DirectionsCarIcon sx={{ color: highlightColor }} />
    </SquircleButton>
  );
}

TransportButton.propTypes = {
  destination: PropTypes.string,
  onClick: PropTypes.func,
  backgroundColor: PropTypes.string,
  highlightColor: PropTypes.string,
};
