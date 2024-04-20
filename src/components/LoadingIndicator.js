import React from 'react';
import { usePromiseTracker } from 'react-promise-tracker';
import { CircularProgress, LinearProgress, Box } from '@mui/material';

const LoadingIndicator = (props) => {
  const { promiseInProgress } = usePromiseTracker();

  return (
    promiseInProgress && (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'>
        <CircularProgress color='primary' />
      </Box>
    )
  );
};

export default LoadingIndicator;
