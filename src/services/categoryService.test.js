import http from '../infrastructure/http/http-common';
import {
  insertCategory,
  findCategoryById,
  updateCategoryById,
  deleteCategoryById,
  getCategories,
} from './categoryService';

jest.mock('../infrastructure/http/http-common');
jest.mock('react-promise-tracker', () => ({
  trackPromise: jest.fn((promise) => promise),
}));

describe('categoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('insertCategory posts category data', async () => {
    const data = { name: 'Food' };
    http.post.mockResolvedValue({ data: { id: '1' } });

    await insertCategory(data);

    expect(http.post).toHaveBeenCalledWith('/api/category/', data);
  });

  it('findCategoryById gets category by id', async () => {
    http.get.mockResolvedValue({ data: { id: '1' } });

    await findCategoryById('1');

    expect(http.get).toHaveBeenCalledWith('/api/category/1');
  });

  it('updateCategoryById updates category data', async () => {
    const data = { name: 'Food Updated' };
    http.put.mockResolvedValue({ data: { id: '1' } });

    await updateCategoryById('1', data);

    expect(http.put).toHaveBeenCalledWith('/api/category/1', data);
  });

  it('deleteCategoryById deletes category data', async () => {
    http.delete.mockResolvedValue({ data: { success: true } });

    await deleteCategoryById('1');

    expect(http.delete).toHaveBeenCalledWith('/api/category/1');
  });

  it('getCategories fetches all categories', async () => {
    http.get.mockResolvedValue({ data: [] });

    await getCategories();

    expect(http.get).toHaveBeenCalledWith('/api/category/all/itens');
  });
});
