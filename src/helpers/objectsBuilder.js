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
    transactionOrigin,
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
    transactionOrigin,
  };

  return object;
}

function formatDatePeriod(date) {
  const dateObj = new Date(date);
  const transactionDate = dateObj.getTime();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  const transactionPeriod = `${year}-${checkSingleDigit(month)}`;
  return { transactionDate, transactionPeriod };
}

export function formatDate(date) {
  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  const transactionDate = `${checkSingleDigit(day)}/${checkSingleDigit(month)}`;
  return transactionDate;
}

export function checkSingleDigit(number) {
  if (/^\d$/.test(number)) {
    return `0${number}`;
  }
  return number;
}

export function buildDateObj(data) {
  const { year, month, day } = data;
  let date = new Date(year, month - 1, day);
  return date;
}

// prettier-ignore
export function monthNameByNumber(month) {
  switch (month) {
    case "01":return 'Janeiro';  case "02":return 'Fevereiro';
    case "03":return 'Março';    case "04":return 'Abril';
    case "05":return 'Maio';     case "06":return 'Junho';
    case "07":return 'Julho';    case "08":return 'Agosto';
    case "09":return 'Setembro'; case "10":return 'Outubro';
    case "11":return 'Novembro'; case "12":return 'Dezembro';
    default:return '';
  }
}

export function numberDateToExtenseDate(period) {
  let split = period.split('-');
  const [year, month] = split;
  if (!month) {
    return `Ano de ${year}`;
  }
  return `${monthNameByNumber(month)} de ${year}`;
}
