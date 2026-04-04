import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// 스피너 keyframe 전역 CSS 삽입
const style = document.createElement('style');
style.innerHTML = `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Segoe UI', 'Malgun Gothic', sans-serif; }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
