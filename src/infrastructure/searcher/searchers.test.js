import {
  searchCategory,
  searchFields,
  searchByID,
  getIndexOfElement,
} from './searchers';

describe('searchers', () => {
  it('searchCategory matches by category name (case-insensitive)', () => {
    const data = [
      { transactionCategory: 'Food' },
      { transactionCategory: 'Transport' },
    ];

    const result = searchCategory('food', data);

    expect(result).toEqual([{ transactionCategory: 'Food' }]);
  });

  it('searchFields matches any field value when searching', () => {
    const data = [
      { name: 'Alpha', description: 'First' },
      { name: 'Beta', description: 'Second' },
      { name: 123, description: 'Third' },
    ];

    const result = searchFields('be', data, ['name', 'description']);

    expect(result).toEqual([{ name: 'Beta', description: 'Second' }]);
  });

  it('searchFields excludes entries that include the term in all fields', () => {
    const data = [
      { name: 'apple', description: 'apple pie' },
      { name: 'banana', description: 'fruit salad' },
    ];

    const result = searchFields('-apple', data, ['name', 'description']);

    expect(result).toEqual([{ name: 'banana', description: 'fruit salad' }]);
  });

  it('searchByID returns the first item that includes the id fragment', () => {
    const data = [{ id: 'abc-123' }, { id: 'def-456' }];

    expect(searchByID('123', data)).toEqual({ id: 'abc-123' });
  });

  it('getIndexOfElement returns index or -1', () => {
    const data = [{ id: 'a' }, { id: 'b' }];

    expect(getIndexOfElement('b', data)).toBe(1);
    expect(getIndexOfElement('missing', data)).toBe(-1);
  });
});
