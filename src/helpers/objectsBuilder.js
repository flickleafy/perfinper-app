import { formatDatePeriod } from '../infrastructure/date/formatDatePeriod';

// helper functions
export function transactionBuilder(body, date) {
  let {
    transactionDate,
    transactionPeriod,
    transactionSource,
    transactionValue,
    transactionName,
    transactionDescription,
    transactionFiscalNote,
    transactionId,
    transactionStatus,
    transactionLocation,
    transactionType,
    transactionCategory,
    freightValue,
    paymentMethod,
    items,
    companyName,
    companySellerName,
    companyCnpj,
  } = body;

  if (date) {
    ({ transactionDate, transactionPeriod } = formatDatePeriod(date));
  }

  transactionValue = String(transactionValue).replace('.', ',');
  freightValue = String(freightValue).replace('.', ',');

  return {
    id: null,
    transactionDate,
    transactionPeriod,
    transactionSource,
    transactionValue,
    transactionName,
    transactionDescription,
    transactionFiscalNote,
    transactionId,
    transactionStatus,
    transactionLocation,
    transactionType,
    transactionCategory,
    freightValue,
    paymentMethod,
    items,
    companyName,
    companySellerName,
    companyCnpj,
  };
}
