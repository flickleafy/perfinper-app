import PropTypes from 'prop-types';
import { SquircleButton } from './SquircleButton';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export function IncomeButton({
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
      <AttachMoneyIcon sx={{ color: highlightColor }} />
    </SquircleButton>
  );
}

IncomeButton.propTypes = {
  destination: PropTypes.string,
  onClick: PropTypes.func,
  backgroundColor: PropTypes.string,
  highlightColor: PropTypes.string,
};
