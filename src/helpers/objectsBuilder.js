import { formatDatePeriod } from '../infrastructure/date/formatDatePeriod';

// helper functions
export function transactionBuilder(body, date) {
  let {
    transactionDate,
    transactionPeriod,
    totalValue,
    individualValue,
    freightValue,
    itemName,
    itemDescription,
    itemUnits,
    transactionLocation,
    transactionType,
    transactionCategory,
    groupedItem,
    groupedItemsReference,
    transactionFiscalNote,
    transactionId,
    transactionStatus,
    companyName,
    companySellerName,
    companyCnpj,
    transactionSource,
  } = body;
  let object;

  if (date) {
    ({ transactionDate, transactionPeriod } = formatDatePeriod(date));
  }

  totalValue = String(totalValue).replace('.', ',');
  individualValue = String(individualValue).replace('.', ',');
  freightValue = String(freightValue).replace('.', ',');

  object = {
    id: null,
    transactionDate,
    transactionPeriod,
    totalValue,
    individualValue,
    freightValue,
    itemName,
    itemDescription,
    itemUnits,
    transactionLocation,
    transactionType,
    transactionCategory,
    groupedItem,
    groupedItemsReference,
    transactionFiscalNote,
    transactionId,
    transactionStatus,
    companyName,
    companySellerName,
    companyCnpj,
    transactionSource,
  };

  return object;
}
