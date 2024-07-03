import http from '../http-common.js';
import { trackPromise } from 'react-promise-tracker';

export const exportTransactions = (data) => {
  return trackPromise(http.post('/api/export', data));
};
