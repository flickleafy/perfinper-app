import { checkSingleDigit } from './checkSingleDigit';

export function formatDatePeriod(date) {
  const dateObj = new Date(date);
  const transactionDate = dateObj.getTime();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  const transactionPeriod = `${year}-${checkSingleDigit(month)}`;
  return { transactionDate, transactionPeriod };
}
