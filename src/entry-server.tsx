// ビルドのときに、トップの中身を前もってHTMLに書き出すための入口。
// AI（ChatGPT・Perplexity など）は画面を組み立てる仕組みを動かさずに読むことが多いため。
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App.tsx';

export function render(): string {
  return renderToString(<App />);
}
