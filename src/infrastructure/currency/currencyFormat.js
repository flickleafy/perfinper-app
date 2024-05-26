export function currencyFormat(input) {
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
