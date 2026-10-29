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
// 作業の一覧ページの置き場所（2026-10-08、/service/ から /blog/ の下へ引っ越した）。
// /service/ の8ページは、9/16 から3週間、Google が一度も読みに来なかった。同じ作りで /blog/ の下に置いた
// 1本は4日で登録された。古い住所は firebase.json の redirects が新しい住所へ送る
const SVC_PATH = '/blog/service/';
const SITE_NAME = 'フッ軽（ふっかる）';
const LINE_URL = 'https://lin.ee/Bh5gFU6';

// ── 中元さんのキャラ（2026-10-29）──
// 中元さん「シンプルすぎて味気ない。新聞みたい」。仕事ごとに、作業着の代表のキャラが見出しに立つ。
// 絵は動画と同じ切り抜き（本人のキャラは使ってよい・10/20 中元さん）。public/kyara/ に
// scripts/make-kyara.mjs で作る。大きさは content/kyara.json（どの姿も同じ縮尺。しゃがむ姿は小さく出る）。
// **新しい分類が増えたら、ここに1行足す。**無ければ正面の立ち姿（front）になる。
const KYARA_SIZE = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'kyara.json'), 'utf8')); } catch { return {}; }
})();
const KYARA_BY_CATEGORY = {
  '家具組立': 'repair',
  '庭まわり': 'kusakari',
  '草刈り': 'kusakari',
  '物置': 'kougu',
  '不用品の運搬': 'hirou',
  '空き家・マンション管理': 'bin',
  '荷造り・荷解き': 'hikkoshi',
  '家具移動・模様替え': 'hikkoshi',
  '家具の運搬': 'hikkoshi',
  '掃除': 'hirou',
  '買い物代行': 'walk',
  '会社のこと': 'greet',
  '水まわりの軽作業': 'senjo',
};
// まとめのページ（柱）は、分類より中身に合う姿を選ぶ
const KYARA_BY_PILLAR = {
  'fuji-gomi-dashikata': 'point',
  'fuji-unpan-kaitori-guide': 'hikkoshi',
  akiya: 'bin',
  'kagu-kumitate': 'repair',
  kaimono: 'walk',
  kusakari: 'kusakari',
  'monooki-anchor': 'impact',
  monooki: 'kougu',
  senjo: 'senjo',
};
// 絵は飾りなので alt は空（読み上げで「画像」と言わせない）。縦横を書いて、読み込みで画面が動かないようにする。
// --kh は絵の縦の大きさ。見出しでは半分の大きさで出す（細かい画面でもぼやけない）
function kyaraImg(name, cls, { small = false, eager = false } = {}) {
  const s = KYARA_SIZE[name];
  if (!s) return '';
  const [w, h] = small ? s.s : s.l;
  const src = small ? `/kyara/s/${name}.webp` : `/kyara/${name}.webp`;
  return `<img class="${cls}" src="${src}" alt="" width="${w}" height="${h}" style="--kh:${h}"${eager ? '' : ' loading="lazy"'} decoding="async">`;
}
function kyaraForCategory(category) {
  return KYARA_BY_CATEGORY[category] || 'front';
}

// 見出し（記事・まとめ・料金・一覧・404 で共通）。文言はそれぞれの呼び出し元が渡す。
// キャラは右下に立たせ、足を見出しの下の線にそろえる。
function renderHero({ cat, title, meta, bg = '', kyara = '', wide = false }) {
  const heroBg = bg ? `\n  <div class="hero-bg" style="background-image:url('${esc(bg)}')"></div>` : '';
  const k = kyara ? kyaraImg(kyara, 'hero-kyara', { eager: true }) : '';
  return `
<div class="hero${k ? ' has-kyara' : ''}">${heroBg}
  <div class="wrap${wide ? ' wide' : ''} hero-grid">
    <div class="hero-text">
      <span class="cat">${cat}</span>
      <h1>${title}</h1>
      <div class="meta">${meta}</div>
    </div>
    ${k}
  </div>
</div>`;
}

// 記事の終わりに置く「伺う人」。記事はAIがまとめているので「書いた人」とは書かない。
// 文はHP（トップの代表あいさつ・/blog/service/）に載っているものだけを使う
function renderDaihyo() {
  return `
  <aside class="daihyo" aria-label="お伺いする人">
    ${kyaraImg('greet', 'daihyo-kyara')}
    <div class="daihyo-text">
      <p class="daihyo-name">フッ軽合同会社 代表 <b>中元 晋平</b></p>
      <p class="daihyo-msg">ご相談から作業当日まで、代表が最初から最後まで担当します。</p>
      <ul class="daihyo-shikaku"><li>宅地建物取引士</li><li>FP2級</li><li>運行管理者（貨物）</li><li>古物商許可</li></ul>
      <a class="daihyo-link" href="/#founder">代表のごあいさつを読む</a>
    </div>
  </aside>`;
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// インライン強調記法だけ簡易対応: **太字** -> <strong>
// [文字](https://…) -> 外へのリンク（2026-09-14。許可をいただいた他社サイトを載せるため。https だけ）
function inline(s) {
  return esc(s)
    // **強調の中に改行が入ることがあります**（2026-09-24、「。」で改行を入れてから）。
    // `.` は改行に当たらないので、**76か所が `**` のまま本番に出ました。**
    // → `[\s\S]` で改行もまたげるようにします。honban.py の⑦が見つけてくれました。
    .replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // [文字](/service/…) -> サイト内のリンク（2026-09-15。柱ページで記号のまま画面に出ていた）
    .replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, '<a href="$2">$1</a>');
}

/** 段落の中の改行を、そのまま改行として見せる（2026-09-12）
 *
 * **ここが効いていませんでした。**
 * 記事を書くAIは短い文を改行で区切って書いていたのに、
 * **inline() が改行を落とすので、ページでは1つの塊になっていました。**
 * 実測：9段落（4ページ）が、改行を失って読みにくい塊になっていた。
 *
 * 段落・リード・箇条書きの中だけに使います。
 * （見出しや表の中で改行することはないので、そこには使いません）
 */
function inlineBr(s) {
  return inline(kugiru(s)).replace(/\n/g, '<br>');
}

/** 「。」で必ず改行する（2026-09-24 中元さんの指示）
 *
 * **1文ずつ行を分けたほうが読みやすい。**
 * 記事53本のデータは直しません。**ここ1か所で全部の記事が変わります。**
 *
 * 改行しないのは2つだけです。
 *   ・段落のいちばん最後の「。」（余分な空行になるため）
 *   ・「。」の直後が閉じカッコのとき（「…です。」のような引用の途中）
 */
function kugiru(s) {
  return String(s == null ? '' : s)
    .replace(/。(?![」』）\)】\]"'\n])/g, '。\n')
    .replace(/\n+$/, '');
}

/** 目次（2026-09-12）
 *
 * **記事34本すべてに目次が無かった。**
 * 長い記事で「どこに何が書いてあるか」が分からないままだった。
 * 参考にしたページ（AtoJ）は「OUTLINE 読みたい項目からご覧いただけます」を置いている。
 *
 * **記事側のファイルは直さない。**h2 から自動で作る。
 * id が無い h2（7個あった）には、順番から作った id を振る。
 */
function withIds(blocks) {
  let n = 0;
  return blocks.map((b) => {
    if (b.type !== 'h2') return b;
    n += 1;
    return b.id ? b : { ...b, id: `s${n}` };
  });
}

function renderToc(blocks) {
  // 2026-09-21：`text` ではなく `heading` で書かれた見出しが、目次から丸ごと消えていた
  const h2 = blocks.filter((b) => b.type === 'h2' && midashiText(b));
  // **3つ未満なら出さない。**2項目の目次は場所を取るだけ
  if (h2.length < 3) return '';
  const li = h2
    .map((b) => `<li><a href="#${esc(b.id)}">${inline(midashiText(b))}</a></li>`)
    .join('');
  return `<nav class="toc" aria-label="目次"><b>この記事の内容</b><ol>${li}</ol></nav>`;
}

/** 「できない」を行き止まりにしない（2026-09-14・中元さんの方針）
 *
 * 許認可の線で「できません」と書く所で、読者が止まって帰っていた。
 * **線はぼかさない。**すぐ下に「どれに当たるか聞ける」入口を置く。
 * 約束するのは判定と出し方の案内まで。「相談すれば何とかなる」とは書かない。
 *
 * AIには頼まない（言っても守られない）。組み立てるときに機械で差し込む。
 * 1記事2か所まで・続けて置かない（押し売りに見えるため）。FAQは答えの下に1か所。
 */
// 2026-09-14 夜：記事を「できません」と言い切らない書き方に直したら、この目印に当たらなくなり、
// 本番の相談枠が38か所→2か所に減っていた。やわらげた言い方（お受けしていません・出し方をご案内）も目印にする
const DEKINAI_RE = /できません|できない|承れません|お引き受けできません|買い取れません|引き取れません|請け負えません|お受けしていません|お受けしていない|出し方をご案内/;
// 「自分で対処できない」のような一般の文には付けない。ごみ・許可・買取の話のときだけ
const DEKINAI_WADAI = /ごみ|廃棄物|許可|処分|自治体|出し方|買取|買い取|引き取|持ち込|施設|お預かり/;

// 「できない」と話題（ごみ・許可・買取）が、同じ文の中にあるときだけ
function dekinaiWadai(t) {
  return t.split(/[。\n]/).some((s) => DEKINAI_RE.test(s) && DEKINAI_WADAI.test(s));
}

function blockText(b) {
  if (b.type === 'table') return [...(b.headers || []), ...(b.rows || []).flat()].join(' ');
  if (b.type === 'ul' || b.type === 'ol') return (b.items || []).join(' ');
  if (b.type === 'p' || b.type === 'note') return b.text || '';
  return '';
}

function withDekinaiSoudan(blocks) {
  const out = [];
  let n = 0;
  let last = -99;
  let ato = -1;
  let faqDone = false;
  blocks.forEach((b, i) => {
    if (b.type === 'faq' && !faqDone && Array.isArray(b.items)) {
      const k = b.items.findIndex((qa) => dekinaiWadai(String(qa?.a || '')));
      if (k >= 0) {
        faqDone = true;
        out.push({ ...b, items: b.items.map((qa, j) => (j === k ? { ...qa, soudan: true } : qa)) });
        return;
      }
    }
    // 見出しは記事ごとに作業名が入っているので上書きしない。枠の中に1行足すだけ
    if (b.type === 'cta' && (n > 0 || faqDone)) {
      out.push({ ...b, dekinai: true });
      return;
    }
    out.push(b);
    if (i === ato) {
      out.push({ type: 'soudan' });
      ato = -1;
      return;
    }
    if (n < 2 && i - last > 3 && dekinaiWadai(blockText(b))) {
      // 2026-09-15：「次のものは…できません。」の直後に一覧が続くとき、文と一覧のあいだに割り込んでいた（柱ページで目視）。一覧・表の後ろに回す
      const tsugi = blocks[i + 1];
      if (tsugi && ['ul', 'ol', 'table'].includes(tsugi.type)) ato = i + 1;
      else out.push({ type: 'soudan' });
      n += 1;
      last = i;
    }
  });
  return out;
}

const SOUDAN_TEXT = 'どれに当たるか分からないときは、写真を公式LINEに送ってください。「運び出し」「買取」「出し方のご案内」のどれになるか、お答えします。';

function renderSoudan() {
  return `<div class="soudan"><p>${esc(SOUDAN_TEXT)}</p><a class="soudan-link" href="${LINE_URL}" target="_blank" rel="noopener">LINEで聞いてみる</a></div>`;
}


// 見出しの文字を取り出す。**空の見出しを黙って出さないための一か所。**
// 2026-09-21、svc-kaimono.json が `text` ではなく `heading` で書かれていて、
// 本番に `<h2 id="s1"></h2>` が2つ出ていた（目次も消えていた）。
// 弾くと記事が1本も出ない日ができるので、**直したうえで声を上げる**。
const midashiKeikoku = [];
function midashiText(block) {
  return block.text || block.heading || block.title || '';
}
function midashi(block, tag) {
  const t = midashiText(block);
  if (!String(t).trim()) {
    midashiKeikoku.push(`${tag}: ${JSON.stringify(block)}`);
  } else if (!block.text) {
    midashiKeikoku.push(`${tag}: text ではなく別の名前で書かれています → ${JSON.stringify(block)}`);
  }
  return t;
}

function renderBlock(block, regularCare = false) {
  if (block.type === 'soudan') return renderSoudan();
  if (block.type === 'photo') return renderPhoto(block);
  if (block.type === 'ba') return renderBA(block);
  // 草刈りの料金めやす（2026-09-19）。中身は public/tools/kusakari-calc.js
  if (block.type === 'calc') return '<div data-kusakari-calc></div><script src="/tools/kusakari-calc.js?v=20260920b" defer></script>';
  if (block.type === 'steps') return renderSteps(block);
  switch (block.type) {
    case 'lead':
      return `<p class="lead">${inlineBr(block.text)}</p>`;
    case 'h2':
      return `<h2 id="${esc(block.id || '')}">${inline(midashi(block, 'h2'))}</h2>`;
    case 'h3':
      return `<h3>${inline(midashi(block, 'h3'))}</h3>`;
    case 'p':
      return `<p>${inlineBr(block.text)}</p>`;
    case 'ul':
      return `<ul>${block.items.map((i) => `<li>${inlineBr(i)}</li>`).join('')}</ul>`;
    case 'ol':
      return `<ol>${block.items.map((i) => `<li>${inlineBr(i)}</li>`).join('')}</ol>`;
    case 'table': {
      const head = `<tr>${block.headers.map((h) => `<th>${inline(h)}</th>`).join('')}</tr>`;
      const rows = block.rows
        .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
        .join('');
      // 列の数を表に持たせる。2列のときだけスマホでも収まるようにするため（下の CSS）
      const cols = Math.max(block.headers.length, ...block.rows.map((r) => r.length));
      return `<div class="table-wrap${cols <= 2 ? ' cols-2' : ''}"><table>${head}${rows}</table></div>`;
    }
    case 'note':
      return `<div class="note"><strong>${inline(block.title || 'メモ')}</strong><p>${inlineBr(block.text)}</p></div>`;
    case 'cta':
      return renderCta(block, regularCare);
    case 'faq': {
      const items = block.items
        .map(
          (qa) => `<div class="faq-item"><p class="faq-q"><span class="qa">Q.</span> ${inline(qa.q)}</p><p class="faq-a"><span class="qa">A.</span> ${inlineBr(qa.a)}</p>${qa.soudan ? `<a class="soudan-link" href="${LINE_URL}" target="_blank" rel="noopener">写真を送って聞いてみる</a>` : ''}</div>`
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

function renderCta(block, regularCare = false) {
  const heading = block?.heading || '見積もりは無料です。まずはお気軽にご相談ください。';
  const sub = block?.sub || '富士市・富士宮市・静岡県内、山梨県、神奈川県海老名市以西まで対応しています。';
  // 見積もりの紙を持つキャラを横に立たせる（2026-10-29）。文言はこれまでと同じ
  return `
  <div class="cta-box has-kyara">
    <div class="cta-text">
    <p class="cta-heading">${inline(heading)}</p>
    <p class="cta-sub">${inline(sub)}</p>
    ${block?.dekinai ? '<p class="cta-sub">頼めるか迷った物も、写真を送ってください。どれに当たるかお答えします。</p>' : ''}
    </div>
    ${kyaraImg('mitsumori', 'cta-kyara')}
    <div class="cta-buttons">
      <a class="btn btn-line" href="${LINE_URL}" target="_blank" rel="noopener">${regularCare ? '公式LINEで定期のお手入れを相談する' : '公式LINEで相談する（登録＋成約で最大3,000円割引）'}</a>
      <a class="btn btn-outline" href="${regularCare ? 'https://fuji.creo-sumai.jp/' : SVC_PATH}">${regularCare ? '定期のお手入れの内容・料金を見る' : '料金とサービス一覧を見る'}</a>
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
    // **ページの住所は canonical と同じにする（2026-10-02）。**
    // 柱（basePath: 'service'）も articleUrl で /blog/<slug>/ を入れていたため、
    // /service/akiya/ のページが「本体は /blog/akiya/（実在しない）」と名乗っていた。
    // 無いURLでもトップが200で返っていたので、Google には「本体はトップと同じ中身の別の住所」に見えた。
    // /service/ の柱7本だけが一度も読みに来られず、/blog/ の柱は4日で登録された差と合う
    mainEntityOfPage: pageUrl(article.basePath || 'blog', article.slug),
  };
  const out = [data];

  // よくある質問を、機械にも「質問と答え」として渡す（2026-09-07）。
  // **文章はもう記事の中にある。**足りなかったのは、それが Q&A だという印だけ。
  // AI の回答や検索の Q&A 欄は、この印があるものから拾う。
  // 作る側のトークンは1つも使わない。組み立てるときに足すだけ。
  const faqs = (article.blocks || [])
    .filter((b) => b && b.type === 'faq')
    .flatMap((b) => b.items || [])
    .filter((x) => x && x.q && x.a);
  if (faqs.length) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((x) => ({
        '@type': 'Question',
        name: String(x.q),
        // 文中リンク [文字](https://…) は、構造化データでは文字だけにする
        acceptedAnswer: { '@type': 'Answer', text: String(x.a).replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, '$1') },
      })),
    });
  }

  return out
    .map((d) => `<script type="application/ld+json">${JSON.stringify(d)}</script>`)
    .join('\n');
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
  border-top:1px solid rgba(255,255,255,.08)}
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
.brand{display:inline-flex;align-items:center;gap:8px;font-weight:700;color:var(--ink-900);text-decoration:none;font-size:17px;letter-spacing:-0.02em}
.brand-logo{display:block;width:28px;height:28px;border-radius:var(--r)}
.brand span{color:var(--ink-500);font-weight:400;font-size:13px;margin-left:6px}
.backlink{font-size:13px;color:var(--ink-500);text-decoration:none}
.backlink:hover{color:var(--ink-900)}

/* 記事の見出し */
.hero{background:var(--ink-900);color:#fff;padding:56px 0 48px;position:relative;overflow:hidden}
/* 2026-10-29：写真を少しだけ見えるように（.28→.36）。真っ白な写真の上でも、白い字が 5:1・小さな日付が 4.5:1 を切らない所まで */
.hero-bg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.36}
.hero .wrap{max-width:720px;position:relative;z-index:1}
.hero .wrap.wide{max-width:1000px}
.hero .cat{display:inline-block;border:1px solid rgba(255,255,255,.25);background:rgba(15,23,42,.35);color:#fff;font-size:12px;font-weight:500;letter-spacing:.04em;padding:4px 10px;border-radius:var(--r);margin-bottom:16px}
.hero h1{font-size:clamp(24px,4.2vw,34px);line-height:1.45;margin:0 0 16px;font-weight:700;color:#fff}
.hero .meta{font-size:12.5px;color:rgba(255,255,255,.9)}
/* キャラの立つ見出し（2026-10-29）。足を見出しの下の線にそろえるため、下の余白は字の側に持たせる */
.hero.has-kyara{padding-bottom:0}
.hero-grid{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:24px;align-items:end}
.hero.has-kyara .hero-text{padding-bottom:48px}
.hero-kyara{display:block;width:auto;max-width:none;height:calc(var(--kh) * .5px);border-radius:0}
/* 広い画面では、字の左端を本文の左端にそろえ、キャラは本文の右の外に立たせる（字の幅を削らない） */
@media (min-width:1040px){
  .hero.has-kyara .wrap:not(.wide){max-width:none}
  .hero.has-kyara .wrap:not(.wide).hero-grid{grid-template-columns:1fr minmax(0,680px) 1fr}
  .hero.has-kyara .wrap:not(.wide) .hero-text{grid-column:2}
  .hero.has-kyara .wrap:not(.wide) .hero-kyara{grid-column:3;justify-self:start}
}
/* スマホは字の下に、右寄せで小さく立たせる（字に重ねない） */
@media (max-width:560px){
  .hero-grid{grid-template-columns:minmax(0,1fr)}
  .hero.has-kyara .hero-text{padding-bottom:0}
  .hero-kyara{justify-self:end;height:calc(var(--kh) * .24px);margin-top:4px}
}

/* 本文 */
main{background:var(--surface);border-bottom:1px solid var(--hairline);padding:48px 0 16px}
main .wrap{font-size:16px}
/* 2026-10-29：導入は線で囲まず、字を一段大きく濃くする（見出しの線と見分けるため） */
.lead{font-size:17px;line-height:1.9;color:var(--ink-900);margin:0 0 34px}
h2{font-size:22px;font-weight:700;margin:48px 0 18px}
h3{font-size:17px;font-weight:700;margin:32px 0 12px}
/* 本文の見出しは、灰色の帯と琥珀の線で区切る（2026-10-29「新聞みたい」への直し）。
   一覧・関連記事・まとめの札の見出しには効かせないため、本文の直下（>）だけ */
main .wrap>h2{font-size:21px;line-height:1.5;margin:56px 0 20px;padding:12px 16px;background:var(--canvas);border-left:4px solid var(--accent);border-radius:0 var(--r) var(--r) 0}
main .wrap>h3{padding-left:12px;border-left:3px solid var(--accent-line)}
p{margin:0 0 18px}
/* 段落と段落のあいだを広げる（2026-09-24 中元さんの指示）。
   参考にしたページ（manablog）を実測したら、**違いはここだけ**でした。
   文字16px・行間30px・1段落58字はほぼ同じで、**段落の下だけ60px**（こちらは18px）。
   クラスの無い段落＝本文だけを広げます（リード・メモ・FAQ・帯は今までどおり）。 */
/* 2026-10-29：「本文の直下の段落」だけに狭めた（> を足した）。
   空白（子孫）のままだと、相談の箱・動画の箱の中の段落にも 36px が付き、箱の中に大きな空きが出ていた（本番で実測） */
main .wrap>p:not([class]){margin-bottom:36px}
ul,ol{margin:0 0 20px;padding-left:1.4em}
li{margin:0 0 10px}
strong{color:var(--ink-900);font-weight:700}

/* 表 */
.table-wrap{overflow-x:auto;margin:0 0 24px;border:1px solid var(--hairline);border-radius:var(--r)}
/* 2026-09-15 中元さん：表は詰めずに広げ、スマホは横にスライドして読ませる。1列を約10文字ぶん取る（3列で約560px） */
table{border-collapse:collapse;width:100%;min-width:560px;font-size:14.5px}
/* 2026-09-21：その560pxが2列の表にもかかっていて、スマホ（375px）で右の列＝料金が画面の外に出ていた。
   記事の中の表は2列が44個・3列が20個で、2列は全部この状態だった（実測）。
   **中元さんの決めごと「1列を約10文字ぶん」はそのまま。**560px はその3列ぶんの数字なので、
   2列のときは外して、画面の幅に収める（セルの 10em / 4.5em が下限として残る）。
   収まらないほど長い中身なら、.table-wrap の横スクロールがこれまでどおり効く。
   3列以上は横スクロールのまま（詰めると読めなくなる） */
.table-wrap.cols-2 table{min-width:0}
/* 画面の幅に収めると、左の列が 4.5em まで縮んで「料金が変／わる主な／理由」と3行に折り返した（375pxで目視）。
   2列のときだけ左の列の下限を上げる。**上限ではないので、中身が長い表はこれまでどおり広がる。**
   下限を足しても 6.5em＋10em＋余白＝約297px で、375pxには収まる */
.table-wrap.cols-2 th:first-child,.table-wrap.cols-2 td:first-child{min-width:6.5em}
th,td{border-bottom:1px solid var(--hairline);padding:12px 14px;text-align:left;min-width:10em}
/* 2026-09-14：左の列の見出しが空の「選べる」表で、「費用」「手間」が1文字ずつ縦に折り返していた（Chromeで目視）。最小の幅だけ持たせる。nowrap にすると長い行の表がスマホではみ出すので使わない */
th:first-child,td:first-child{min-width:4.5em}
tr:last-child td{border-bottom:0}
th{background:var(--canvas);font-weight:600;color:var(--ink-900)}

/* メモ */
.toc{background:var(--canvas);border:1px solid var(--hairline);border-radius:var(--r);padding:16px 20px;margin:0 0 26px}
.toc>b{display:block;margin-bottom:8px;font-size:13px;color:var(--accent);letter-spacing:.02em}
.toc ol{margin:0;padding-left:1.3em}
.toc li{font-size:14.5px;line-height:1.9}
.toc a{color:var(--ink-700);text-decoration:none;border-bottom:1px solid var(--hairline)}
.toc a:hover{color:var(--accent)}
.douga{display:flex;gap:16px;align-items:flex-start;margin:30px 0 22px;padding:14px;background:var(--canvas);border:1px solid var(--hairline);border-radius:var(--r)}
.douga-play,.douga iframe{flex:0 0 auto;width:min(200px,42vw);aspect-ratio:9/16;border:0;border-radius:var(--r);overflow:hidden;background:#111}
.douga-play{position:relative;padding:0;cursor:pointer;display:block}
.douga-play img{width:100%;height:100%;object-fit:cover;display:block}
.douga-maru{position:absolute;left:50%;top:50%;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;background:rgba(0,0,0,.62)}
.douga-maru::after{content:'';position:absolute;left:22px;top:17px;border-style:solid;border-width:11px 0 11px 18px;border-color:transparent transparent transparent #fff}
.douga-play:hover .douga-maru,.douga-play:focus-visible .douga-maru{background:#c4302b}
.douga-text{min-width:0;font-size:14.5px;line-height:1.8}
.douga-text>b{display:block;font-size:13px;color:var(--accent);margin-bottom:4px}
.douga-text p{margin:0 0 8px}
.douga-name{font-weight:700;color:var(--ink-900,inherit)}
.douga-yt a{color:var(--accent)}
.douga-jisha{margin:22px 0 26px}
.douga-jisha video{display:block;width:100%;aspect-ratio:16/9;border-radius:var(--r);background:#111;border:1px solid var(--hairline)}
.douga-jisha figcaption{font-size:13.5px;line-height:1.7;color:var(--ink-500);margin-top:8px}
.douga-jisha figcaption b{color:var(--ink-900,inherit)}
.note{background:var(--canvas);border:1px solid var(--hairline);border-radius:var(--r);padding:18px 20px;margin:0 0 26px}
.note>strong,.note>b{display:block;margin-bottom:6px;font-size:13px;color:var(--accent);letter-spacing:.02em}.note p strong,.note p b{color:var(--ink-900);font-weight:700}
.note p{margin:0;font-size:14.5px;color:var(--ink-600)}

/* よくある質問 */
/* 2026-10-29：線で区切るだけだった質問を、1問ずつの札にする。Q と A に色をつけて、流し読みでも拾えるように */
.faq-item{background:var(--surface);border:1px solid var(--hairline);border-radius:var(--r);padding:16px 18px;margin:0 0 12px}
.faq-q{font-weight:700;color:var(--ink-900);margin:0 0 8px}
.faq-a{margin:0;color:var(--ink-600);font-size:15px}
.qa{font-weight:700;color:var(--accent)}
.faq-a .qa{color:var(--ink-500)}

/* 相談への誘い */
.soudan{border:1px solid var(--hairline);border-left:3px solid var(--accent);border-radius:var(--r);padding:14px 16px;margin:16px 0 28px}
.soudan p{margin:0 0 8px;font-size:14.5px;color:var(--ink-600)}
.soudan-link{display:inline-block;font-size:14.5px;font-weight:700;color:var(--accent);text-decoration:underline;text-underline-offset:3px;padding:6px 0}
/* 2026-10-29：相談の箱だけ、淡い琥珀の面にする（目立たせるのはページで1か所＝ここ）。
   見積もりの紙を持つキャラを右に立たせ、足を箱の下の線にそろえる */
.cta-box{background:var(--accent-soft);border:1px solid var(--accent-line);border-radius:var(--r);padding:28px 24px;margin:44px 0}
.cta-box.has-kyara{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"text kyara" "btns kyara";column-gap:20px;align-items:end}
.cta-text{grid-area:text}
.cta-box.has-kyara .cta-buttons{grid-area:btns}
.cta-kyara{grid-area:kyara;display:block;width:auto;max-width:none;height:calc(var(--kh) * .44px);border-radius:0;margin-bottom:-29px}
.cta-heading{font-size:17px;font-weight:700;color:var(--ink-900);margin:0 0 8px;letter-spacing:-0.02em}
/* 淡い琥珀の上では ink-500 が 4.5:1 を切るので、一段濃く */
.cta-sub{font-size:13.5px;color:var(--ink-600);margin:0 0 20px}
@media (max-width:560px){
  .cta-box{padding:22px 18px}
  .cta-box.has-kyara{grid-template-areas:"text kyara" "btns btns";align-items:start}
  .cta-kyara{height:calc(var(--kh) * .24px);margin:0}
}
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
  background:rgba(15,23,42,.82);color:#fff;padding:3px 8px;border-radius:var(--r)}
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
.related-list h2{font-size:16px;margin:0 0 12px;color:var(--ink-900)}
/* 2026-10-29：題名だけの行から、写真つきの札に。パソコンは2列・スマホは1列 */
.related-list ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.related-list li{margin:0}
.related-list a{display:grid;grid-template-columns:104px minmax(0,1fr);gap:12px;align-items:start;height:100%;padding:10px;background:var(--surface);border:1px solid var(--hairline);border-radius:var(--r);color:var(--ink-900);text-decoration:none;font-size:14px;font-weight:600;line-height:1.6;transition:border-color .15s}
.related-list a:hover{border-color:var(--accent)}
.related-list a:hover .rel-title{color:var(--accent)}
.rel-thumb{display:block;aspect-ratio:1200/630;border-radius:var(--r);overflow:hidden;background:var(--hairline)}
.rel-thumb img{display:block;width:100%;height:100%;object-fit:cover;border-radius:0}
@media (max-width:560px){.related-list ul{grid-template-columns:minmax(0,1fr)}}

/* 伺う人（2026-10-29）。記事の終わりに、代表のキャラと資格。足を札の下の線にそろえる */
.daihyo{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:20px;align-items:end;background:var(--surface);border:1px solid var(--hairline);border-radius:var(--r);padding:20px 22px 0;margin:0 0 28px}
.daihyo-kyara{display:block;width:auto;max-width:none;height:calc(var(--kh) * .4px);border-radius:0}
.daihyo-text{padding-bottom:20px;min-width:0}
.daihyo-name{margin:0 0 6px;font-size:13px;color:var(--ink-500)}
.daihyo-name b{font-size:17px;color:var(--ink-900);margin-left:2px}
.daihyo-msg{margin:0 0 10px;font-size:14.5px;line-height:1.7;color:var(--ink-700)}
.daihyo-shikaku{list-style:none;margin:0 0 12px;padding:0;display:flex;flex-wrap:wrap;gap:6px}
.daihyo-shikaku li{margin:0;font-size:12px;line-height:1.6;padding:2px 8px;background:var(--canvas);border:1px solid var(--hairline);border-radius:var(--r);color:var(--ink-600)}
.daihyo-link{display:inline-block;padding:4px 0;font-size:14px;font-weight:700;color:var(--ink-900);text-underline-offset:3px}
.daihyo-link:hover{color:var(--accent)}
@media (max-width:560px){
  .daihyo{column-gap:14px;padding:16px 16px 0}
  .daihyo-kyara{height:calc(var(--kh) * .28px)}
  .daihyo-text{padding-bottom:16px}
}

/* フッター */
footer.site{background:var(--ink-900);color:rgba(255,255,255,.6);padding:40px 0;font-size:13px;line-height:1.9}
footer.site .wrap{max-width:720px}
footer.site p{margin:0 0 6px}
footer.site a{color:rgba(255,255,255,.85);text-decoration:none}
footer.site a:hover{color:#fff}

/* 記事一覧 */
.svc-desc{font-size:13px;color:var(--ink-500)}
.svc-nav{margin:0 0 8px;padding:16px 18px;border:1px solid var(--line, #e5e7eb);border-radius:8px}
.svc-nav h2{border:0;padding:0;margin:0 0 10px;font-size:14px;color:var(--ink-500);font-weight:500}
.svc-nav ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:8px 10px}
.svc-nav a{display:inline-block;padding:6px 12px;border:1px solid var(--line, #e5e7eb);border-radius:var(--r);
  font-size:13.5px;color:var(--ink-900);text-decoration:none}
.svc-nav a:hover{border-color:var(--ink-900)}
/* ── ブログ一覧（2026-10-29 作り直し）──
   中元さん「シンプルすぎて味気ない。新聞みたい」。
   ・仕事ごとのまとめ＝その仕事をしているキャラの札
   ・いちばん新しい1本を大きく、残りは写真つきの札（パソコン3列・スマホは写真を左に置いた1列） */
.wrap.wide{max-width:1000px}
.svc-nav.tiles{border:0;padding:0;margin:0 0 44px}
.svc-nav.tiles h2{font-size:15px;color:var(--ink-900);font-weight:700;margin:0 0 12px}
.svc-nav.tiles ul{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
@media (min-width:900px){.svc-nav.tiles ul{grid-template-columns:repeat(5,minmax(0,1fr))}}
.svc-nav.tiles a{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:8px;height:100%;min-height:140px;
  padding:12px 8px 12px;background:var(--surface);border:1px solid var(--hairline);border-radius:var(--r);
  font-size:13.5px;font-weight:600;line-height:1.5;text-align:center;color:var(--ink-900);transition:border-color .15s;
  word-break:keep-all;overflow-wrap:anywhere}
.svc-nav.tiles a:hover{border-color:var(--accent);color:var(--accent)}
.tile-kyara{display:block;width:auto;max-width:none;height:calc(var(--kh) * .54px);border-radius:0}
@media (max-width:560px){
  .svc-nav.tiles ul{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  .svc-nav.tiles a{flex-direction:row;justify-content:flex-start;align-items:center;min-height:64px;padding:6px 10px;text-align:left;gap:10px;font-size:13px}
  .tile-kyara{height:calc(var(--kh) * .34px)}
}
.index-list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:36px 24px}
.index-list li{margin:0}
.index-list a{display:flex;flex-direction:column;gap:12px;text-decoration:none;color:var(--ink-700)}
.index-list .is-new{grid-column:1/-1}
.index-list .is-new a{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:32px;align-items:center;padding-bottom:36px;border-bottom:1px solid var(--hairline)}
.index-list .is-new h2{font-size:24px;line-height:1.5}
.index-list .is-new p{-webkit-line-clamp:4}
.index-thumb{display:block;border-radius:var(--r);overflow:hidden;background:var(--hairline);aspect-ratio:1200/630}
.index-thumb img{width:100%;height:100%;object-fit:cover;display:block;border-radius:0}
.index-text{display:block;min-width:0}
.index-meta{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px}
.index-cat{font-size:12px;font-weight:600;line-height:1.6;color:var(--accent);background:var(--accent-soft);border:1px solid var(--accent-line);border-radius:var(--r);padding:1px 8px}
.index-list a:hover h2{color:var(--accent)}
.index-list h2{border:0;margin:8px 0 6px;font-size:17px;line-height:1.55;padding:0;transition:color .15s}
.index-list p{color:var(--ink-500);font-size:13.5px;line-height:1.75;margin:0;
  display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}
.index-date{font-size:12px;color:var(--ink-500);font-variant-numeric:tabular-nums}
@media (max-width:760px){
  .index-list{grid-template-columns:minmax(0,1fr);gap:0}
  .index-list li{border-top:1px solid var(--hairline)}
  .index-list li:last-child{border-bottom:1px solid var(--hairline)}
  .index-list a{display:grid;grid-template-columns:112px minmax(0,1fr);gap:14px;align-items:start;padding:18px 0}
  .index-list li.is-new{border-top:0}
  .index-list .is-new a{grid-template-columns:minmax(0,1fr);gap:12px;padding:0 0 22px;border-bottom:0}
  .index-list .is-new h2{font-size:20px}
  .index-list h2{font-size:16px;margin:6px 0 4px}
  .index-list p{-webkit-line-clamp:2}
}

@media(max-width:480px){.hero{padding:40px 0 32px}.wrap{padding:0 18px}main{padding:36px 0 12px}}
@media (prefers-reduced-motion: reduce){*{transition-duration:.01ms !important}}
`;

// Google アナリティクス（GA4）。トップ（index.html）と同じ測定ID・同じ書き方（2026-10-19）。
// ── 記事に差し込む YouTube のショート動画（2026-10-20）──
// 元は content/douga.json（ネタ帳から ~/.fukkaru/douga/kiji_douga.py で写す。id は blog.py が RSS で埋める）。
// **記事のファイルには書かない。**組み立てるときに差し込むので、書き直し（kakinaoshi）が消すこともない。
// 1ページに1本だけ。kiji に名前がある記事が先、次に「題名に area と kotoba の言葉がある記事」（新しい記事にも自動で入る）。
// 置き場所は LINE の案内（cta）のすぐ上。読み終えた人に「動画でも」→「LINEで相談」と続ける。
// 軽くするため、最初は絵だけ。押したときに初めて YouTube を読み込む。押した数は GA4 の douga_saisei で数える
const DOUGA_FILE = path.join(ROOT, 'content', 'douga.json');
const DOUGA = (() => {
  try {
    return (JSON.parse(fs.readFileSync(DOUGA_FILE, 'utf8')).douga || []).filter(
      (v) => v && /^[A-Za-z0-9_-]{11}$/.test(v.youtube || '')
    );
  } catch {
    return [];
  }
})();

// ── HP に置いた動画（YouTube に上げていない動画）を、決めた記事にだけ差し込む（2026-10-21）──
// 元は content/douga_jisha.json。kiji の記事で、ato の言葉を含む見出しのすぐ下に入れる（無ければ LINE の案内の上）。
// 中元さん「空き家の記事に第1版の動画を良い箇所に添付しといて」「記事上のみで良いです」
// 軽くするため preload="none"（押すまで読みこまない）。押した数は GA4 の douga_jisha_saisei で数える
const JISHA_FILE = path.join(ROOT, 'content', 'douga_jisha.json');
const JISHA = (() => {
  try {
    return (JSON.parse(fs.readFileSync(JISHA_FILE, 'utf8')).douga || []).filter(
      (v) => v && /^\/douga\/[a-z0-9-]+\.mp4$/.test(v.mp4 || '') && fs.existsSync(path.join(ROOT, 'public', v.mp4))
    );
  } catch {
    return [];
  }
})();
function jishaFor(doc) {
  return JISHA.find((v) => (v.kiji || []).includes(doc.slug)) || null;
}
function jishaAt(blocks, v) {
  const i = blocks.findIndex((b) => (b.type === 'h2' || b.type === 'h3') && v.ato && String(b.text || '').includes(v.ato));
  return i >= 0 ? i : -1;
}
function renderJisha(v, slug) {
  return `
  <figure class="douga-jisha">
    <video controls playsinline preload="none" poster="${esc(v.poster || '')}" data-kiji="${esc(slug)}" aria-label="${esc(v.title || '動画')}" onplay="if(!this.dataset.on){this.dataset.on='1';window.gtag&&gtag('event','douga_jisha_saisei',{kiji:this.dataset.kiji,douga:'${esc(v.mp4)}'})}">
      <source src="${esc(v.mp4)}" type="video/mp4">
    </video>
    <figcaption><b>${esc(v.title || '')}</b>${v.setsumei ? `　${esc(v.setsumei)}` : ''}</figcaption>
  </figure>`;
}

function dougaFor(doc, { jidou = true } = {}) {
  const meishi = DOUGA.find((v) => (v.kiji || []).includes(doc.slug));
  if (meishi) return meishi;
  if (!jidou) return null;
  const t = String(doc.title || '');
  return (
    DOUGA.find(
      (v) => (v.kotoba || []).length && (!v.area || t.includes(v.area)) && v.kotoba.some((k) => k && t.includes(k))
    ) || null
  );
}

function dougaName(v) {
  // YouTube の題名から「#Shorts」と（くらしの豆知識）を外して、見出しに使う
  return String(v.title || v.topic).replace(/\s*#Shorts\s*$/i, '').replace(/（くらしの豆知識）$/, '').split('｜')[0];
}

function renderDouga(v, slug) {
  const id = esc(v.youtube);
  const name = dougaName(v);
  return `
  <aside class="douga" aria-label="関連する動画">
    <button type="button" class="douga-play" data-yt="${id}" data-no="${esc(v.no || '')}" data-kiji="${esc(slug)}" aria-label="動画を再生する：${esc(name)}">
      <img src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${id}/hqdefault.jpg'" alt="" loading="lazy" decoding="async" width="405" height="720">
      <span class="douga-maru" aria-hidden="true"></span>
    </button>
    <div class="douga-text">
      <b>動画でも見られます</b>
      <p class="douga-name">${esc(name)}</p>
      ${v.setsumei ? `<p>${esc(v.setsumei)}</p>` : ''}
      <p class="douga-yt"><a href="https://www.youtube.com/shorts/${id}" target="_blank" rel="noopener">YouTubeで見る</a>（約1分のショート動画）</p>
    </div>
  </aside>`;
}

const DOUGA_SCRIPT = `<script>
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('.douga-play');if(!b||b.dataset.on)return;b.dataset.on='1';
  var f=document.createElement('iframe');
  f.src='https://www.youtube-nocookie.com/embed/'+b.dataset.yt+'?autoplay=1&playsinline=1&rel=0';
  f.title=b.getAttribute('aria-label');f.allow='autoplay; encrypted-media; picture-in-picture';f.allowFullscreen=true;
  b.replaceWith(f);
  if(window.gtag)gtag('event','douga_saisei',{douga_id:b.dataset.yt,douga_no:b.dataset.no,kiji:b.dataset.kiji});
});
</script>`;

function dougaLd(v, slug) {
  const d = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: dougaName(v),
    description: v.setsumei || dougaName(v),
    thumbnailUrl: [`https://i.ytimg.com/vi/${v.youtube}/maxresdefault.jpg`, `https://i.ytimg.com/vi/${v.youtube}/hqdefault.jpg`],
    uploadDate: v.uploadDate,
    contentUrl: `https://www.youtube.com/shorts/${v.youtube}`,
    embedUrl: `https://www.youtube.com/embed/${v.youtube}`,
    publisher: { '@type': 'Organization', name: SITE_NAME },
  };
  return `<script type="application/ld+json">${JSON.stringify(d)}</script>`;
}

// 記事のページに入っていなかったので、記事ごとの読まれ方が GA4 に1つも出ていなかった（pagePath は「/」だけ）
const GA4_TAG = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Z092NPG2MW"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-Z092NPG2MW');
</script>`;

function pageShell({ title, description, canonical, ogType, extraHead, bodyHtml, ogImage }) {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${GA4_TAG}
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
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet"></noscript>
<meta name="theme-color" content="#F8FAFC">
<style>${PAGE_CSS}</style>
${extraHead || ''}
</head>
<body>
<div class="page">
<header class="site">
  <div class="wrap">
    <a class="brand" href="/"><img class="brand-logo" src="/kyara/logo.webp" alt="" width="28" height="28">フッ軽<span>ふっかる</span></a>
    <a class="backlink" href="/">← トップページへ</a>
  </div>
</header>
${bodyHtml}
<footer class="site">
  <div class="wrap">
    <p>フッ軽合同会社（フッ軽／ふっかる）— 静岡県富士市の地域密着住まいレスキュー</p>
    <p>対応エリア：静岡県全域／山梨県全域／神奈川県海老名市以西</p>
    <p>新築・建て替え・リフォーム・外壁や屋根の塗装のご相談も承ります。お話を伺い、信頼できる会社におつなぎします。</p>
    <p><a href="/">トップページ</a> ｜ <a href="/blog/">ブログ一覧</a> ｜ <a href="${LINE_URL}" target="_blank" rel="noopener">公式LINE</a> ｜ <a href="/privacy/">プライバシーポリシー</a></p>
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
  // 2026-10-29：題名だけの行から、写真つきの札に（読みたくなる見た目に）
  const items = rel
    .map((a) => `<li><a href="/blog/${esc(a.slug)}/">${a.heroImage ? `<span class="rel-thumb"><img src="${esc(a.heroImage)}" alt="" loading="lazy"></span>` : ''}<span class="rel-title">${esc(a.title)}</span></a></li>`)
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
  // 目次は導入のあと、最初の h2 の直前（2026-09-14）。
  // 以前は lead の直後で、導入（結論・料金の目安・分かること）より先に目次が出ていた。
  // h2 が無い記事は、これまでどおり lead の直後
  const regularCare = /見回り|見守り|巡回清掃|共用部|月額/.test([article.title, article.metaDescription, ...(article.keywords || [])].join(' '));
  const blocksWithIds = withDekinaiSoudan(withIds(article.blocks));
  const toc = renderToc(blocksWithIds);
  const firstH2 = blocksWithIds.findIndex((b) => b.type === 'h2');
  const firstP = firstH2 >= 0 ? firstH2 : blocksWithIds.findIndex((b) => b.type !== 'lead');
  const douga = dougaFor(article);
  const ctaAt = blocksWithIds.findIndex((b) => b.type === 'cta');
  const jisha = jishaFor(article);
  const jishaI = jisha ? jishaAt(blocksWithIds, jisha) : -1;
  const bodyBlocks = blocksWithIds
    .map((b, i) => (i === firstP && toc ? toc + '\n' : '') + (douga && i === ctaAt ? renderDouga(douga, article.slug) + '\n' : '') + (jisha && jishaI < 0 && i === ctaAt ? renderJisha(jisha, article.slug) + '\n' : '') + renderBlock(b, regularCare) + (jisha && i === jishaI ? '\n' + renderJisha(jisha, article.slug) : ''))
    .join('\n') + (douga && ctaAt < 0 ? renderDouga(douga, article.slug) : '');
  const dateStr = article.publishDate;
  // 写真は別レイヤーに置いて薄くする。グラデーションの膜はかけない。
  // 2026-10-29：分類に合う姿のキャラを右下に立たせる
  const bodyHtml = `${renderHero({
    cat: esc(article.category || 'コラム'),
    title: esc(article.title),
    meta: `公開日: ${esc(dateStr)}${article.updatedDate && article.updatedDate !== dateStr ? ` ／ 更新日: ${esc(article.updatedDate)}` : ''}`,
    bg: article.heroImage || '',
    kyara: kyaraForCategory(article.category),
  })}
<main>
  <div class="wrap">
    ${bodyBlocks}
  </div>
</main>
<div class="article-footer wrap">
  ${renderDaihyo()}
  ${pillar ? `<div class="to-pillar"><b>この地域のまとめ</b><a href="/${esc(pillar.basePath || 'blog')}/${esc(pillar.slug)}/">${esc(pillar.title)}</a></div>` : ''}
  ${renderRelated(article, all)}
  <p class="related"><a href="/blog/">← ブログ一覧へ戻る</a></p>
</div>`;
  return pageShell({
    title: `${article.title}｜${SITE_NAME}`,
    description: article.metaDescription,
    canonical: articleUrl(article.slug),
    ogType: 'article',
    extraHead: jsonLd(article) + (douga ? '\n' + dougaLd(douga, article.slug) + '\n' + DOUGA_SCRIPT : ''),
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
// articleMatch：題名に含む言葉で束ねる（2026-10-23 アンカー固定）。
// 物置の記事のうち「アンカー」の記事だけを、物置の柱ではなくこちらへ。
const matchesPillar = (p, a) => !!p.articleMatch && (a.title || '').includes(p.articleMatch);

function pillarArticles(pillar, articles) {
  if (pillar.articleMatch) return articles.filter((a) => matchesPillar(pillar, a));
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
  // 2026-09-15：柱ページだけ相談枠を置く処理を通っていなかった（「引き取りができません」があるのに0か所）
  const pb = withDekinaiSoudan(withIds(pillar.blocks));
  const ptoc = renderToc(pb);
  const pFirst = pb.findIndex((b) => b.type !== 'lead');
  const douga = dougaFor(pillar, { jidou: false });
  const pCta = pb.findIndex((b) => b.type === 'cta');
  const body = pb
    .map((b, i) => (i === pFirst && ptoc ? ptoc + '\n' : '') + (douga && i === pCta ? renderDouga(douga, pillar.slug) + '\n' : '') + renderBlock(b))
    .join('\n') + (douga && pCta < 0 ? renderDouga(douga, pillar.slug) : '');
  const bodyHtml = `${renderHero({
    cat: 'まとめ',
    title: esc(pillar.title),
    meta: `更新日: ${esc(new Date().toISOString().slice(0, 10))}`,
    bg: pillar.heroImage || '',
    kyara: KYARA_BY_PILLAR[pillar.slug] || kyaraForCategory((pillar.articleCategories || [])[0]),
  })}
<main>
  <div class="wrap">
    ${body}
    ${renderPillarBody(pillar, articles)}
  </div>
</main>
<div class="article-footer wrap">
  ${renderDaihyo()}
  <p class="related"><a href="/blog/">← ブログ一覧へ戻る</a></p>
</div>`;
  return pageShell({
    title: `${pillar.title}｜${SITE_NAME}`,
    description: pillar.metaDescription,
    canonical: pageUrl(pillar.basePath || 'blog', pillar.slug),
    ogType: 'article',
    extraHead: jsonLd(pillar) + (douga ? '\n' + dougaLd(douga, pillar.slug) + '\n' + DOUGA_SCRIPT : ''),
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

// ── サービス一覧のページ（/service/）2026-09-04 ──
// トップの「サービスと料金」は JavaScript の中にあり、Google からは読めない
// （2026-09-04 の実測：トップの body の中身は556文字しかない）。
// **同じ中身を、機械にも読める静的なページとして置き直す。**
// 料金は components/Services.tsx から読むので、値の持ち場所は1つのまま。
const SERVICES_TSX = path.join(ROOT, 'components', 'Services.tsx');

function readServiceGroups() {
  if (!fs.existsSync(SERVICES_TSX)) return [];
  const src = fs.readFileSync(SERVICES_TSX, 'utf8');
  const groups = [];
  // note と services のあいだに defaultOpen などが入る分類がある。まとめて飛ばす
  const gRe = /\{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*note:\s*'([^']*)',[\s\S]*?services:\s*\[([\s\S]*?)\n\s*\],/g;
  let g;
  while ((g = gRe.exec(src))) {
    const services = [];
    const sRe = /\{\s*title:\s*'([^']+)',\s*price:\s*'([^']+)',\s*desc:\s*'([^']*)'([^}]*)\}/g;
    let m;
    while ((m = sRe.exec(g[4]))) {
      const tail = m[4] || '';
      const link = (tail.match(/link:\s*'([^']+)'/) || [])[1] || '';
      services.push({ title: m[1], price: m[2], desc: m[3], link });
    }
    // hidden: true の分類は一覧ページに出さない（金額の弁のためにデータは残す）
    if (/hidden:\s*true/.test(g[0].slice(0, g[0].indexOf('services:')))) continue;
    if (services.length) groups.push({ title: g[2], note: g[3], services });
  }
  return groups;
}

// /service/ のよくある質問（2026-09-21）。
// **この一覧ページは、内側からのリンクがサイトで最多（54本）なのに検索結果に入っていなかった。**
// 原因は「そのページだけの中身が608字しかない」こと。表と料金だけで、読ませる文章が無かった。
const SERVICE_FAQ = [
  ['ここに載っていない作業も頼めますか？',
   'まずお聞かせください。載せているのはよくいただくご依頼で、これがすべてではありません。お受けできるかどうかを、その場でお答えします。'],
  ['小さな用事ひとつでも頼めますか？',
   '頼めます。棚をひとつ組み立てるだけ、重いものをとなりの部屋に動かすだけ、という頼み方でかまいません。'],
  ['見積もりにお金はかかりますか？',
   '公式LINEに写真を送っていただくお見積りは、地域を問わず無料です。現地に伺う出張費は、富士市・富士宮市・静岡市・沼津市ならいただきません。'],
  ['料金は、何で決まりますか？',
   '作業の量・広さ・場所の条件で変わります。写真を見ておおよその金額をお伝えし、ご納得いただいてから始めます。当日に作業が増えそうなときは、始める前にお伝えします。'],
  ['どこまで来てもらえますか？',
   '静岡県全域・山梨県全域・神奈川県海老名市以西です。それ以外の地域もご相談ください。'],
  ['誰が来ますか？',
   'お問い合わせをお受けした代表が、そのまま当日の作業をします。写真で伺ったことが、途中で消えません。'],
  ['作業中に物を傷つけたときは、どうなりますか？',
   '損保ジャパンの保険に加入しています。万一のときは、まずご連絡ください。'],
];

function renderServiceIndex(groups, pillars) {
  const tables = groups.map((g) => `
  <h2 id="${esc(g.title)}">${esc(g.title)}</h2>
  <p>${esc(g.note)}</p>
  <div class="table-wrap cols-2"><table><thead><tr><th>やること</th><th>料金</th></tr></thead><tbody>
    ${g.services.map((s) => `<tr><td>${esc(s.title)}${s.link ? ` <a href="${esc(s.link)}">くわしく</a>` : ''}<br><span class="svc-desc">${esc(s.desc)}</span></td><td>${esc(s.price)}</td></tr>`).join('\n    ')}
  </tbody></table></div>`).join('\n');

  const nav = pillars.length ? `
  <nav class="svc-nav" aria-label="仕事ごとの詳しい説明">
    <h2>仕事ごとの詳しい説明</h2>
    <ul>
      ${pillars.map((p) => `<li><a href="/${esc(p.basePath || 'blog')}/${esc(p.slug)}/">${esc(p.navTitle || p.title.split('｜')[0])}</a></li>`).join('\n      ')}
    </ul>
  </nav>` : '';

  const bodyHtml = `${renderHero({
    cat: 'サービス',
    title: 'できることと料金｜富士市の便利屋フッ軽',
    meta: '草むしり8,000円〜／家具の組み立て8,000円〜／物置の設置・解体15,000円〜／不用品の運搬・買取5,000円〜',
    kyara: 'mitsumori',
  })}
<main>
  <div class="wrap">
    <p class="lead">静岡県富士市の便利屋です。ご相談から作業当日まで、**代表が最初から最後まで担当します**。ここに載っていない作業も、できるかぎりお受けします。まずは「こんなこと頼める？」とお声がけください。</p>
    <ul>
      <li>**LINEで写真を送っていただくお見積りは、エリアを問わず無料です。**</li>
      <li>現地に伺う出張費は、富士市・富士宮市・静岡市・沼津市ならいただきません。</li>
      <li>公式LINEにご登録のうえご成約いただくと、**最大3,000円割引**になります。</li>
      <li>作業前にお見積りをお出しし、ご納得いただいてから始めます。</li>
    </ul>
    ${nav}
    ${tables}
    <h2 id="nagare">頼んでから、終わるまで</h2>
    <p>公式LINEに、困っているところの写真を送ってください。文字だけでもかまいません。</p>
    <p>写真を見て、おおよその金額と、かかる時間をお伝えします。<strong>ここまでは、地域を問わず無料です。</strong></p>
    <p>金額にご納得いただいてから、日にちを決めます。当日に作業が増えそうなときは、始める前にお伝えします。</p>
    <p>お問い合わせをお受けした代表が、そのまま当日の作業をします。写真で伺ったことが、途中で消えません。</p>
    <h2 id="ryokin">金額が変わるところ</h2>
    <p>どの作業も「○○円〜」と書いてあるのは、作業の量・広さ・場所の条件で変わるためです。</p>
    <p>たとえば家具なら大きさと数、物置なら地面の状態、草刈りなら草の量。<strong>写真を見てお伝えしますので、頼む前に金額が分かります。</strong></p>
    <h2 id="area">伺える範囲と、万一のとき</h2>
    <p>対応エリアは、静岡県全域・山梨県全域・神奈川県海老名市以西です。現地に伺う出張費は、富士市・富士宮市・静岡市・沼津市ならいただきません。</p>
    <p>損保ジャパンの保険に加入しています。万一のときは、まずご連絡ください。</p>
    <h2 id="faq">よくいただくご質問</h2>
    <div class="faq">${SERVICE_FAQ.map(([q, a]) => `<div class="faq-item"><p class="faq-q"><span class="qa">Q.</span> ${esc(q)}</p><p class="faq-a"><span class="qa">A.</span> ${esc(a)}</p></div>`).join('')}</div>
    <div class="note"><b>手放したいものについて</b><p><b>まだ使えるものは引き取ります</b>（古物商許可）。ごみとして出すぶんは、<b>許可を持つ回収業者と一緒に</b>片付けます。フッ軽が間に入って段取りしますので、業者を別に探していただく必要はありません。ご自身で出される場合は、<b>自治体での出し方をご案内します</b>。迷ったらLINEでご相談ください。</p></div>
  </div>
</main>
<div class="article-footer wrap">
  <p class="related"><a href="/">← トップページへ</a></p>
</div>`;
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SERVICE_FAQ.map(([q, a]) => ({
      '@type': 'Question', name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
  return pageShell({
    extraHead: `<script type="application/ld+json">${JSON.stringify(faqLd)}</script>`,
    title: `できることと料金｜${SITE_NAME}`,
    description: '富士市の便利屋フッ軽のサービスと料金の一覧です。草むしり8,000円〜、家具の組み立て8,000円〜、物置の設置・解体15,000円〜、不用品の運搬・買取5,000円〜。LINEで写真を送るだけのお見積りは無料です。',
    canonical: `${SITE_URL}${SVC_PATH}`,
    ogType: 'website',
    bodyHtml: bodyHtml.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'),
  });
}

function renderIndexPage(articles, pillars = []) {
  // 2026-10-29：いちばん新しい1本を大きく、残りは写真つきの札を並べる（パソコンは3列・スマホは1列）。
  // 札には分類を出す。上の4枚は画面に最初から見えるので、遅れて読み込ませない
  const items = articles
    .slice()
    .sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1))
    .map(
      (a, i) => `<li${i === 0 ? ' class="is-new"' : ''}><a href="/blog/${esc(a.slug)}/">
        ${a.heroImage ? `<span class="index-thumb"><img src="${esc(a.heroImage)}" alt=""${i < 4 ? '' : ' loading="lazy"'}></span>` : '<span class="index-thumb"></span>'}
        <span class="index-text">
          <span class="index-meta"><span class="index-cat">${esc(a.category || 'コラム')}</span><span class="index-date">${esc(a.publishDate)}</span></span>
          <h2>${esc(a.title)}</h2>
          <p>${esc(a.metaDescription)}</p>
        </span>
      </a></li>`
    )
    .join('\n');
  // 仕事ごとのまとめは、その仕事をしているキャラの札にする。
  // 札は幅が狭いので、折り返しは「・」のあとで（「移／設」のように言葉の途中で折れていた）。
  // 「・」の無い名前は、最初の「の」のあとで（スマホで「物置のアンカー固／定」になっていた）
  const oriKaeshi = (s) => (s.includes('・') ? s.replace(/・/g, '・<wbr>') : s.replace('の', 'の<wbr>'));
  const tile = (href, label, kyara) =>
    // 札の絵は1枚6KBほどで、一覧のすぐ上にあるので後回しにしない（遅らせると、スクロールしたとき空の札が一瞬見えた）
    `<li><a href="${href}">${kyaraImg(kyara, 'tile-kyara', { small: true, eager: true })}<span>${oriKaeshi(label)}</span></a></li>`;
  const bodyHtml = `${renderHero({
    cat: 'BLOG',
    title: 'フッ軽ブログ｜富士市の暮らしのお役立ち情報',
    meta: '家具組立・物置設置・お片付けなど、暮らしのプロが実例と費用相場を解説します',
    kyara: 'waving',
    wide: true,
  })}
<main>
  <div class="wrap wide">
    ${pillars.length ? `<nav class="svc-nav tiles" aria-label="仕事ごとのまとめ">
      <h2>仕事ごとのまとめ</h2>
      <ul>
        ${tile(SVC_PATH, 'できることと料金', 'mitsumori')}
        ${pillars.map((p) => tile(`/${esc(p.basePath || 'blog')}/${esc(p.slug)}/`, esc(p.navTitle || p.title.split('｜')[0]), KYARA_BY_PILLAR[p.slug] || kyaraForCategory((p.articleCategories || [])[0]))).join('\n        ')}
      </ul>
    </nav>` : ''}
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

// ── 「ページが見つかりません」（2026-10-02）──
// それまでは firebase.json の rewrites（"**" → /index.html）で、**無いURLでもトップページが200で返っていた**
// （ソフト404）。Google から見ると「どんなURLでも同じ中身を返すサイト」になる。
// rewrites を外すと Firebase は dist/404.html を 404 で返すので、行き止まりにしない画面を置く
function render404Page(pillars = []) {
  const bodyHtml = `${renderHero({
    cat: '404',
    title: 'ページが見つかりませんでした',
    meta: 'お探しのページは、移動したか、まだ無いページです',
    kyara: 'atama_kaku',
  })}
<main>
  <div class="wrap">
    <p>お手数ですが、下のどれかからお進みください。</p>
    <div class="cta-buttons" style="margin-bottom:28px">
      <a class="btn btn-outline" href="/">トップページへ</a>
      <a class="btn btn-outline" href="${SVC_PATH}">できることと料金</a>
      <a class="btn btn-outline" href="/blog/">ブログ一覧</a>
    </div>
    ${pillars.length ? `<nav class="svc-nav" aria-label="仕事ごとのまとめ">
      <h2>仕事ごとのまとめ</h2>
      <ul>
        ${pillars.map((p) => `<li><a href="/${esc(p.basePath || 'blog')}/${esc(p.slug)}/">${esc(p.navTitle || p.title.split('｜')[0])}</a></li>`).join('\n        ')}
      </ul>
    </nav>` : ''}
    <div class="cta-box">
      <p class="cta-heading">ご相談は公式LINEへ</p>
      <p class="cta-sub">写真を1枚送っていただければ、お見積りをお出しします。</p>
      <div class="cta-buttons">
        <a class="btn btn-line" href="${LINE_URL}" target="_blank" rel="noopener">公式LINEで相談する</a>
      </div>
    </div>
  </div>
</main>`;
  return pageShell({
    title: `ページが見つかりませんでした｜${SITE_NAME}`,
    description: 'お探しのページは見つかりませんでした。トップページ・できることと料金・ブログ一覧からお進みください。',
    canonical: `${SITE_URL}/404.html`,
    ogType: 'website',
    extraHead: '<meta name="robots" content="noindex">',
    bodyHtml,
  });
}

function buildSitemap(articles, pillars = []) {
  // **いつ更新したかを、全部のURLに入れる（2026-09-24）。**
  // 2026-09-24 に Search Console の生の判定を読んだら、
  // **柱ページは一度もクロールされていなかった**（lastCrawlTime が無い）。
  // 柱ページとトップには lastmod が1つも無く、**9/21に文章を足したことが
  // Google には「何も変わっていない」ように見えていた。**
  // 記事（lastmod あり）は全部クロールされているのと対照的だった。
  const saishin = articles
    .map((a) => a.updatedDate || a.publishDate)
    .filter(Boolean)
    .sort()
    .pop();
  const hiduke = (x) => x.updatedDate || x.publishDate || saishin;
  const urls = [
    { loc: `${SITE_URL}/`, priority: '1.0', lastmod: saishin },
    { loc: `${SITE_URL}/blog/`, priority: '0.8', lastmod: saishin },
    { loc: `${SITE_URL}${SVC_PATH}`, priority: '0.9', lastmod: saishin },
    // 代表のプロフィール（2026-09-22 追加）。
    // サイトマップに無いあいだは、インデックスの道具からも見えなかった。
    { loc: `${SITE_URL}/profile.html`, priority: '0.6', lastmod: saishin },
    ...pillars.map((p) => ({ loc: pageUrl(p.basePath || 'blog', p.slug), priority: '0.9', lastmod: hiduke(p) })),
    ...articles.map((a) => ({ loc: articleUrl(a.slug), priority: '0.7', lastmod: hiduke(a) })),
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
<p><a href="${SVC_PATH}">できることと料金</a></p>
<p><a href="/blog/">記事の一覧を見る</a></p>
<p><a href="/profile.html">代表のプロフィール</a></p>
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
    pillars.find((p) => matchesPillar(p, a))
    || pillars.find((p) => (p.articleCategories || []).includes(a.category)) || null;

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

  fs.writeFileSync(path.join(BLOG_OUT_DIR, 'index.html'), renderIndexPage(articles, pillars), 'utf8');

  const svcGroups = readServiceGroups();
  if (svcGroups.length) {
    const svcDir = path.join(DIST_DIR, SVC_PATH);
    fs.mkdirSync(svcDir, { recursive: true });
    fs.writeFileSync(path.join(svcDir, 'index.html'), renderServiceIndex(svcGroups, pillars), 'utf8');
    console.log(`[build-blog] 生成: ${SVC_PATH}（${svcGroups.length}分類 / ${svcGroups.reduce((n, g) => n + g.services.length, 0)}項目）`);
  }

  fs.writeFileSync(path.join(DIST_DIR, '404.html'), render404Page(pillars), 'utf8');
  console.log('[build-blog] 生成: /404.html（無いURLのときに Firebase が404で返す画面）');

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

  if (midashiKeikoku.length) {
  console.log('');
  console.log(`[build-blog] ★見出しがおかしい箇所が ${midashiKeikoku.length} 件あります（出しはしましたが、直してください）`);
  for (const k of midashiKeikoku) console.log(`   ${k}`);
  console.log('');
}
console.log(`[build-blog] 完了: 記事${articles.length}件 + 一覧ページ + sitemap.xml`
    + (linked ? ' + トップのブログ導線' : ' ／ ★トップに導線を入れられませんでした'));
}

main();
