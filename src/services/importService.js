import http from '../http-common.js';
import { trackPromise } from 'react-promise-tracker';

export const importNubankTransactions = (data) => {
  return trackPromise(http.post('/api/import/nubank', data));
};

export const importFlashTransactions = (data) => {
  return trackPromise(http.post('/api/import/flash', data));
};

export const importMercadolivreTransactions = (data) => {
  return trackPromise(http.post('/api/import/mercadolivre', data));
};
