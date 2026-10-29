// トップ（dist/index.html）の空の <div id="root"> に、前もって組み立てた中身を入れる。
// 画面では今までどおり React が組み立て直すので、見た目は変わらない。
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = resolve(root, 'dist/index.html');
const serverDir = resolve(root, 'dist-ssr');
const { render } = await import(pathToFileURL(resolve(serverDir, 'entry-server.js')).href);
const body = render();
const html = readFileSync(htmlPath, 'utf8');
const re = /(<div id="root"[^>]*>)(<\/div>)/;
if (!re.test(html)) throw new Error('dist/index.html に空の root が見つかりません');
writeFileSync(htmlPath, html.replace(re, (_, a, b) => a + body + b));
rmSync(serverDir, { recursive: true, force: true });
console.log(`トップに中身を書き出しました（${body.length} 字）`);
