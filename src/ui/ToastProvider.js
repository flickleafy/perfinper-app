import React, { createContext, useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Snackbar, Alert } from '@mui/material';

const ToastContext = createContext({
  showToast: () => {},
});

export const ToastProvider = ({ children }) => {
  const [toastState, setToastState] = useState({
    open: false,
    message: '',
    severity: 'success',
    autoHideDuration: 6000,
  });

  const showToast = useCallback(
    (message, severity = 'info', options = {}) => {
      setToastState({
        open: true,
        message,
        severity,
        autoHideDuration: options.autoHideDuration ?? 6000,
      });
    },
    []
  );

  const handleClose = useCallback((_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setToastState((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={toastState.open}
        autoHideDuration={toastState.autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert
          onClose={handleClose}
          severity={toastState.severity}
          variant='filled'
          sx={{ width: '100%' }}>
          {toastState.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useToast = () => useContext(ToastContext);
