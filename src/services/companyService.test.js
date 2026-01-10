import http from '../infrastructure/http/http-common';
import {
  insertCompany,
  findCompanyById,
  findCompanyByCnpj,
  updateCompanyById,
  updateCompanyByCnpj,
  deleteCompanyById,
  deleteCompanyByCnpj,
  findAllCompanies,
  findCompaniesByName,
  findCompaniesByStatus,
  findCompaniesByCity,
  findCompaniesByState,
  findCompaniesByType,
  getCompanyStatistics,
  getUniqueStates,
  getUniqueCities,
  getUniqueCompanyTypes,
  findCompaniesByPrimaryActivity,
  findCompaniesBySecondaryActivity,
  deleteCompaniesByIds,
  upsertCompanyByCnpj,
  findCompaniesWithoutCnpj,
  updateCompanyStatistics,
} from './companyService';

jest.mock('../infrastructure/http/http-common');
jest.mock('react-promise-tracker', () => ({
  trackPromise: jest.fn((promise) => promise),
}));

describe('companyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('insertCompany posts company data', async () => {
    const data = { name: 'Acme' };
    http.post.mockResolvedValue({ data: { id: '1' } });

    await insertCompany(data);

    expect(http.post).toHaveBeenCalledWith('/api/company/', data);
  });

  it('updateCompanyById updates company data', async () => {
    const data = { name: 'Acme Updated' };
    http.put.mockResolvedValue({ data: { id: '1' } });

    await updateCompanyById('1', data);

    expect(http.put).toHaveBeenCalledWith('/api/company/1', data);
  });

  it('updateCompanyByCnpj updates company data by cnpj', async () => {
    const data = { status: 'Active' };
    http.put.mockResolvedValue({ data: { id: '2' } });

    await updateCompanyByCnpj('123', data);

    expect(http.put).toHaveBeenCalledWith('/api/company/cnpj/123', data);
  });

  it('deleteCompanyById deletes company data by id', async () => {
    http.delete.mockResolvedValue({ data: { success: true } });

    await deleteCompanyById('1');

    expect(http.delete).toHaveBeenCalledWith('/api/company/1');
  });

  it('deleteCompanyByCnpj deletes company data by cnpj', async () => {
    http.delete.mockResolvedValue({ data: { success: true } });

    await deleteCompanyByCnpj('123');

    expect(http.delete).toHaveBeenCalledWith('/api/company/cnpj/123');
  });

  it('deleteCompaniesByIds sends batch delete request', async () => {
    http.post.mockResolvedValue({ data: { success: true } });

    await deleteCompaniesByIds(['1', '2']);

    expect(http.post).toHaveBeenCalledWith('/api/company/delete/batch', { ids: ['1', '2'] });
  });

  it('upsertCompanyByCnpj posts company data', async () => {
    const data = { name: 'Acme' };
    http.post.mockResolvedValue({ data: { id: '1' } });

    await upsertCompanyByCnpj('123', data);

    expect(http.post).toHaveBeenCalledWith('/api/company/upsert/cnpj/123', data);
  });

  it('updateCompanyStatistics updates statistics payload', async () => {
    const statistics = { revenue: 100 };
    http.put.mockResolvedValue({ data: { success: true } });

    await updateCompanyStatistics('123', statistics);

    expect(http.put).toHaveBeenCalledWith('/api/company/statistics/cnpj/123', { statistics });
  });

  it.each([
    ['findCompanyById', findCompanyById, ['1'], '/api/company/1'],
    ['findCompanyByCnpj', findCompanyByCnpj, ['123'], '/api/company/cnpj/123'],
    ['findAllCompanies', findAllCompanies, [], '/api/company/'],
    ['findCompaniesByName', findCompaniesByName, ['Acme'], '/api/company/name/Acme'],
    ['findCompaniesByStatus', findCompaniesByStatus, ['Active'], '/api/company/status/Active'],
    ['findCompaniesByCity', findCompaniesByCity, ['NYC'], '/api/company/city/NYC'],
    ['findCompaniesByState', findCompaniesByState, ['CA'], '/api/company/state/CA'],
    ['findCompaniesByType', findCompaniesByType, ['LLC'], '/api/company/type/LLC'],
    ['getCompanyStatistics', getCompanyStatistics, [], '/api/company/statistics'],
    ['getUniqueStates', getUniqueStates, [], '/api/company/meta/states'],
    ['getUniqueCities', getUniqueCities, [], '/api/company/meta/cities'],
    ['getUniqueCompanyTypes', getUniqueCompanyTypes, [], '/api/company/meta/types'],
    [
      'findCompaniesByPrimaryActivity',
      findCompaniesByPrimaryActivity,
      ['A01'],
      '/api/company/activity/primary/A01',
    ],
    [
      'findCompaniesBySecondaryActivity',
      findCompaniesBySecondaryActivity,
      ['B02'],
      '/api/company/activity/secondary/B02',
    ],
    ['findCompaniesWithoutCnpj', findCompaniesWithoutCnpj, [], '/api/company/query/without-cnpj'],
  ])('%s issues a GET request', async (_, fn, args, url) => {
    http.get.mockResolvedValue({ data: {} });

    await fn(...args);

    expect(http.get).toHaveBeenCalledWith(url);
  });
});
