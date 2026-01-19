import http from '../infrastructure/http/http-common';
import {
  insertPerson,
  findPersonById,
  findPersonByCpf,
  updatePersonById,
  updatePersonByCpf,
  deletePersonById,
  findAllPeople,
  findPeopleByName,
  findPeopleByStatus,
  findPeopleByCity,
  getPersonStatistics,
  getPersonCount,
  findPeopleWithPersonalBusiness,
  findPeopleFormalizedBusinesses,
  findPeopleInformalBusinesses,
  findPeopleByBusinessType,
  findPeopleByBusinessCategory,
  getPersonDistinctBusinessTypes,
  getPersonDistinctBusinessCategories,
} from './personService';

jest.mock('../infrastructure/http/http-common');
jest.mock('react-promise-tracker', () => ({
  trackPromise: jest.fn((promise) => promise),
}));

describe('personService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('insertPerson posts person data', async () => {
    const data = { name: 'Jane' };
    http.post.mockResolvedValue({ data: { id: '1' } });

    await insertPerson(data);

    expect(http.post).toHaveBeenCalledWith('/api/person/', data);
  });

  it('updatePersonById updates person data', async () => {
    const data = { name: 'Jane Updated' };
    http.put.mockResolvedValue({ data: { id: '1' } });

    await updatePersonById('1', data);

    expect(http.put).toHaveBeenCalledWith('/api/person/id/1', data);
  });

  it('updatePersonByCpf updates person data by cpf', async () => {
    const data = { status: 'Active' };
    http.put.mockResolvedValue({ data: { id: '2' } });

    await updatePersonByCpf('123', data);

    expect(http.put).toHaveBeenCalledWith('/api/person/cpf/123', data);
  });

  it('deletePersonById deletes person data by id', async () => {
    http.delete.mockResolvedValue({ data: { success: true } });

    await deletePersonById('1');

    expect(http.delete).toHaveBeenCalledWith('/api/person/id/1');
  });

  it.each([
    ['findPersonById', findPersonById, ['1'], '/api/person/id/1'],
    ['findPersonByCpf', findPersonByCpf, ['123'], '/api/person/cpf/123'],
    ['findAllPeople', findAllPeople, [], '/api/person/'],
    ['findPeopleByName', findPeopleByName, ['Jane'], '/api/person/name/Jane'],
    ['findPeopleByStatus', findPeopleByStatus, ['Active'], '/api/person/status/Active'],
    ['findPeopleByCity', findPeopleByCity, ['NYC'], '/api/person/city/NYC'],
    ['getPersonStatistics', getPersonStatistics, [], '/api/person/statistics'],
    ['getPersonCount', getPersonCount, [], '/api/person/count'],
    ['findPeopleWithPersonalBusiness', findPeopleWithPersonalBusiness, [], '/api/person/business/all'],
    [
      'findPeopleFormalizedBusinesses',
      findPeopleFormalizedBusinesses,
      [],
      '/api/person/business/formalized',
    ],
    [
      'findPeopleInformalBusinesses',
      findPeopleInformalBusinesses,
      [],
      '/api/person/business/informal',
    ],
    [
      'findPeopleByBusinessType',
      findPeopleByBusinessType,
      ['Retail'],
      '/api/person/business/type/Retail',
    ],
    [
      'findPeopleByBusinessCategory',
      findPeopleByBusinessCategory,
      ['Food'],
      '/api/person/business/category/Food',
    ],
    [
      'getPersonDistinctBusinessTypes',
      getPersonDistinctBusinessTypes,
      [],
      '/api/person/business/types/distinct',
    ],
    [
      'getPersonDistinctBusinessCategories',
      getPersonDistinctBusinessCategories,
      [],
      '/api/person/business/categories/distinct',
    ],
  ])('%s issues a GET request', async (_, fn, args, url) => {
    http.get.mockResolvedValue({ data: {} });

    await fn(...args);

    expect(http.get).toHaveBeenCalledWith(url);
  });
});
