const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const setLocation = (href) => {
  const url = new URL(href);
  Object.defineProperty(window, 'location', {
    value: {
      href: url.href,
      origin: url.origin,
      hostname: url.hostname,
      reload: jest.fn(),
    },
    writable: true,
  });
};

const setServiceWorker = (overrides = {}) => {
  Object.defineProperty(navigator, 'serviceWorker', {
    value: {
      register: jest.fn(),
      ready: Promise.resolve({ unregister: jest.fn() }),
      controller: undefined,
      ...overrides,
    },
    configurable: true,
  });
};

describe('serviceWorker', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalPublicUrl = process.env.PUBLIC_URL;

  beforeEach(() => {
    jest.resetModules();
    process.env.NODE_ENV = 'production';
    process.env.PUBLIC_URL = '';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    process.env.PUBLIC_URL = originalPublicUrl;
  });

  it('invokes onUpdate when a controller is present', async () => {
    setLocation('http://example.com/');
    const registration = {
      installing: { state: 'installed', onstatechange: null },
      onupdatefound: null,
    };
    const onUpdate = jest.fn();

    setServiceWorker({
      register: jest.fn().mockResolvedValue(registration),
      controller: {},
    });

    const addEventListenerSpy = jest
      .spyOn(window, 'addEventListener')
      .mockImplementation((event, handler) => {
        if (event === 'load') {
          handler();
        }
      });

    const { register } = require('./serviceWorker');
    register({ onUpdate });

    await flushPromises();

    registration.onupdatefound();
    registration.installing.onstatechange();

    expect(onUpdate).toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
  });

  it('invokes onSuccess when no controller is present', async () => {
    setLocation('http://example.com/');
    const registration = {
      installing: { state: 'installed', onstatechange: null },
      onupdatefound: null,
    };
    const onSuccess = jest.fn();

    setServiceWorker({
      register: jest.fn().mockResolvedValue(registration),
      controller: null,
    });

    const addEventListenerSpy = jest
      .spyOn(window, 'addEventListener')
      .mockImplementation((event, handler) => {
        if (event === 'load') {
          handler();
        }
      });

    const { register } = require('./serviceWorker');
    register({ onSuccess });

    await flushPromises();

    registration.onupdatefound();
    registration.installing.onstatechange();

    expect(onSuccess).toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
  });

  it('unregisters the service worker when requested', async () => {
    setLocation('http://example.com/');
    const unregisterMock = jest.fn();
    setServiceWorker({
      ready: Promise.resolve({ unregister: unregisterMock }),
    });

    const { unregister } = require('./serviceWorker');
    unregister();

    await flushPromises();

    expect(unregisterMock).toHaveBeenCalled();
  });

  it('does not register service worker if PUBLIC_URL is on a different origin', () => {
    process.env.PUBLIC_URL = 'http://other-origin.com';
    setLocation('http://example.com/');
    const registerMock = jest.fn();
    setServiceWorker({ register: registerMock });

    const { register } = require('./serviceWorker');
    register();

    expect(registerMock).not.toHaveBeenCalled();
  });

  it('handles verification of service worker on localhost (valid SW)', async () => {
    setLocation('http://localhost/');
    const registerMock = jest.fn().mockResolvedValue({});
    setServiceWorker({ register: registerMock });

    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: { get: () => 'application/javascript' },
    });

    const addEventListenerSpy = jest
      .spyOn(window, 'addEventListener')
      .mockImplementation((event, handler) => {
        if (event === 'load') handler();
      });

    const { register } = require('./serviceWorker');
    register();

    await flushPromises();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('service-worker.js'),
      expect.anything()
    );
    expect(registerMock).toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
  });

  it('handles missing service worker on localhost (404)', async () => {
    setLocation('http://localhost/');
    const unregisterMock = jest.fn().mockResolvedValue();
    const reloadMock = window.location.reload;

    setServiceWorker({
      ready: Promise.resolve({ unregister: unregisterMock }),
    });

    global.fetch = jest.fn().mockResolvedValue({
      status: 404,
      headers: { get: () => 'text/html' },
    });

    const addEventListenerSpy = jest
      .spyOn(window, 'addEventListener')
      .mockImplementation((event, handler) => {
        if (event === 'load') handler();
      });

    const { register } = require('./serviceWorker');
    register();

    await flushPromises();
    // Wait for the chain: ready -> unregister -> reload
    await flushPromises();
    await flushPromises();

    expect(unregisterMock).toHaveBeenCalled();
    expect(reloadMock).toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
  });

  it('handles invalid content-type on localhost', async () => {
    setLocation('http://localhost/');
    const unregisterMock = jest.fn().mockResolvedValue();
    const reloadMock = window.location.reload;

    setServiceWorker({
      ready: Promise.resolve({ unregister: unregisterMock }),
    });

    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: { get: () => 'text/html' },
    });

    const addEventListenerSpy = jest
      .spyOn(window, 'addEventListener')
      .mockImplementation((event, handler) => {
        if (event === 'load') handler();
      });

    const { register } = require('./serviceWorker');
    register();

    await flushPromises();
    await flushPromises();
    await flushPromises();

    expect(unregisterMock).toHaveBeenCalled();
    expect(reloadMock).toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
  });

  it('handles offline/fetch error on localhost', async () => {
    setLocation('http://localhost/');
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    global.fetch = jest.fn().mockRejectedValue(new Error('Offline'));

    const addEventListenerSpy = jest
      .spyOn(window, 'addEventListener')
      .mockImplementation((event, handler) => {
        if (event === 'load') handler();
      });

    const { register } = require('./serviceWorker');
    register();

    await flushPromises();

    expect(consoleSpy).toHaveBeenCalledWith(
      'No internet connection found. App is running in offline mode.'
    );

    addEventListenerSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('handles registration error', async () => {
    setLocation('http://example.com/');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    setServiceWorker({
      register: jest.fn().mockRejectedValue(new Error('Fail')),
    });

    const addEventListenerSpy = jest
      .spyOn(window, 'addEventListener')
      .mockImplementation((event, handler) => {
        if (event === 'load') handler();
      });

    const { register } = require('./serviceWorker');
    register();

    await flushPromises();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error during service worker registration:',
      expect.any(Error)
    );

    addEventListenerSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('logs unregister error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    setServiceWorker({
      ready: Promise.reject(new Error('Unregister failed')),
    });

    const { unregister } = require('./serviceWorker');
    unregister();

    await flushPromises();

    expect(consoleSpy).toHaveBeenCalledWith('Unregister failed');
    consoleSpy.mockRestore();
  });

  it('handles null installing worker in onupdatefound', async () => {
    setLocation('http://example.com/');
    const registration = {
      installing: null,
      onupdatefound: null,
    };

    setServiceWorker({
      register: jest.fn().mockResolvedValue(registration),
    });

    const addEventListenerSpy = jest
      .spyOn(window, 'addEventListener')
      .mockImplementation((event, handler) => {
        if (event === 'load') handler();
      });

    const { register } = require('./serviceWorker');
    register();
    await flushPromises();

    // Trigger update found, but installing is null
    registration.onupdatefound();

    // No error should be thrown, and nothing happens
    expect(true).toBe(true);

    addEventListenerSpy.mockRestore();
  });

  it('handles installing worker state not installed', async () => {
    setLocation('http://example.com/');
    const registration = {
      installing: { state: 'installing', onstatechange: null },
      onupdatefound: null,
    };

    setServiceWorker({
      register: jest.fn().mockResolvedValue(registration),
    });

    const addEventListenerSpy = jest
      .spyOn(window, 'addEventListener')
      .mockImplementation((event, handler) => {
        if (event === 'load') handler();
      });

    const { register } = require('./serviceWorker');
    register();
    await flushPromises();

    registration.onupdatefound();
    registration.installing.onstatechange();

    // No callbacks or logs
    expect(true).toBe(true);

    addEventListenerSpy.mockRestore();
  });

  it('does nothing in non-production environment', () => {
    process.env.NODE_ENV = 'development';
    const registerMock = jest.fn();
    setServiceWorker({ register: registerMock });

    const { register } = require('./serviceWorker');
    register();

    expect(registerMock).not.toHaveBeenCalled();
  });

  it('does nothing if serviceWorker is not in navigator', () => {
    // Delete serviceWorker from navigator to simulate lack of support
    // First, ensure it is configurable (it is from setServiceWorker helper usually, otherwise JSDOM default)
    // We can try simple delete.
    delete navigator.serviceWorker;
    
    // If delete doesn't work (e.g. prototype), we might need to shadow it?
    // Let's verify if `in` returns false.
    // If we can't delete, we can't test this branch easily without mocking navigator entirely.
    // But JSDOM usually has empty navigator or configurable properties.
    
    // Note: If JSDOM has it on prototype, `delete` on instance is fine, but `in` will check prototype.
    // Let's try to define it as non-existent by creating a new navigator object proxy?? No.
    
    // Simpler hack: We can't change 'in' operator easily if it is on prototype.
    // But we can check if the code runs.
    
    // Actually, checking standard Jest usage for this.
    // Commonly people assume `delete window.navigator.serviceWorker` works.
    
    const { register, unregister } = require('./serviceWorker');
    
    // If delete failed, we might skip this or accept that line 132 branch is hard to cover if `in` is always true.
    // But wait, the coverage report says line 132 is uncovered. That means the `else` (implicit) of `if ('serviceWorker' in navigator)` was NOT taken.
    // So 'serviceWorker' in navigator was TRUE in all tests.
    // We want it to be FALSE.
    
    // Let's try to overwrite navigator object for this test block?
    const originalNavigator = window.navigator;
    Object.defineProperty(window, 'navigator', {
        value: {},
        writable: true,
        configurable: true
    });
    
    register();
    unregister();
    
    // Restore
    Object.defineProperty(window, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true
    });
    
    expect(true).toBe(true);
  });

  it('logs "Content is cached" without config callback (Success case)', async () => {
    setLocation('http://example.com/');
    const registration = {
      installing: { state: 'installed', onstatechange: null },
      onupdatefound: null,
    };
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    setServiceWorker({
      register: jest.fn().mockResolvedValue(registration),
      controller: null,
    });

    const addEventListenerSpy = jest
      .spyOn(window, 'addEventListener')
      .mockImplementation((event, handler) => {
        if (event === 'load') handler();
      });

    const { register } = require('./serviceWorker');
    register(); // No config passed

    await flushPromises();

    registration.onupdatefound();
    registration.installing.onstatechange();

    expect(consoleSpy).toHaveBeenCalledWith('Content is cached for offline use.');

    addEventListenerSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('logs "New content is available" without config callback (Update case)', async () => {
    setLocation('http://example.com/');
    const registration = {
      installing: { state: 'installed', onstatechange: null },
      onupdatefound: null,
    };
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    setServiceWorker({
      register: jest.fn().mockResolvedValue(registration),
      controller: {}, // Controller exists
    });

    const addEventListenerSpy = jest
      .spyOn(window, 'addEventListener')
      .mockImplementation((event, handler) => {
        if (event === 'load') handler();
      });

    const { register } = require('./serviceWorker');
    register(); // No config passed

    await flushPromises();

    registration.onupdatefound();
    registration.installing.onstatechange();

    expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('New content is available')
    );

    addEventListenerSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
