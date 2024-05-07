import http from '../http-common.js';
import { trackPromise } from 'react-promise-tracker';

export const insertCategory = (data) => {
  return trackPromise(http.post('/api/category/', data));
};

export const findCategoryById = (id) => {
  return trackPromise(http.get(`/api/category/${id}`));
};

export const updateCategoryById = (id, data) => {
  return trackPromise(http.put(`/api/category/${id}`, data));
};

export const deleteCategoryById = (id) => {
  return trackPromise(http.delete(`/api/category/${id}`));
};

export const getCategories = () => {
  return trackPromise(http.post(`/api/category/all/`));
};
