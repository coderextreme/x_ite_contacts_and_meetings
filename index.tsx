import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Scene from './components/Scene';

const rootElement = document.getElementById('root');
const x3dContainer = document.getElementById('x3d-container');

if (!rootElement || !x3dContainer) {
  throw new Error("Could not find root elements to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const x3dRoot = ReactDOM.createRoot(x3dContainer);
x3dRoot.render(
  <React.StrictMode>
    <Scene />
  </React.StrictMode>
);
