/**
 * 엔트리 — 전역 스타일 로드 후 `#root`에 React 마운트
 */
import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
