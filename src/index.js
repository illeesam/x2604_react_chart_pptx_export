import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// 엔트리 포인트 — 전역 스타일 주입 후 #root에 앱 마운트
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

const root = createRoot(document.getElementById('root')); // React 루트
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
