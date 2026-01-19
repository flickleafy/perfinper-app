import http from '../infrastructure/http/http-common.js';
import { trackPromise } from 'react-promise-tracker';

// Company CRUD operations
export const insertCompany = (data) => {
  return trackPromise(http.post('/api/company/', data));
};

export const findCompanyById = (id) => {
  return trackPromise(http.get(`/api/company/${id}`));
};

export const findCompanyByCnpj = (cnpj) => {
  return trackPromise(http.get(`/api/company/cnpj/${cnpj}`));
};

export const updateCompanyById = (id, data) => {
  return trackPromise(http.put(`/api/company/${id}`, data));
};

export const updateCompanyByCnpj = (cnpj, data) => {
  return trackPromise(http.put(`/api/company/cnpj/${cnpj}`, data));
};

export const deleteCompanyById = (id) => {
  return trackPromise(http.delete(`/api/company/${id}`));
};

export const deleteCompanyByCnpj = (cnpj) => {
  return trackPromise(http.delete(`/api/company/cnpj/${cnpj}`));
};

// Company search and listing operations
export const findAllCompanies = () => {
  return trackPromise(http.get('/api/company/'));
};

export const findCompaniesByName = (name) => {
  return trackPromise(http.get(`/api/company/name/${name}`));
};

export const findCompaniesByStatus = (status) => {
  return trackPromise(http.get(`/api/company/status/${status}`));
};

export const findCompaniesByCity = (city) => {
  return trackPromise(http.get(`/api/company/city/${city}`));
};

export const findCompaniesByState = (state) => {
  return trackPromise(http.get(`/api/company/state/${state}`));
};

export const findCompaniesByType = (type) => {
  return trackPromise(http.get(`/api/company/type/${type}`));
};

// Company statistics and metadata
export const getCompanyStatistics = () => {
  return trackPromise(http.get('/api/company/statistics'));
};

export const getUniqueStates = () => {
  return trackPromise(http.get('/api/company/meta/states'));
};

export const getUniqueCities = () => {
  return trackPromise(http.get('/api/company/meta/cities'));
};

export const getUniqueCompanyTypes = () => {
  return trackPromise(http.get('/api/company/meta/types'));
};

// Company activity operations
export const findCompaniesByPrimaryActivity = (activityCode) => {
  return trackPromise(http.get(`/api/company/activity/primary/${activityCode}`));
};

export const findCompaniesBySecondaryActivity = (activityCode) => {
  return trackPromise(http.get(`/api/company/activity/secondary/${activityCode}`));
};

// Batch operations
export const deleteCompaniesByIds = (ids) => {
  return trackPromise(http.post('/api/company/delete/batch', { ids }));
};

export const upsertCompanyByCnpj = (cnpj, data) => {
  return trackPromise(http.post(`/api/company/upsert/cnpj/${cnpj}`, data));
};

// Utility operations
export const findCompaniesWithoutCnpj = () => {
  return trackPromise(http.get('/api/company/query/without-cnpj'));
};

export const updateCompanyStatistics = (cnpj, statistics) => {
  return trackPromise(http.put(`/api/company/statistics/cnpj/${cnpj}`, { statistics }));
};
