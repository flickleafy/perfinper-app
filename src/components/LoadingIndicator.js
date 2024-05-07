import React from 'react';
import { usePromiseTracker } from 'react-promise-tracker';
import { LinearProgress, Box } from '@mui/material';

const LoadingIndicator = () => {
  const { promiseInProgress } = usePromiseTracker();

  return (
    promiseInProgress && (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'>
        <LinearProgress color='primary' />
      </Box>
    )
  );
};

export default LoadingIndicator;
