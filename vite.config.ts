import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// トップの「ブログ」欄で見せる最新3本だけを、ビルド時に取り出して渡す。
// 以前は全記事のJSON（本文ごと・約1.2MB）がトップのJSに丸ごと入っていて、
// スマホで最初の表示が遅くなっていた。
const TEASER_ID = 'virtual:blog-teaser';
function blogTeaser(): Plugin {
  const dir = resolve(__dirname, 'content/articles');
  return {
    name: 'blog-teaser',
    resolveId(id) {
      return id === TEASER_ID ? '\0' + TEASER_ID : null;
    },
    load(id) {
      if (id !== '\0' + TEASER_ID) return null;
      const list = readdirSync(dir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => {
          this.addWatchFile(resolve(dir, f));
          try {
            return JSON.parse(readFileSync(resolve(dir, f), 'utf8'));
          } catch {
            return null;
          }
        })
        .filter((a) => a && a.slug && a.title)
        .sort((a, b) => String(b.publishDate ?? '').localeCompare(String(a.publishDate ?? '')))
        .slice(0, 3)
        .map(({ slug, title, metaDescription, category, publishDate }) => ({
          slug, title, metaDescription, category, publishDate,
        }));
      return `export default ${JSON.stringify(list)};`;
    },
  };
}

export default defineConfig({
  plugins: [react(), blogTeaser()],
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
