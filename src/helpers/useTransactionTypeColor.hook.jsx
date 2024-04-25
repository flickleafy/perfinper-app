import { useTheme } from '@mui/material';

export function useTransactionTypeColor(type) {
  const theme = useTheme();
  let backgroundColor;
  let highlightColor;

  if (type === '-') {
    backgroundColor = theme.palette.primary.main;
    highlightColor = theme.palette.primary.light;
  } else {
    backgroundColor = theme.palette.secondary.main;
    highlightColor = theme.palette.secondary.light;
  }

  return {
    backgroundColor,
    highlightColor,
  };
}
