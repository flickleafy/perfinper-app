import React from 'react';
//Loader
import { usePromiseTracker } from 'react-promise-tracker';

const LoadingIndicator = (props) => {
  const { promiseInProgress } = usePromiseTracker();
  return (
    promiseInProgress && (
      <div class="progress brown lighten-5">
        <div class="indeterminate brown lighten-2"></div>
      </div>
    )
  );
};
export default LoadingIndicator;
