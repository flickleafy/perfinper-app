import http from '../infrastructure/http/http-common.js';
import { trackPromise } from 'react-promise-tracker';

export const exportTransactions = (year) => {
  return trackPromise(http.get(`/api/export/transactions/${year}`));
};
