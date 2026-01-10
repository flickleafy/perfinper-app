import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { IconButton, useTheme } from '@mui/material';

export function SquircleButton({
  destination = '',
  onClick = () => {},
  backgroundColor = '#7f7f7f',
  children = <></>,
}) {
  const theme = useTheme();
  return (
    <IconButton
      component={Link}
      to={destination}
      onClick={onClick}
      sx={{
        backgroundColor: backgroundColor,
        borderRadius: theme.shape.borderRadius,
        padding: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.3s', // Smooth transition for the background color
        '&:hover': {
          // Styling for hover state
          backgroundColor: 'rgba(0, 0, 0, 0.10)', // Light hover background

          // Increase intensity or change color for highlight:
          '@media (hover: hover) and (pointer: fine)': {
            backgroundColor: 'rgba(0, 0, 0, 0.30)', // Darker on hover
          },
        },
      }}>
      {children}
    </IconButton>
  );
}

SquircleButton.propTypes = {
  destination: PropTypes.string,
  onClick: PropTypes.func,
  backgroundColor: PropTypes.string,
  children: PropTypes.element,
};
