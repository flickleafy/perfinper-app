import { csvToJson } from './csvToJson';

describe('csvToJson', () => {
  it('converts CSV rows into objects', () => {
    const csv = 'name,amount\nRent,100\nFood,50';

    const result = csvToJson(csv);

    expect(result).toEqual([
      { name: 'Rent', amount: '100' },
      { name: 'Food', amount: '50' },
    ]);
  });

  it('includes empty values when a row has missing columns', () => {
    const csv = 'name,amount\nOnlyName';

    const result = csvToJson(csv);

    expect(result).toEqual([{ name: 'OnlyName', amount: undefined }]);
  });
});
