import React from 'react';
//Loader
import { usePromiseTracker } from 'react-promise-tracker';

const LoadingIndicator = (props) => {
  const { promiseInProgress } = usePromiseTracker();
  return (
    promiseInProgress && (
      <div className="progress brown lighten-5">
        <div className="indeterminate brown lighten-2"></div>
      </div>
    )
  );
};
export default LoadingIndicator;
