import { checkSingleDigit } from './checkSingleDigit';

describe('checkSingleDigit', () => {
  it('pads single-digit strings with a leading zero', () => {
    expect(checkSingleDigit('3')).toBe('03');
  });

  it('returns multi-digit strings unchanged', () => {
    expect(checkSingleDigit('12')).toBe('12');
  });
});
