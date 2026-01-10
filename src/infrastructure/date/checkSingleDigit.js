export function checkSingleDigit(number) {
  if (/^\d$/.test(number)) {
    return `0${number}`;
  }
  return number;
}
