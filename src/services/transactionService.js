import http from '../http-common.js';
import { trackPromise } from 'react-promise-tracker';

export const insertTransaction = (data) => {
  return trackPromise(http.post('/api/transaction/', data));
};

export const findTransactionById = (id) => {
  return trackPromise(http.get(`/api/transaction/${id}`));
};

export const updateTransactionById = (id, data) => {
  return trackPromise(http.put(`/api/transaction/${id}`, data));
};

export const deleteTransactionById = (id) => {
  return trackPromise(http.delete(`/api/transaction/${id}`));
};

export const separateTransactionById = (id) => {
  return trackPromise(http.post(`/api/transaction/separate/${id}`));
};

export const findAllTransactionsInPeriod = (yearMonth) => {
  return trackPromise(http.get(`/api/transaction/period/${yearMonth}`));
};

export const removeAllTransactionsInPeriod = (yearMonth) => {
  return http.delete(`/api/transaction/period/${yearMonth}`);
};

export const findUniquePeriods = () => {
  return http.post(`/api/transaction/periods/`);
};

export const findUniqueYears = () => {
  return http.post(`/api/transaction/years/`);
};

export const removeAllByNameDEPRECATED = (name) => {
  return http.delete(`/grade?name=${name}`);
};

export const findByNameDEPRECATED = (name) => {
  return http.get(`/grade?name=${name}`);
};
