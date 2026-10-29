// 記事のページに置く「中元さんのキャラ」を、HP用の軽い絵（WebP）にする（2026-10-29）。
// 元の絵は動画で使っている切り抜き（~/.fukkaru/douga/pr/kyara/sprite/）。
// **どの姿も同じ割合で縮める。**切り抜きは同じ縮尺でそろえてあるので、
// しゃがむ姿は小さく、立つ姿は大きく、動画と同じ大きさの関係のまま出る。
// 出来たものは public/blog/kyara/ に置き、大きさは content/kyara.json に書く（画面がガタッと動かないように）。
// 本番のビルドでは動かさない。絵を足すときだけ手で動かす：node scripts/make-kyara.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const SRC = join(homedir(), '.fukkaru/douga/pr/kyara/sprite');
const OUT = 'public/blog/kyara';
const NAMES = [
  'waving', 'greet', 'mitsumori', 'point', 'kusakari', 'senjo', 'hikkoshi', 'hirou',
  'repair', 'impact', 'kougu', 'bin', 'walk', 'front', 'atama_kaku',
];
// 大きい版は見出し用（画面では半分の大きさで出す＝細かい画面でもぼやけない）。小さい版は一覧の札用
const SIZES = { '': 0.56, s: 0.22 };

await mkdir(join(OUT, 's'), { recursive: true });
const size = {};
for (const name of NAMES) {
  const trimmed = await sharp(join(SRC, `${name}.png`)).trim().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = trimmed.info;
  size[name] = {};
  for (const [dir, k] of Object.entries(SIZES)) {
    const W = Math.round(w * k);
    const H = Math.round(h * k);
    const buf = await sharp(trimmed.data)
      .resize({ width: W, height: H })
      .webp({ quality: 82, alphaQuality: 90, effort: 6 })
      .toBuffer();
    await writeFile(join(OUT, dir, `${name}.webp`), buf);
    size[name][dir || 'l'] = [W, H];
    console.log(`${dir || 'l'}/${name}.webp ${W}x${H} ${Math.round(buf.length / 1024)}KB`);
  }
}
await writeFile('content/kyara.json', JSON.stringify(size, null, 1) + '\n');

// ヘッダーのロゴ（トップページのヘッダーと同じ絵）。画面では28pxで出すので、倍の56pxで作る
const logo = await sharp(join(homedir(), '.fukkaru/douga/sozai/fukkaru/icon.png'))
  .resize({ width: 56, height: 56 })
  .webp({ quality: 88 })
  .toBuffer();
await writeFile(join(OUT, 'logo.webp'), logo);
console.log(`logo.webp 56x56 ${Math.round(logo.length / 1024)}KB`);
