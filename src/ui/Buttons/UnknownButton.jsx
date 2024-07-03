import PropTypes from 'prop-types';
import { SquircleButton } from './SquircleButton';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export function UnknownButton({
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
      <HelpOutlineIcon sx={{ color: highlightColor }} />
    </SquircleButton>
  );
}

UnknownButton.propTypes = {
  destination: PropTypes.string,
  onClick: PropTypes.func,
  backgroundColor: PropTypes.string,
  highlightColor: PropTypes.string,
};
