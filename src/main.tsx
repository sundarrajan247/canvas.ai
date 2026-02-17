import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './router';
import './styles/tailwind.css';

document.body.dataset.theme = localStorage.getItem('canvas-theme') ?? 'dark';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
