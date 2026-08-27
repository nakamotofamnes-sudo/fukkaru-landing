// フッ軽ブログ 静的ページ生成スクリプト
// content/articles/*.json を読み、dist/blog/<slug>/index.html を書き出す。
// 既存のReactアプリ(dist/index.html等)には一切触れない。
// 実行タイミング: `vite build` の後 (package.json の build スクリプトから呼ばれる)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ARTICLES_DIR = path.join(ROOT, 'content', 'articles');
const DIST_DIR = path.join(ROOT, 'dist');
const BLOG_OUT_DIR = path.join(DIST_DIR, 'blog');
const SITE_URL = 'https://fukkaru.creo-sumai.jp';
const SITE_NAME = 'フッ軽（ふっかる）';
const LINE_URL = 'https://lin.ee/qXlO1gC';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// インライン強調記法だけ簡易対応: **太字** -> <strong>
function inline(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function renderBlock(block) {
  switch (block.type) {
    case 'lead':
      return `<p class="lead">${inline(block.text)}</p>`;
    case 'h2':
      return `<h2 id="${esc(block.id || '')}">${inline(block.text)}</h2>`;
    case 'h3':
      return `<h3>${inline(block.text)}</h3>`;
    case 'p':
      return `<p>${inline(block.text)}</p>`;
    case 'ul':
      return `<ul>${block.items.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>`;
    case 'ol':
      return `<ol>${block.items.map((i) => `<li>${inline(i)}</li>`).join('')}</ol>`;
    case 'table': {
      const head = `<tr>${block.headers.map((h) => `<th>${inline(h)}</th>`).join('')}</tr>`;
      const rows = block.rows
        .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
        .join('');
      return `<div class="table-wrap"><table>${head}${rows}</table></div>`;
    }
    case 'note':
      return `<div class="note"><strong>${inline(block.title || 'メモ')}</strong><p>${inline(block.text)}</p></div>`;
    case 'cta':
      return renderCta(block);
    case 'faq': {
      const items = block.items
        .map(
          (qa) => `<div class="faq-item"><p class="faq-q">Q. ${inline(qa.q)}</p><p class="faq-a">A. ${inline(qa.a)}</p></div>`
        )
        .join('');
      return `<div class="faq">${items}</div>`;
    }
    default:
      return '';
  }
}

function renderCta(block) {
  const heading = block?.heading || '見積もりは無料です。まずはお気軽にご相談ください。';
  const sub = block?.sub || '富士市・富士宮市・静岡県内、山梨県、神奈川県海老名市以西まで対応しています。';
  return `
  <div class="cta-box">
    <p class="cta-heading">${inline(heading)}</p>
    <p class="cta-sub">${inline(sub)}</p>
    <div class="cta-buttons">
      <a class="btn btn-line" href="${LINE_URL}" target="_blank" rel="noopener">公式LINEで相談する（登録＋成約で最大3,000円割引）</a>
      <a class="btn btn-outline" href="/#reservation">Web予約フォームへ</a>
    </div>
  </div>`;
}

function articleUrl(slug) {
  return `${SITE_URL}/blog/${slug}/`;
}

function jsonLd(article) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishDate,
    dateModified: article.updatedDate || article.publishDate,
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    mainEntityOfPage: articleUrl(article.slug),
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

const PAGE_CSS = `
:root{--blue:#1e3a8a;--orange:#f59e0b;--green:#06c755;--ink:#1f2937;--sub:#4b5563;--line:#e5e7eb;--bg:#fff}
*{box-sizing:border-box}
body{margin:0;font-family:"Noto Sans JP","Hiragino Kaku Gothic ProN","Hiragino Sans",Meiryo,sans-serif;color:var(--ink);background:#fafafa;line-height:1.9;-webkit-font-smoothing:antialiased}
img{max-width:100%;height:auto;border-radius:10px}
a{color:var(--blue)}
.wrap{max-width:760px;margin:0 auto;padding:0 20px}
header.site{background:#fff;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:10}
header.site .wrap{max-width:960px;display:flex;align-items:center;justify-content:space-between;padding:14px 20px}
.brand{font-weight:900;color:var(--blue);text-decoration:none;font-size:18px;letter-spacing:.02em}
.brand span{color:var(--orange)}
.backlink{font-size:13px;color:var(--sub);text-decoration:none}
.hero{background:linear-gradient(160deg,#1e3a8a,#2c4fa0);color:#fff;padding:44px 0 34px}
.hero .wrap{max-width:760px}
.hero .cat{display:inline-block;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.35);color:#fff;font-size:12px;font-weight:700;letter-spacing:.06em;padding:3px 12px;border-radius:20px;margin-bottom:14px}
.hero h1{font-size:clamp(22px,4.4vw,32px);line-height:1.5;margin:0 0 14px;font-weight:900}
.hero .meta{font-size:12.5px;color:#cfe0ff;letter-spacing:.03em}
main{background:#fff;padding:38px 0 10px}
main .wrap{font-size:16px}
.lead{font-size:17px;color:var(--sub);background:#f8fafc;border-left:4px solid var(--orange);padding:16px 18px;border-radius:4px;margin:0 0 30px}
h2{font-size:22px;font-weight:900;color:var(--blue);margin:42px 0 16px;padding-bottom:8px;border-bottom:3px solid #eef2ff;letter-spacing:.01em}
h3{font-size:18px;font-weight:800;color:var(--ink);margin:26px 0 12px}
p{margin:0 0 16px}
ul,ol{margin:0 0 18px;padding-left:1.4em}
li{margin:0 0 8px}
.table-wrap{overflow-x:auto;margin:0 0 20px}
table{border-collapse:collapse;width:100%;min-width:420px;font-size:14.5px}
th,td{border:1px solid var(--line);padding:10px 12px;text-align:left}
th{background:#f1f5f9;font-weight:700;color:var(--blue)}
.note{background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 16px;margin:0 0 24px}
.note strong{color:#b45309;display:block;margin-bottom:4px;font-size:14px}
.note p{margin:0;font-size:14.5px;color:#7c4a11}
.faq-item{border-bottom:1px solid var(--line);padding:14px 0}
.faq-q{font-weight:800;color:var(--blue);margin:0 0 6px}
.faq-a{margin:0;color:var(--sub)}
.cta-box{background:#eef4ff;border:1px solid #c7d9ff;border-radius:14px;padding:26px 22px;margin:36px 0;text-align:center}
.cta-heading{font-size:18px;font-weight:900;color:var(--blue);margin:0 0 6px}
.cta-sub{font-size:13.5px;color:var(--sub);margin:0 0 18px}
.cta-buttons{display:flex;flex-direction:column;gap:10px;max-width:420px;margin:0 auto}
.btn{display:block;padding:13px 18px;border-radius:8px;font-weight:800;text-decoration:none;font-size:14.5px}
.btn-line{background:var(--green);color:#fff}
.btn-outline{background:#fff;color:var(--blue);border:2px solid var(--blue)}
.article-footer{max-width:760px;margin:30px auto 0;padding:20px 20px 0;border-top:1px solid var(--line)}
.related{font-size:13px;color:var(--sub)}
footer.site{background:#0f172a;color:#94a3b8;padding:34px 0;margin-top:50px;font-size:12.5px}
footer.site .wrap{max-width:760px}
footer.site a{color:#cbd5e1}
.index-list{list-style:none;margin:0;padding:0}
.index-list li{border-bottom:1px solid var(--line);padding:20px 0}
.index-list a{text-decoration:none;color:var(--ink);display:block}
.index-list h2{border:0;margin:0 0 6px;font-size:18px;padding:0}
.index-list p{color:var(--sub);font-size:14px;margin:0}
.index-date{font-size:12px;color:#9ca3af}
@media(max-width:480px){.hero{padding:32px 0 24px}.wrap{padding:0 16px}}
`;

function pageShell({ title, description, canonical, ogType, extraHead, bodyHtml }) {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:site_name" content="${esc(SITE_NAME)}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta name="twitter:card" content="summary">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>${PAGE_CSS}</style>
${extraHead || ''}
</head>
<body>
<header class="site">
  <div class="wrap">
    <a class="brand" href="/">フッ軽<span>（ふっかる）</span></a>
    <a class="backlink" href="/">← トップページへ</a>
  </div>
</header>
${bodyHtml}
<footer class="site">
  <div class="wrap">
    <p>フッ軽合同会社（フッ軽／ふっかる）— 静岡県富士市の地域密着住まいレスキュー</p>
    <p>対応エリア：静岡県全域／山梨県全域／神奈川県海老名市以西</p>
    <p><a href="/">トップページ</a> ｜ <a href="/blog/">ブログ一覧</a> ｜ <a href="${LINE_URL}" target="_blank" rel="noopener">公式LINE</a></p>
  </div>
</footer>
</body>
</html>`;
}

function renderArticlePage(article) {
  const bodyBlocks = article.blocks.map(renderBlock).join('\n');
  const dateStr = article.publishDate;
  const bodyHtml = `
<div class="hero">
  <div class="wrap">
    <span class="cat">${esc(article.category || 'コラム')}</span>
    <h1>${esc(article.title)}</h1>
    <div class="meta">公開日: ${esc(dateStr)}${article.updatedDate && article.updatedDate !== dateStr ? ` ／ 更新日: ${esc(article.updatedDate)}` : ''}</div>
  </div>
</div>
<main>
  <div class="wrap">
    ${bodyBlocks}
  </div>
</main>
<div class="article-footer wrap">
  <p class="related"><a href="/blog/">← ブログ一覧へ戻る</a></p>
</div>`;
  return pageShell({
    title: `${article.title}｜${SITE_NAME}`,
    description: article.metaDescription,
    canonical: articleUrl(article.slug),
    ogType: 'article',
    extraHead: jsonLd(article),
    bodyHtml,
  });
}

function renderIndexPage(articles) {
  const items = articles
    .slice()
    .sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1))
    .map(
      (a) => `<li><a href="/blog/${esc(a.slug)}/">
        <span class="index-date">${esc(a.publishDate)}</span>
        <h2>${esc(a.title)}</h2>
        <p>${esc(a.metaDescription)}</p>
      </a></li>`
    )
    .join('\n');
  const bodyHtml = `
<div class="hero">
  <div class="wrap">
    <span class="cat">BLOG</span>
    <h1>フッ軽ブログ｜富士市の暮らしのお役立ち情報</h1>
    <div class="meta">家具組立・物置設置・お片付けなど、暮らしのプロが実例と費用相場を解説します</div>
  </div>
</div>
<main>
  <div class="wrap">
    <ul class="index-list">
      ${items || '<li>準備中です。</li>'}
    </ul>
  </div>
</main>`;
  return pageShell({
    title: `ブログ一覧｜${SITE_NAME}`,
    description: '富士市の便利屋フッ軽が、家具組立・物置設置・お片付けなど暮らしのお役立ち情報を実例と費用相場つきで解説するブログです。',
    canonical: `${SITE_URL}/blog/`,
    ogType: 'website',
    bodyHtml,
  });
}

function buildSitemap(articles) {
  const urls = [
    { loc: `${SITE_URL}/`, priority: '1.0' },
    { loc: `${SITE_URL}/blog/`, priority: '0.8' },
    ...articles.map((a) => ({ loc: articleUrl(a.slug), priority: '0.7', lastmod: a.updatedDate || a.publishDate })),
  ];
  const body = urls
    .map(
      (u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${esc(u.lastmod)}</lastmod>` : ''}<priority>${u.priority}</priority></url>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('[build-blog] dist/ が見つかりません。先に `vite build` を実行してください。');
    process.exit(1);
  }
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.log('[build-blog] content/articles が無いため、記事なしで index/sitemap のみ生成します。');
  }
  const files = fs.existsSync(ARTICLES_DIR)
    ? fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.json'))
    : [];

  const articles = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8');
    let a;
    try {
      a = JSON.parse(raw);
    } catch (e) {
      console.error(`[build-blog] JSON解析エラー: ${f}`, e.message);
      process.exit(1);
    }
    if (!a.slug || !a.title || !a.metaDescription || !Array.isArray(a.blocks)) {
      console.error(`[build-blog] 必須フィールド不足: ${f}（slug/title/metaDescription/blocksが必要）`);
      process.exit(1);
    }
    articles.push(a);
  }

  fs.mkdirSync(BLOG_OUT_DIR, { recursive: true });

  for (const a of articles) {
    const outDir = path.join(BLOG_OUT_DIR, a.slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), renderArticlePage(a), 'utf8');
    console.log(`[build-blog] 生成: /blog/${a.slug}/`);
  }

  fs.writeFileSync(path.join(BLOG_OUT_DIR, 'index.html'), renderIndexPage(articles), 'utf8');

  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, buildSitemap(articles), 'utf8');

  const robotsPath = path.join(DIST_DIR, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    fs.writeFileSync(robotsPath, `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`, 'utf8');
  }

  console.log(`[build-blog] 完了: 記事${articles.length}件 + 一覧ページ + sitemap.xml`);
}

main();
