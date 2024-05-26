import { checkSingleDigit } from './checkSingleDigit';

export function formatDate(date) {
  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  // const year = dateObj.getFullYear();
  const transactionDate = `${checkSingleDigit(day)}/${checkSingleDigit(month)}`;
  return transactionDate;
}
