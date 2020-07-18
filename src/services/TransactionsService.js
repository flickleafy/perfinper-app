import http from '../http-common';
import { trackPromise } from 'react-promise-tracker';

const insertTransaction = (data) => {
  return trackPromise(http.post('/api/transaction/', data));
};

const findTransactionById = (id) => {
  return trackPromise(http.get(`/api/transaction/${id}`));
};

const updateTransactionById = (id, data) => {
  return trackPromise(http.put(`/api/transaction/${id}`, data));
};

const deleteTransactionById = (id) => {
  return trackPromise(http.delete(`/api/transaction/${id}`));
};

const findAllTransactionsInPeriod = (yearMonth) => {
  return trackPromise(http.get(`/api/transaction/period/${yearMonth}`));
};

const removeAllTransactionsInPeriod = (yearMonth) => {
  return http.delete(`/api/transaction/period/${yearMonth}`);
};

const findUniquePeriods = () => {
  return http.post(`/api/transaction/periods/`);
};

const removeAllByNameDEPRECATED = (name) => {
  return http.delete(`/grade?name=${name}`);
};

const findByNameDEPRECATED = (name) => {
  return http.get(`/grade?name=${name}`);
};

export default {
  insertTransaction: insertTransaction,
  findTransactionById: findTransactionById,
  updateTransactionById: updateTransactionById,
  deleteTransactionById: deleteTransactionById,
  findAllTransactionsInPeriod: findAllTransactionsInPeriod,
  removeAllTransactionsInPeriod: removeAllTransactionsInPeriod,
  findUniquePeriods: findUniquePeriods,
  removeAllByNameDEPRECATED: removeAllByNameDEPRECATED,
  findByNameDEPRECATED: findByNameDEPRECATED,
};
