import http from '../infrastructure/http/http-common.js';
import { trackPromise } from 'react-promise-tracker';

// Person CRUD operations
export const insertPerson = (data) => {
  return trackPromise(http.post('/api/person/', data));
};

export const findPersonById = (id) => {
  return trackPromise(http.get(`/api/person/id/${id}`));
};

export const findPersonByCpf = (cpf) => {
  return trackPromise(http.get(`/api/person/cpf/${cpf}`));
};

export const updatePersonById = (id, data) => {
  return trackPromise(http.put(`/api/person/id/${id}`, data));
};

export const updatePersonByCpf = (cpf, data) => {
  return trackPromise(http.put(`/api/person/cpf/${cpf}`, data));
};

export const deletePersonById = (id) => {
  return trackPromise(http.delete(`/api/person/id/${id}`));
};

// Person search and listing operations
export const findAllPeople = () => {
  return trackPromise(http.get('/api/person/'));
};

export const findPeopleByName = (name) => {
  return trackPromise(http.get(`/api/person/name/${name}`));
};

export const findPeopleByStatus = (status) => {
  return trackPromise(http.get(`/api/person/status/${status}`));
};

export const findPeopleByCity = (city) => {
  return trackPromise(http.get(`/api/person/city/${city}`));
};

// Person statistics and metadata
export const getPersonStatistics = () => {
  return trackPromise(http.get('/api/person/statistics'));
};

export const getPersonCount = () => {
  return trackPromise(http.get('/api/person/count'));
};

// Personal business operations
export const findPeopleWithPersonalBusiness = () => {
  return trackPromise(http.get('/api/person/business/all'));
};

export const findPeopleFormalizedBusinesses = () => {
  return trackPromise(http.get('/api/person/business/formalized'));
};

export const findPeopleInformalBusinesses = () => {
  return trackPromise(http.get('/api/person/business/informal'));
};

export const findPeopleByBusinessType = (businessType) => {
  return trackPromise(http.get(`/api/person/business/type/${businessType}`));
};

export const findPeopleByBusinessCategory = (businessCategory) => {
  return trackPromise(http.get(`/api/person/business/category/${businessCategory}`));
};

export const getPersonDistinctBusinessTypes = () => {
  return trackPromise(http.get('/api/person/business/types/distinct'));
};

export const getPersonDistinctBusinessCategories = () => {
  return trackPromise(http.get('/api/person/business/categories/distinct'));
};
