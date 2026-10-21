// 本番に出す前に dist/blog の写真を縮める（npm run build の最後に動く）。
// 自動投稿の記事の写真は大きいまま public/blog に入るので、ここでまとめて縮める。
// 元の public/blog は変えない。ファイル名・縦横の大きさも変えない（幅1200pxを超えるものだけ縮める）。
// 15%以上小さくならない写真は、そのまま残す。
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const dir = 'dist/blog';
let before = 0, after = 0, count = 0;
for (const name of await readdir(dir)) {
  if (!/\.jpe?g$/i.test(name)) continue;
  const file = join(dir, name);
  const src = await readFile(file);
  try {
    const out = await sharp(src)
      .rotate() // 写真の向きの情報を反映してから保存する
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 78, progressive: true, mozjpeg: true })
      .toBuffer();
    if (out.length < src.length * 0.85) {
      await writeFile(file, out);
      before += src.length; after += out.length; count++;
    }
  } catch (e) {
    console.warn(`[shrink-images] とばしました: ${name}（${e.message}）`);
  }
}
console.log(`[shrink-images] ${count}枚を縮めました: ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB`);
