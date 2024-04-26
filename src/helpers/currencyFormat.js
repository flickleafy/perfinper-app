export function currencyFormat(input) {
  let result = '';
  let commaAdded = false; // Flag to track if a comma has already been added

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === ',' && !commaAdded) {
      result += char;
      commaAdded = true; // Set the flag once the first comma is added
    } else if (char >= '0' && char <= '9') {
      result += char;
    }
  }
  return result;
}
