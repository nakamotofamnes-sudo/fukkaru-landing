/**
 * HP制作の記事（/web/ の下）をページにする（2026-11-15〜）。build-blog.mjs から呼ぶ。
 *
 * - content/web/*.json（scripts/web/web_kiji.py が毎日1本書く）→ dist/web/<slug>.html
 *   見た目は1本目の手作りの記事（public/web/benriya-homepage.html）と同じ。CSS もそこから写す
 * - 記事の一覧 → dist/web/index.html（/web/）。手で作った記事（public/web/*.html）も一緒に並べる
 * - dist/web.html の足元（<!-- web-kiji:start --> 〜 end）に、一覧と新しい記事を入れる
 * - サイトマップの行は webSitemapEntries() で返す（build-blog.mjs の buildSitemap が使う）
 *
 * 相談の案内（記事の最後）は、AIに書かせず、ここで決まった文を付ける（料金・納期の約束をさせないため）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT, 'content', 'web');
const PUBLIC_WEB = path.join(ROOT, 'public', 'web');
const DIST_DIR = path.join(ROOT, 'dist');
const SITE_URL = 'https://fukkaru.creo-sumai.jp';
const MAIL = 'nakamoto.famnes@gmail.com';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// **太字** だけ通す（ほかの記号はそのまま文字として出す）
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const wareki = (d) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || '');
  return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : '';
};

/** content/web の記事を読む。形が崩れていればビルドを止める（壊れたページを出さない） */
export function readWebArticles() {
  if (!fs.existsSync(WEB_DIR)) return [];
  const out = [];
  for (const f of fs.readdirSync(WEB_DIR).filter((x) => x.endsWith('.json')).sort()) {
    const a = JSON.parse(fs.readFileSync(path.join(WEB_DIR, f), 'utf8'));
    if (!/^[a-z0-9-]+$/.test(a.slug || '') || !a.title || !a.description || !Array.isArray(a.sections)) {
      throw new Error(`[build-web] 形が足りません：${f}（slug/title/description/sections が必要）`);
    }
    if (fs.existsSync(path.join(PUBLIC_WEB, `${a.slug}.html`))) {
      throw new Error(`[build-web] 手作りのページと住所がぶつかります：${a.slug}`);
    }
    out.push(a);
  }
  return out;
}

/** 手で作った記事（public/web/*.html のうち、記事の印 "@type":"Article" があるもの） */
function readHandmade() {
  if (!fs.existsSync(PUBLIC_WEB)) return [];
  const out = [];
  for (const f of fs.readdirSync(PUBLIC_WEB).filter((x) => x.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(PUBLIC_WEB, f), 'utf8');
    const ld = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html);
    if (!ld) continue;
    let d;
    try { d = JSON.parse(ld[1]); } catch { continue; }
    if (d['@type'] !== 'Article') continue;
    const desc = /<meta name="description" content="([^"]*)"/.exec(html);
    const eyebrow = /<p class="eyebrow">([^<]*)<\/p>/.exec(html);
    out.push({
      slug: f.replace(/\.html$/, ''), title: d.headline, description: desc ? desc[1] : '',
      eyebrow: eyebrow ? eyebrow[1] : '', publishDate: d.datePublished, updatedDate: d.dateModified, handmade: true,
    });
  }
  return out;
}

function allEntries() {
  return [...readHandmade(), ...readWebArticles()]
    .sort((a, b) => ((a.publishDate || '') < (b.publishDate || '') ? 1 : -1));
}

/** 1本目の記事の <style> をそのまま使う（見た目を1か所で決める） */
function articleCss() {
  const html = fs.readFileSync(path.join(PUBLIC_WEB, 'benriya-homepage.html'), 'utf8');
  const m = /<style>([\s\S]*?)<\/style>/.exec(html);
  return (m ? m[1] : '') + `
    .related{margin-top:56px}
    .related h2{margin-top:0}
    .related ul{list-style:none;padding:0}
    .related li{padding:12px 0;border-bottom:1px solid var(--line);margin:0}
    .related small{display:block;color:var(--muted);font-size:13px}
    .index-list{list-style:none;padding:0;margin:0}
    .index-list li{background:var(--white);border:1px solid var(--line);border-radius:6px;padding:20px 24px;margin:0 0 16px}
    .index-list a{font-weight:800;font-size:18px;line-height:1.6;text-decoration:none}
    .index-list p{margin:8px 0 0;font-size:15px;color:var(--muted)}
    .index-list .eyebrow{margin:0 0 4px}`;
}

const pageUrl = (slug) => `${SITE_URL}/web/${slug}.html`;
const h1Html = (title) => esc(title).split(/[｜|]/).map((s) => s.trim()).filter(Boolean).join('。<br>');

function head({ title, description, canonical, ogType, css, ld }) {
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}｜フッ軽合同会社</title>
  <meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="#f5f1e9">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE_URL}/web/share.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
  <style>${css}</style>
</head>
<body>
  <header class="header">
    <a class="brand" href="/hp-seisaku">フッ軽<small>小さな会社の、Webづくり。</small></a>
    <a class="cta" href="#contact">相談する</a>
  </header>
`;
}

// 2026-11-23 中元さん「記事の自動化は他県で売っていきたい。田舎の方でいい」→ 全国の業種向けの記事から /autoblog へつなぐ。
// 数字はフッ軽のブログのサーチコンソール（/autoblog のグラフと同じ。2026-11-21 に取った）。数字を変えるときは両方そろえる
const AUTOBLOG = `
    <section class="contact" aria-labelledby="autoblog-title" style="margin-bottom:24px">
      <h2 id="autoblog-title">ホームページはあるのに、問い合わせが来ない方へ</h2>
      <p>ホームページは、作ったあと記事が増えないと、検索に出てきません。フッ軽では、御社の仕事の記事を、AIで毎日1本書いてホームページに足していく仕組みを作っています。</p>
      <p>同じ仕組みで書いている富士市の便利屋のブログは、8月末には検索結果に出ていませんでしたが、11月には週に800回前後、検索結果に出るようになりました。全国どこの会社でも、メールとオンラインでお手伝いできます。</p>
      <a class="button" href="/autoblog">ブログ記事の自動化を見る</a>
    </section>`;

const CONTACT = AUTOBLOG + `
    <section class="contact" id="contact" aria-labelledby="contact-title">
      <h2 id="contact-title">作る時間がない方へ</h2>
      <p>「文章を考える時間がない」「何を載せればいいか、一緒に考えてほしい」。そんな小さな商売をしている方のホームページづくりを、お手伝いしています。全国どこからでも、メールでご相談いただけます。</p>
      <p>普段お客様に説明していることを伺い、載せることの整理から一緒に進めます。費用は、必要なページを決めてからお見積もりします。</p>
      <a class="button" href="mailto:${MAIL}?subject=${encodeURIComponent('ホームページの相談')}">メールで相談する ↗</a>
      <p style="margin-top:16px"><a href="/hp-seisaku">ホームページ制作のページを見る</a></p>
      <p style="margin-top:8px"><a href="/autoblog">ブログ記事を毎日1本、AIで書く仕組みも作れます（年内のお申し込みは初期費用が半額）</a></p>
    </section>`;

const FOOTER = `
  <footer>
    <a href="/web/">ホームページづくりの記事</a><a href="/hp-seisaku">ホームページ制作</a><a href="/autoblog">ブログ記事の自動化</a><a href="/profile">代表のプロフィール</a><a href="/">フッ軽のホームページ</a>
  </footer>
</body>
</html>
`;

function renderBlock(b) {
  if (b.type === 'h3') return `      <h3>${inline(b.text)}</h3>`;
  if (b.type === 'note') return `      <div class="note">\n        <p>${inline(b.text)}</p>\n      </div>`;
  if (b.type === 'ul' || b.type === 'ol') {
    return `      <${b.type}>\n${b.items.map((x) => `        <li>${inline(x)}</li>`).join('\n')}\n      </${b.type}>`;
  }
  return `      <p>${inline(b.text)}</p>`;
}

function renderArticle(a, entries, css) {
  const url = pageUrl(a.slug);
  const ld = {
    '@context': 'https://schema.org', '@type': 'Article', headline: a.title,
    datePublished: a.publishDate, dateModified: a.updatedDate || a.publishDate,
    author: { '@type': 'Person', name: '中元晋平', url: `${SITE_URL}/profile` },
    publisher: { '@type': 'Organization', name: 'フッ軽合同会社', url: `${SITE_URL}/` },
    mainEntityOfPage: url, image: `${SITE_URL}/web/share.jpg`,
  };
  const toc = a.sections.map((s) => `          <li><a href="#${esc(s.id)}">${esc(s.h2)}</a></li>`).join('\n');
  const body = a.sections.map((s) => `      <h2 id="${esc(s.id)}">${esc(s.h2)}</h2>\n${s.blocks.map(renderBlock).join('\n')}`).join('\n\n');
  const others = entries.filter((e) => e.slug !== a.slug).slice(0, 5);
  const related = others.length ? `
    <section class="related" aria-labelledby="related-title">
      <h2 id="related-title">ホームページづくりの、ほかの記事</h2>
      <ul>
${others.map((e) => `        <li><a href="/web/${esc(e.slug)}.html">${esc(e.title)}</a><small>${esc(e.eyebrow)}</small></li>`).join('\n')}
      </ul>
      <p><a href="/web/">記事の一覧を見る</a></p>
    </section>` : '';
  return head({ title: a.title, description: a.description, canonical: url, ogType: 'article', css, ld }) + `
  <main>
    <article>
      <p class="eyebrow">${esc(a.eyebrow)}</p>
      <h1>${h1Html(a.title)}</h1>
      <p class="byline">書いた人：<a href="/profile">中元晋平</a>（フッ軽合同会社 代表・静岡県富士市で便利屋を営んでいます）／${wareki(a.publishDate)}</p>

${(a.lead || []).map((p) => `      <p>${inline(p)}</p>`).join('\n')}

      <nav class="toc" aria-label="目次">
        <p>この記事の中身</p>
        <ol>
${toc}
          <li><a href="#contact">作る時間がない方へ</a></li>
        </ol>
      </nav>

${body}
    </article>
${CONTACT}
${related}
  </main>
${FOOTER}`;
}

function renderIndex(entries, css) {
  const url = `${SITE_URL}/web/`;
  const ld = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'ホームページづくりの記事', url };
  const desc = '小さなお店・職人・個人事業主の方へ。静岡県富士市で便利屋を営みながら、自社のホームページを自分で作っている代表が、ホームページづくりで分かったことを書いています。';
  return head({ title: 'ホームページづくりの記事', description: desc, canonical: url, ogType: 'website', css, ld }) + `
  <main>
    <p class="eyebrow">小さな商売をしている方へ</p>
    <h1>ホームページづくりの記事</h1>
    <p>${esc(desc)}</p>
    <ul class="index-list">
${entries.map((e) => `      <li><p class="eyebrow">${esc(e.eyebrow)}</p><a href="/web/${esc(e.slug)}.html">${esc(e.title)}</a><p>${esc(e.description)}</p></li>`).join('\n')}
    </ul>
${CONTACT}
  </main>
${FOOTER}`;
}

/** web.html の足元に、一覧と新しい記事3本を入れる */
function injectWebHtml(entries) {
  const p = path.join(DIST_DIR, 'web.html');
  if (!fs.existsSync(p)) return false;
  const html = fs.readFileSync(p, 'utf8');
  const re = /<!-- web-kiji:start -->[\s\S]*?<!-- web-kiji:end -->/;
  if (!re.test(html)) return false;
  const links = [`<a href="/web/">ホームページづくりの記事</a>`,
    ...entries.slice(0, 3).map((e) => `<a href="/web/${esc(e.slug)}.html">${esc(e.title.split(/[｜|]/)[0])}</a>`)].join('');
  fs.writeFileSync(p, html.replace(re, `<!-- web-kiji:start -->${links}<!-- web-kiji:end -->`), 'utf8');
  return true;
}

/** サイトマップの行（手作りの記事も含む） */
export function webSitemapEntries() {
  const entries = allEntries();
  const saishin = entries.map((e) => e.updatedDate || e.publishDate).filter(Boolean).sort().pop();
  return [
    { loc: `${SITE_URL}/web/`, priority: '0.6', lastmod: saishin },
    ...entries.map((e) => ({ loc: pageUrl(e.slug), priority: '0.6', lastmod: e.updatedDate || e.publishDate })),
  ];
}

export function buildWeb() {
  const css = articleCss();
  const entries = allEntries();
  const outDir = path.join(DIST_DIR, 'web');
  fs.mkdirSync(outDir, { recursive: true });
  for (const a of entries.filter((e) => !e.handmade)) {
    fs.writeFileSync(path.join(outDir, `${a.slug}.html`), renderArticle(a, entries, css), 'utf8');
    console.log(`[build-web] 生成: /web/${a.slug}.html`);
  }
  fs.writeFileSync(path.join(outDir, 'index.html'), renderIndex(entries, css), 'utf8');
  const ok = injectWebHtml(entries);
  console.log(`[build-web] 完了: HP制作の記事 ${entries.length}本（手作り含む）+ 一覧 /web/` + (ok ? ' + web.html の足元' : ' ／ ★web.html の足元に入れられませんでした'));
}
