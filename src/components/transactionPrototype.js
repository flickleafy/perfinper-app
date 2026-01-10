export function transactionPrototype() {
  return {
    id: null,
    transactionDate: new Date(),
    transactionPeriod: '', // month and year of transaction
    transactionSource: 'manual', // manual, nubank, digio, mercadolivre, flash
    transactionValue: '0,0',
    transactionName: '', // brief description/name about the transaction
    transactionDescription: '', // detailed information about the transaction
    transactionFiscalNote: '', // fiscal note key
    transactionId: '', // transaction id from the transaction source
    transactionStatus: '', // concluded, refunded, started
    transactionLocation: 'other', // 'online', 'local'
    transactionType: '', // 'credit', 'debit'
    transactionCategory: '', // category id
    freightValue: '0,0', // only applicable for online transaction of physical product
    paymentMethod: '', // 'money', 'pix', 'boleto', 'debit card', 'credit card', 'benefit card', 'other'
    items: [
      {
        itemName: '', // brief description/name about the item
        itemDescription: '', // detailed information about the item
        itemValue: '0,0', // individual value of item
        itemUnits: 1, // amount of units of the same item
      },
    ],
    companyName: '', // company name
    companySellerName: '', // seller name from the company
    companyCnpj: '', // company identification key
    fiscalBookId: null,
    fiscalBookName: '',
    fiscalBookYear: null,
  };
}
