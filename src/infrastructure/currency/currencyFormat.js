export function currencyFormat(input) {
  input = input || '';

  // Remove all non-numeric characters except dots
  input = input.replace(/[^\d,]/g, '');

  // Split the input into whole and fractional parts
  let [whole, fraction = ''] = input.split(',');

  // Remove leading zeros and ensure at least one leading zero if the whole number part is empty
  whole = whole.replace(/^0+/, '') || '0';

  // Format the whole number part with dots as thousand separators
  // whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Ensure two decimal places in the fraction part
  fraction = (fraction + '00').slice(0, 2);

  // Combine the whole and fractional parts
  let result = `${whole},${fraction}`;

  return result;
}

/**
 * Parse monetary value handling both comma and period decimal formats
 * @param {string|number} value - The monetary value to parse
 * @returns {number} Parsed numeric value
 */
export function parseMonetaryValue(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  // Convert comma decimal format to period before parsing
  const normalized = String(value).replace(',', '.');
  return parseFloat(normalized) || 0;
}
