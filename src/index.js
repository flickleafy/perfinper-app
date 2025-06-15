import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.js';
import * as serviceWorker from './serviceWorker.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

serviceWorker.unregister();
