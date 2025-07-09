import http from '../infrastructure/http/http-common.js';
import { trackPromise } from 'react-promise-tracker';

export const importNubankTransactions = (data, fiscalBookId) => {
  const params = fiscalBookId ? { fiscalBookId } : {};
  return trackPromise(http.post('/api/import/nubank', data, { params }));
};

export const importNubankCreditTransactions = (data, fiscalBookId) => {
  const params = fiscalBookId ? { fiscalBookId } : {};
  return trackPromise(http.post('/api/import/nubank-credit', data, { params }));
};

export const importDigioCreditTransactions = (data, fiscalBookId) => {
  const params = fiscalBookId ? { fiscalBookId } : {};
  return trackPromise(http.post('/api/import/digio-credit', data, { params }));
};

export const importFlashTransactions = (data, fiscalBookId) => {
  const params = fiscalBookId ? { fiscalBookId } : {};
  return trackPromise(http.post('/api/import/flash', data, { params }));
};

export const importMercadolivreTransactions = (data, fiscalBookId) => {
  const params = fiscalBookId ? { fiscalBookId } : {};
  return trackPromise(http.post('/api/import/mercadolivre', data, { params }));
};
