import { monthNameByNumber } from './monthNameByNumber';

export function numberDateToExtenseDate(period) {
  let split = period.split('-');
  const [year, month] = split;
  if (!month) {
    return `Ano de ${year}`;
  }
  return `${monthNameByNumber(month)} de ${year}`;
}
