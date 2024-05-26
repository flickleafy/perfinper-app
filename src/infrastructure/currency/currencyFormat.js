// export function currencyFormat(input) {
//   let result = '';
//   let commaAdded = false; // Flag to track if a comma has already been added

//   for (const element of input) {
//     const char = element;
//     if (char === ',' && !commaAdded) {
//       result += char;
//       commaAdded = true; // Set the flag once the first comma is added
//     } else if (char >= '0' && char <= '9') {
//       result += char;
//     }
//   }
//   return result;
// }

export function currencyFormat(input) {
  let result = '';
  let commaAdded = false; // Flag to track if a comma has already been added
  let removeLeadingZeros = true; // Flag to track if leading zeros should be removed

  for (const element of input) {
    const char = element;
    if (char === ',') {
      result += char;
      commaAdded = true;
      removeLeadingZeros = false; // Stop removing leading zeros after comma
    } else if (char >= '0' && char <= '9') {
      if (removeLeadingZeros && char !== '0') {
        removeLeadingZeros = false; // Stop removing leading zeros after first non-zero digit
      }
      if (!removeLeadingZeros) {
        result += char;
      }
    }
  }
  return result;
}
