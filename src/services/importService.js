import http from '../infrastructure/http/http-common.js';
import { trackPromise } from 'react-promise-tracker';

export const importNubankTransactions = (data) => {
  return trackPromise(http.post('/api/import/nubank', data));
};

export const importNubankCreditTransactions = (data) => {
  return trackPromise(http.post('/api/import/nubank-credit', data));
};

export const importDigioCreditTransactions = (data) => {
  return trackPromise(http.post('/api/import/digio-credit', data));
};

export const importFlashTransactions = (data) => {
  return trackPromise(http.post('/api/import/flash', data));
};

export const importMercadolivreTransactions = (data) => {
  return trackPromise(http.post('/api/import/mercadolivre', data));
};
