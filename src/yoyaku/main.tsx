// 見積もりの予約（/yoyaku/）の入口。トップ（src/main.tsx）とは別のページ（2026-11-19）
import React from 'react';
import ReactDOM from 'react-dom/client';
import Yoyaku from './Yoyaku';
import '../index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Yoyaku />
  </React.StrictMode>,
);
