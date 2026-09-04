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
const PILLAR_DIR = path.join(ROOT, 'content', 'pillar');
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
  if (block.type === 'photo') return renderPhoto(block);
  if (block.type === 'ba') return renderBA(block);
  if (block.type === 'steps') return renderSteps(block);
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

// 写真の枠（2026-09-04）。**中身が入るまで、本番には何も出しません。**
// 「[写真: 軽トラの積載例]」のような文字を本番に出すと、作りかけに見えるため。
// 中元さんが src を入れた時点で出ます。入っていない枠はビルドのときに一覧で知らせます。
function renderPhoto(block) {
  if (!block.src) return '';
  const cap = block.caption ? `<figcaption>${inline(block.caption)}</figcaption>` : '';
  return `<figure class="photo"><img src="${esc(block.src)}" alt="${esc(block.alt || block.need || '')}" loading="lazy">${cap}</figure>`;
}

// Before / After を横に並べる。草刈りや物置は、これ1組で説明が要らなくなる
function renderBA(block) {
  if (!block.before || !block.after) return '';
  const cap = block.caption ? `<figcaption>${inline(block.caption)}</figcaption>` : '';
  return `<figure class="ba">
  <div class="ba-pair">
    <div><span>Before</span><img src="${esc(block.before)}" alt="${esc(block.beforeAlt || '作業前')}" loading="lazy"></div>
    <div><span>After</span><img src="${esc(block.after)}" alt="${esc(block.afterAlt || '作業後')}" loading="lazy"></div>
  </div>${cap}
</figure>`;
}

// 相談から作業までの流れ。「フッ軽」の名のとおり、何をすればいいかを3つに絞って見せる
function renderSteps(block) {
  const items = (block.items || [])
    .map((it, i) => `<li><span class="step-n">${i + 1}</span><b>${esc(it.t || '')}</b><span>${esc(it.d || '')}</span></li>`)
    .join('\n      ');
  return `<ol class="steps">\n      ${items}\n    </ol>`;
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

function pageUrl(base, slug) {
  return `${SITE_URL}/${base}/${slug}/`;
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
/* トップページと同じ決めごとで書いています。
   地色はほんのり灰色の白、段差は1pxの線、角丸は8px、差し色は琥珀1色だけ。 */
:root{
  --canvas:#F8FAFC; --surface:#FFFFFF; --hairline:#E2E8F0;
  --ink-900:#0F172A; --ink-700:#334155; --ink-600:#475569; --ink-500:#64748B;
  --ink-300:#CBD5E1;
  --accent:#B45309; --accent-soft:#FEF3C7; --accent-line:#FDE68A;
  --line-green:#0A8138; --line-hover:#08682D;
  --r:8px;
}
/* ── 追従するCTA帯（2026-09-04）──
   固定で浮かせると、途中の行が必ずその下を通る。過去に2回この直し方を間違えた。
   ここでは帯に**居場所を与える**。本文は .page の中だけを流れるので、
   どこまでスクロールしても文字が帯の下に入らない。 */
html,body{height:100%}
body{display:flex;flex-direction:column;overflow:hidden}
.page{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch}
.cta-bar{flex:0 0 auto;background:var(--ink-900,#0f172a);color:#fff;
  padding:10px 16px calc(10px + env(safe-area-inset-bottom));
  box-shadow:0 -1px 0 rgba(0,0,0,.08)}
.cta-bar .wrap{display:flex;gap:10px;align-items:center;max-width:760px;margin:0 auto}
.cta-bar p{flex:1 1 auto;margin:0;font-size:13px;line-height:1.5;color:rgba(255,255,255,.82)}
.cta-bar a{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;
  min-height:44px;padding:0 16px;border-radius:8px;font-size:14px;font-weight:700;
  text-decoration:none;background:#fff;color:var(--ink-900,#0f172a)}
.cta-bar a.tel{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.45)}
.cta-bar a{white-space:nowrap}
.cta-bar .sub{font-weight:500;opacity:.7}
@media (max-width:640px){
  .cta-bar p{display:none}
  .cta-bar .wrap{gap:8px}
  .cta-bar a{flex:2 1 0;padding:0 8px;font-size:13.5px}
  .cta-bar a.tel{flex:1 1 0}
  .cta-bar .sub{display:none}
}
*{box-sizing:border-box}
html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
body{
  margin:0;
  font-family:Inter,"Noto Sans JP",-apple-system,"Hiragino Kaku Gothic ProN","Hiragino Sans",Meiryo,sans-serif;
  color:var(--ink-700);background:var(--canvas);line-height:1.85;
  font-feature-settings:"palt" 1;
}
img{max-width:100%;height:auto;border-radius:var(--r)}
a{color:var(--accent);text-decoration:underline}
h1,h2,h3,h4{color:var(--ink-900);letter-spacing:-0.02em;line-height:1.4}
.wrap{max-width:720px;margin:0 auto;padding:0 20px}

/* ヘッダー */
header.site{background:var(--surface);border-bottom:1px solid var(--hairline);position:sticky;top:0;z-index:10}
header.site .wrap{max-width:960px;display:flex;align-items:center;justify-content:space-between;padding:14px 20px}
.brand{font-weight:700;color:var(--ink-900);text-decoration:none;font-size:17px;letter-spacing:-0.02em}
.brand span{color:var(--ink-500);font-weight:400;font-size:13px;margin-left:6px}
.backlink{font-size:13px;color:var(--ink-500);text-decoration:none}
.backlink:hover{color:var(--ink-900)}

/* 記事の見出し */
.hero{background:var(--ink-900);color:#fff;padding:56px 0 48px;position:relative;overflow:hidden}
.hero-bg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.28}
.hero .wrap{max-width:720px;position:relative;z-index:1}
.hero .cat{display:inline-block;border:1px solid rgba(255,255,255,.25);color:#fff;font-size:12px;font-weight:500;letter-spacing:.04em;padding:4px 10px;border-radius:var(--r);margin-bottom:16px}
.hero h1{font-size:clamp(24px,4.2vw,34px);line-height:1.45;margin:0 0 16px;font-weight:700;color:#fff}
.hero .meta{font-size:12.5px;color:rgba(255,255,255,.6)}

/* 本文 */
main{background:var(--surface);border-bottom:1px solid var(--hairline);padding:48px 0 16px}
main .wrap{font-size:16px}
.lead{font-size:16.5px;color:var(--ink-600);border-left:2px solid var(--accent);padding:2px 0 2px 18px;margin:0 0 34px}
h2{font-size:22px;font-weight:700;margin:48px 0 18px;padding-bottom:12px;border-bottom:1px solid var(--hairline)}
h3{font-size:17px;font-weight:700;margin:32px 0 12px}
p{margin:0 0 18px}
ul,ol{margin:0 0 20px;padding-left:1.4em}
li{margin:0 0 10px}
strong{color:var(--ink-900);font-weight:700}

/* 表 */
.table-wrap{overflow-x:auto;margin:0 0 24px;border:1px solid var(--hairline);border-radius:var(--r)}
table{border-collapse:collapse;width:100%;min-width:420px;font-size:14.5px}
th,td{border-bottom:1px solid var(--hairline);padding:12px 14px;text-align:left}
tr:last-child td{border-bottom:0}
th{background:var(--canvas);font-weight:600;color:var(--ink-900)}

/* メモ */
.note{background:var(--canvas);border:1px solid var(--hairline);border-radius:var(--r);padding:18px 20px;margin:0 0 26px}
.note strong{display:block;margin-bottom:6px;font-size:13px;color:var(--accent);letter-spacing:.02em}
.note p{margin:0;font-size:14.5px;color:var(--ink-600)}

/* よくある質問 */
.faq-item{border-top:1px solid var(--hairline);padding:18px 0}
.faq-q{font-weight:600;color:var(--ink-900);margin:0 0 8px}
.faq-a{margin:0;color:var(--ink-600);font-size:15px}

/* 相談への誘い */
.cta-box{background:var(--canvas);border:1px solid var(--hairline);border-radius:var(--r);padding:28px 24px;margin:40px 0}
.cta-heading{font-size:17px;font-weight:700;color:var(--ink-900);margin:0 0 8px;letter-spacing:-0.02em}
.cta-sub{font-size:13.5px;color:var(--ink-500);margin:0 0 20px}
.cta-buttons{display:flex;flex-direction:column;gap:10px;max-width:420px}
.btn{display:inline-flex;align-items:center;justify-content:center;padding:13px 18px;border-radius:var(--r);font-weight:600;text-decoration:none;font-size:14.5px;transition:background-color .15s,border-color .15s}
.btn-line{background:var(--line-green);color:#fff}
.btn-line:hover{background:var(--line-hover)}
.btn-outline{background:var(--surface);color:var(--ink-900);border:1px solid var(--ink-300)}
.btn-outline:hover{border-color:var(--ink-900)}

.article-footer{max-width:720px;margin:0 auto;padding:24px 20px 40px}
.related{font-size:13.5px;color:var(--ink-500)}
.related a{color:var(--ink-900);text-decoration:none}
.related a:hover{text-decoration:underline}
.ba{margin:22px 0}
.ba-pair{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ba-pair>div{position:relative}
.ba-pair img{width:100%;height:auto;border-radius:8px;display:block}
.ba-pair span{position:absolute;top:8px;left:8px;font-size:11px;font-weight:700;letter-spacing:.04em;
  background:rgba(15,23,42,.82);color:#fff;padding:3px 8px;border-radius:5px}
.ba figcaption{font-size:13px;color:var(--ink-500);margin-top:8px}
@media (max-width:560px){.ba-pair{grid-template-columns:1fr;gap:8px}}
.photo{margin:22px 0}
.photo img{width:100%;height:auto;border-radius:8px;display:block}
.photo figcaption{font-size:13px;color:var(--ink-500);margin-top:8px}
.steps{list-style:none;margin:22px 0;padding:0;display:grid;gap:12px}
.steps li{display:grid;grid-template-columns:34px 1fr;gap:4px 12px;align-items:start}
.steps .step-n{grid-row:span 2;width:34px;height:34px;border-radius:8px;background:var(--ink-900);color:#fff;display:grid;place-items:center;font-weight:700}
.steps b{font-size:15px;color:var(--ink-900)}
.steps span:not(.step-n){font-size:14px;color:var(--ink-500);line-height:1.7}
.pillar-index{margin:8px 0 28px}
.pillar-index h3{font-size:15px;margin:20px 0 8px;color:var(--ink-900)}
.pillar-index ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.pillar-index a{color:var(--ink-900);text-decoration:none;border-bottom:1px solid var(--line, #e5e7eb)}
.pillar-index a:hover{border-bottom-color:currentColor}
.to-pillar{margin:0 0 20px;padding:14px 16px;border:1px solid var(--line, #e5e7eb);border-radius:8px}
.to-pillar b{display:block;font-size:13px;color:var(--ink-500);font-weight:500;margin-bottom:4px}
.to-pillar a{color:var(--ink-900);text-decoration:none;font-weight:600}
.to-pillar a:hover{text-decoration:underline}
.related-list{margin:0 0 28px}
.related-list h2{font-size:16px;margin:0 0 10px;color:var(--ink-900)}
.related-list ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.related-list li{line-height:1.6}
.related-list a{color:var(--ink-900);text-decoration:none;border-bottom:1px solid var(--line, #e5e7eb)}
.related-list a:hover{border-bottom-color:currentColor}

/* フッター */
footer.site{background:var(--ink-900);color:rgba(255,255,255,.6);padding:40px 0;font-size:13px;line-height:1.9}
footer.site .wrap{max-width:720px}
footer.site p{margin:0 0 6px}
footer.site a{color:rgba(255,255,255,.85);text-decoration:none}
footer.site a:hover{color:#fff}

/* 記事一覧 */
.index-list{list-style:none;margin:0;padding:0}
.index-list li{border-top:1px solid var(--hairline)}
.index-list li:last-child{border-bottom:1px solid var(--hairline)}
.index-list a{text-decoration:none;color:var(--ink-700);display:block;padding:24px 0;transition:opacity .15s}
.index-list a:hover h2{color:var(--accent)}
.index-list h2{border:0;margin:6px 0 8px;font-size:18px;padding:0;transition:color .15s}
.index-list p{color:var(--ink-500);font-size:14px;margin:0}
.index-date{font-size:12px;color:var(--ink-500);font-variant-numeric:tabular-nums}

@media(max-width:480px){.hero{padding:40px 0 32px}.wrap{padding:0 18px}main{padding:36px 0 12px}}
@media (prefers-reduced-motion: reduce){*{transition-duration:.01ms !important}}
`;

function pageShell({ title, description, canonical, ogType, extraHead, bodyHtml, ogImage }) {
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
${ogImage ? `<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">` : ''}
<meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">
${ogImage ? `<meta name="twitter:image" content="${esc(ogImage)}">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
<meta name="theme-color" content="#F8FAFC">
<style>${PAGE_CSS}</style>
${extraHead || ''}
</head>
<body>
<div class="page">
<header class="site">
  <div class="wrap">
    <a class="brand" href="/">フッ軽<span>ふっかる</span></a>
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
</div>
<div class="cta-bar">
  <div class="wrap">
    <p>写真を1枚送るだけで、お見積りをお出しします。作業前にご納得いただいてから始めます。</p>
    <a href="${LINE_URL}" target="_blank" rel="noopener">LINEで無料見積もり<span class="sub">（写真1枚でOK）</span></a>
    <a class="tel" href="tel:0545-78-3704">電話する</a>
  </div>
</div>
</body>
</html>`;
}


// ── 関連記事（2026-09-04 に追加）──
// それまで記事どうしが1本も繋がっていなかった。
// 「富士市 家具組立」のような大きい語は、1本では取れない。
// 同じ話題の記事が束になって、はじめて Google に「この店はここに詳しい」と伝わる。
// **選び方は機械だけで決める。**AIに選ばせると、関係のない記事を薦めてしまう。
const AREA_RE = /(富士宮市|富士市|沼津市|静岡市|三島市|御殿場市|裾野市|清水町)/g;

function areasOf(a) {
  const s = [a.title, a.metaDescription, ...(a.keywords || [])].join(' ');
  return new Set(s.match(AREA_RE) || []);
}

function relatedArticles(article, all, max = 4) {
  const myAreas = areasOf(article);
  const myKw = new Set((article.keywords || []).map(String));
  return all
    .filter((a) => a.slug !== article.slug)
    .map((a) => {
      let score = 0;
      if (a.category && a.category === article.category) score += 3; // 同じ分類がいちばん近い
      for (const ar of areasOf(a)) if (myAreas.has(ar)) score += 2;  // 次に同じ地域
      for (const k of a.keywords || []) if (myKw.has(String(k))) score += 1;
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || (x.a.publishDate < y.a.publishDate ? 1 : -1))
    .slice(0, max)
    .map((x) => x.a);
}

function renderRelated(article, all) {
  const rel = relatedArticles(article, all);
  if (!rel.length) return '';
  const items = rel
    .map((a) => `<li><a href="/blog/${esc(a.slug)}/">${esc(a.title)}</a></li>`)
    .join('\n      ');
  return `
  <nav class="related-list" aria-label="関連する記事">
    <h2>あわせて読みたい</h2>
    <ul>
      ${items}
    </ul>
  </nav>`;
}

function renderArticlePage(article, all = [], pillar = null) {
  const bodyBlocks = article.blocks.map(renderBlock).join('\n');
  const dateStr = article.publishDate;
  // 写真は別レイヤーに置いて薄くする。グラデーションの膜はかけない。
  const heroBg = article.heroImage
    ? `<div class="hero-bg" style="background-image:url('${esc(article.heroImage)}')"></div>`
    : '';
  const bodyHtml = `
<div class="hero">
  ${heroBg}
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
  ${pillar ? `<div class="to-pillar"><b>この地域のまとめ</b><a href="/${esc(pillar.basePath || 'blog')}/${esc(pillar.slug)}/">${esc(pillar.title)}</a></div>` : ''}
  ${renderRelated(article, all)}
  <p class="related"><a href="/blog/">← ブログ一覧へ戻る</a></p>
</div>`;
  return pageShell({
    title: `${article.title}｜${SITE_NAME}`,
    description: article.metaDescription,
    canonical: articleUrl(article.slug),
    ogType: 'article',
    extraHead: jsonLd(article),
    // SNSに貼ったとき出る絵は、題を焼き込んだ ogImage を優先する。
    // 見出しの背景（heroImage）は題なしの絵なので、無ければそちらで代用する。
    ogImage: article.ogImage || article.heroImage
      ? `${SITE_URL}${article.ogImage || article.heroImage}`
      : '',
    bodyHtml,
  });
}


// ── 柱のページ（ピラー）2026-09-04 ──
// 枝葉の記事は、1本ずつでは大きい語に届かない。
// 話題の中心になる1枚を置き、そこへ全記事から繋いで束にする。
// 記事一覧の部分は**毎回作り直す**ので、記事が増えても柱が古くならない。
function pillarArticles(pillar, articles) {
  const only = pillar.articleCategories;
  return only && only.length
    ? articles.filter((a) => only.includes(a.category))
    : articles;
}

function renderPillarBody(pillar, all) {
  const articles = pillarArticles(pillar, all);
  if (!articles.length) return '';
  const groups = new Map();
  for (const a of articles) {
    const k = a.category || 'そのほか';
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(a);
  }
  const list = [...groups.entries()]
    .sort((x, y) => y[1].length - x[1].length)
    .map(([cat, arr]) => {
      const items = arr
        .sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1))
        .map((a) => `<li><a href="/blog/${esc(a.slug)}/">${esc(a.title)}</a></li>`)
        .join('\n        ');
      return `<h3>${esc(cat)}</h3>\n      <ul>\n        ${items}\n      </ul>`;
    })
    .join('\n      ');
  return `
  <h2 id="kiji">もっと詳しく（${articles.length}本）</h2>
  <p>仕事ごとの細かい話は、それぞれの記事にまとめています。</p>
  <div class="pillar-index">
      ${list}
  </div>`;
}

function renderPillarPage(pillar, articles) {
  const body = pillar.blocks.map(renderBlock).join('\n');
  const heroBg = pillar.heroImage
    ? `<div class="hero-bg" style="background-image:url('${esc(pillar.heroImage)}')"></div>`
    : '';
  const bodyHtml = `
<div class="hero">
  ${heroBg}
  <div class="wrap">
    <span class="cat">まとめ</span>
    <h1>${esc(pillar.title)}</h1>
    <div class="meta">更新日: ${esc(new Date().toISOString().slice(0, 10))}</div>
  </div>
</div>
<main>
  <div class="wrap">
    ${body}
    ${renderPillarBody(pillar, articles)}
  </div>
</main>
<div class="article-footer wrap">
  <p class="related"><a href="/blog/">← ブログ一覧へ戻る</a></p>
</div>`;
  return pageShell({
    title: `${pillar.title}｜${SITE_NAME}`,
    description: pillar.metaDescription,
    canonical: pageUrl(pillar.basePath || 'blog', pillar.slug),
    ogType: 'article',
    extraHead: jsonLd(pillar),
    ogImage: pillar.ogImage || pillar.heroImage ? `${SITE_URL}${pillar.ogImage || pillar.heroImage}` : '',
    bodyHtml,
  });
}

// 写真の枠が空のままのものを数える。中元さんに何を撮ればいいかを伝えるため
function photoTodo(docs) {
  const out = [];
  for (const d of docs)
    for (const b of d.blocks || [])
      if (b && b.type === 'photo' && !b.src) out.push(`${d.slug}: ${b.need || '（用途未記入）'}`);
  return out;
}

function renderIndexPage(articles, pillar = null) {
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

function buildSitemap(articles, pillars = []) {
  const urls = [
    { loc: `${SITE_URL}/`, priority: '1.0' },
    { loc: `${SITE_URL}/blog/`, priority: '0.8' },
    ...pillars.map((p) => ({ loc: pageUrl(p.basePath || 'blog', p.slug), priority: '0.9' })),
    ...articles.map((a) => ({ loc: articleUrl(a.slug), priority: '0.7', lastmod: a.updatedDate || a.publishDate })),
  ];
  const body = urls
    .map(
      (u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${esc(u.lastmod)}</lastmod>` : ''}<priority>${u.priority}</priority></url>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}


// ── トップページに、機械が読める道を作る（2026-09-04 に追加）──
// トップは JavaScript で組み立てているので、配られるHTMLは空の器だった。
// 画面上には（Header/Footer/BlogTeaser に）ブログへのリンクがあるのに、
// **HTMLには1本も無かった。**そのため Google はブログへ辿り着けず、
// 2026-09-04 の実測で /blog/ も記事15本も「Googleが知らないURL」だった。
// JavaScript を動かさない相手（クローラの初回・読み上げ・回線が細い端末）にも
// 同じ道が見えるよう、noscript に本物のリンクを置く。中身は毎回作り直す。
function injectBlogLinks(articles, pillars = []) {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) return false;
  let html = fs.readFileSync(indexPath, 'utf8');
  const MARK_S = '<!-- blog-links:start -->';
  const MARK_E = '<!-- blog-links:end -->';
  const items = articles
    .slice()
    .sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1))
    .map((a) => `<li><a href="/blog/${esc(a.slug)}/">${esc(a.title)}</a></li>`)
    .join('\n');
  const block = `${MARK_S}
<noscript>
<nav aria-label="お役立ちブログ">
<h2>お役立ちブログ</h2>
<p><a href="/blog/">記事の一覧を見る</a></p>
${pillars.map((p) => `<p><a href="/${esc(p.basePath || 'blog')}/${esc(p.slug)}/">${esc(p.title)}</a></p>`).join('\n')}
<ul>
${items}
</ul>
</nav>
</noscript>
${MARK_E}`;
  const re = new RegExp(MARK_S + '[\\s\\S]*?' + MARK_E);
  html = re.test(html)
    ? html.replace(re, block)
    : html.replace('</body>', block + '\n</body>');
  fs.writeFileSync(indexPath, html, 'utf8');
  return true;
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

  // 柱（ピラー）を読む。無ければ今までどおり動く
  const pillars = fs.existsSync(PILLAR_DIR)
    ? fs.readdirSync(PILLAR_DIR).filter((f) => f.endsWith('.json'))
        .map((f) => JSON.parse(fs.readFileSync(path.join(PILLAR_DIR, f), 'utf8')))
    : [];
  const pillarFor = (a) =>
    pillars.find((p) => (p.articleCategories || []).includes(a.category)) || null;

  fs.mkdirSync(BLOG_OUT_DIR, { recursive: true });

  for (const a of articles) {
    const outDir = path.join(BLOG_OUT_DIR, a.slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), renderArticlePage(a, articles, pillarFor(a)), 'utf8');
    console.log(`[build-blog] 生成: /blog/${a.slug}/`);
  }

  for (const pl of pillars) {
    const base = pl.basePath || 'blog';
    const outDir = path.join(DIST_DIR, base, pl.slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), renderPillarPage(pl, articles), 'utf8');
    console.log(`[build-blog] 生成（柱）: /${base}/${pl.slug}/`);
  }

  fs.writeFileSync(path.join(BLOG_OUT_DIR, 'index.html'), renderIndexPage(articles, pillars[0] || null), 'utf8');

  const linked = injectBlogLinks(articles, pillars);

  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, buildSitemap(articles, pillars), 'utf8');

  const robotsPath = path.join(DIST_DIR, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    fs.writeFileSync(robotsPath, `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`, 'utf8');
  }

  const todo = photoTodo(pillars);
  if (todo.length) {
    console.log('[build-blog] ★ 写真の枠が空いています（入るまで本番には出ません）:');
    for (const t of todo) console.log('           - ' + t);
  }

  console.log(`[build-blog] 完了: 記事${articles.length}件 + 一覧ページ + sitemap.xml`
    + (linked ? ' + トップのブログ導線' : ' ／ ★トップに導線を入れられませんでした'));
}

main();
