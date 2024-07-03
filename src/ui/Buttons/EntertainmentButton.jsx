import PropTypes from 'prop-types';
import { SquircleButton } from './SquircleButton';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';

export function EntertainmentButton({
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
      <DirectionsBikeIcon sx={{ color: highlightColor }} />;
    </SquircleButton>
  );
}

EntertainmentButton.propTypes = {
  destination: PropTypes.string,
  onClick: PropTypes.func,
  backgroundColor: PropTypes.string,
  highlightColor: PropTypes.string,
};
