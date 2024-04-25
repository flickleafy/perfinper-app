import PropTypes from 'prop-types';
import { SquircleButton } from './SquircleButton';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

export function HealthButton({
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
      <LocalHospitalIcon sx={{ color: highlightColor }} />;
    </SquircleButton>
  );
}

HealthButton.propTypes = {
  destination: PropTypes.string,
  onClick: PropTypes.func,
  backgroundColor: PropTypes.string,
  highlightColor: PropTypes.string,
};
