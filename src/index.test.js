const React = require('react');

const mockRender = jest.fn();
const mockCreateRoot = jest.fn();

jest.mock('react-dom/client', () => ({
  __esModule: true,
  createRoot: mockCreateRoot,
  default: { createRoot: mockCreateRoot },
}));

jest.mock('./App.js', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: jest.fn(() => React.createElement('div', { id: 'app' })),
  };
});

jest.mock('./ui/ToastProvider.js', () => {
  const React = require('react');
  return {
    ToastProvider: jest.fn(({ children }) => React.createElement('div', { id: 'toast' }, children)),
  };
});

jest.mock('./serviceWorker.js', () => ({
  unregister: jest.fn(),
}));

describe('index', () => {
  beforeEach(() => {
    jest.resetModules();
    mockRender.mockClear();
    mockCreateRoot.mockClear();
    mockCreateRoot.mockImplementation(() => ({ render: mockRender }));
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('renders App within ToastProvider and unregisters service worker', () => {
    const { ToastProvider } = require('./ui/ToastProvider.js');
    const App = require('./App.js').default;
    const serviceWorker = require('./serviceWorker.js');

    require('./index.js');

    expect(mockCreateRoot).toHaveBeenCalledWith(document.getElementById('root'));
    expect(mockRender).toHaveBeenCalledTimes(1);

    const renderedElement = mockRender.mock.calls[0][0];
    expect(renderedElement.type).toBe(ToastProvider);
    expect(renderedElement.props.children.type).toBe(App);

    expect(serviceWorker.unregister).toHaveBeenCalled();
  });
});
