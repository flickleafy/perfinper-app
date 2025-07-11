import { convertObjectToArray } from './convertObjectToArray';

describe('convertObjectToArray', () => {
  it('converts object entries to array items with ids', () => {
    const input = {
      a1: { name: 'Alpha' },
      b2: { name: 'Beta', count: 2 },
    };

    const result = convertObjectToArray(input);

    expect(result).toEqual([
      { id: 'a1', name: 'Alpha' },
      { id: 'b2', name: 'Beta', count: 2 },
    ]);
  });

  it('returns an empty array when object has no keys', () => {
    expect(convertObjectToArray({})).toEqual([]);
  });
});
