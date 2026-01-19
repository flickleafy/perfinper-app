import { transactionPrototype } from './transactionPrototype';

describe('transactionPrototype', () => {
  it('returns the default transaction shape', () => {
    const transaction = transactionPrototype();

    expect(transaction).toEqual(
      expect.objectContaining({
        id: null,
        transactionSource: 'manual',
        transactionValue: '0,0',
        freightValue: '0,0',
        items: [
          expect.objectContaining({
            itemName: '',
            itemValue: '0,0',
            itemUnits: 1,
          }),
        ],
      })
    );
  });
});
