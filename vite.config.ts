import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // './' に設定することで、現在地を基準にファイルを読み込みます。
  // これにより /sumasapo/ などのサブディレクトリでも確実に動作します。
  base: './',
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  }
});