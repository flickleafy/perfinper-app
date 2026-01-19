const axios = require('axios');

jest.mock('axios', () => ({
  create: jest.fn(() => ({ marker: 'client' })),
}));

describe('http-common', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('creates an axios client with base URL and headers', () => {
    const axios = require('axios');
    const client = require('./http-common').default;

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:3001/',
      headers: {
        'Content-type': 'application/json',
      },
    });
    expect(client).toEqual({ marker: 'client' });
  });
});
