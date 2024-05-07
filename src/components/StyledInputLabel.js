import { InputLabel, styled, alpha } from '@mui/material';

export const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
  color: alpha(theme.palette.common.white, 0.55),
  top: -8,
  '&.Mui-focused, &.MuiInputLabel-shrink': {
    color: alpha(theme.palette.common.white, 0.95),
    top: 0,
  },
}));
