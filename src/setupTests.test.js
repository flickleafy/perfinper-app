describe('setupTests', () => {
  it('handles MUI and non-MUI warnings', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    console.warn('MUI: suppressed');
    console.warn('Non-MUI warning');

    expect(warnSpy).toHaveBeenCalledTimes(2);
    warnSpy.mockRestore();
  });

  it('keeps console.log callable', () => {
    expect(() => {
      console.log('message');
    }).not.toThrow();
  });
});
