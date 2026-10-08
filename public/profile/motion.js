// 動きの設計（2026-10-08）
// **点が、線になり、仕組みになる。**主役は、名前の最後にあるオレンジの点です。
//   題字     … 読み込み画面が点へ縮み、名前が1字ずつ組み上がる
//   場面転換 … 次の場面が、見出しの点から丸く開く
//   動く図   … ご相談内容の4枚を1本の輪でつなぎ、同じ点が光になって回る
// 文章は1字も変えません。3Dが使えない端末・動きを減らす設定でも、本文はそのまま読めます
// （隠すのは、このファイルが動き出してから。読み込めなければ何も隠れません）。
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
  const inOut = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  // 動かすのは、動きを減らす設定でなく、要る仕組みがそろっているブラウザだけ
  const on = !reduced.matches && 'IntersectionObserver' in window && 'animate' in Element.prototype;
  const pausedByPage = () => document.body.classList.contains('motion-paused');

  // ── 題字：名前を1字ずつに分ける（読み上げは aria-label に任せる） ──
  const h1 = $('#hero-title');
  if (on && h1) {
    h1.setAttribute('aria-label', h1.textContent.trim());
    let n = 0;
    for (const line of [...h1.children]) {
      line.setAttribute('aria-hidden', 'true');
      for (const node of [...line.childNodes]) {
        if (node.nodeType !== 3) continue;
        const frag = document.createDocumentFragment();
        for (const ch of node.textContent) {
          const o = document.createElement('span'); o.className = 'mo-ch';
          const i = document.createElement('span'); i.className = 'mo-ch-i';
          i.style.setProperty('--i', n++); i.textContent = ch;
          o.append(i); frag.append(o);
        }
        node.replaceWith(frag);
      }
    }
  }

  // ── 見出しを行ごとに分ける（<br> で切る。点は最後の行に残す） ──
  const splitLines = h2 => {
    const lines = [[]];
    for (const node of [...h2.childNodes]) {
      if (node.nodeName === 'BR') lines.push([]); else lines[lines.length - 1].push(node);
    }
    h2.textContent = '';
    lines.forEach((nodes, i) => {
      const o = document.createElement('span'); o.className = 'mo-line';
      const inner = document.createElement('span'); inner.className = 'mo-line-i';
      inner.style.setProperty('--i', i); inner.append(...nodes);
      const dot = inner.querySelector('.orange-dot'); if (dot) dot.style.setProperty('--i', lines.length);
      o.append(inner); h2.append(o);
    });
  };

  if (on) {
    root.classList.add('mo-on');
    $$('#story h2, #business h2, .process h2, #contact h2').forEach(splitLines);
    // そろって現れるものに、順番（--i）を付ける
    const order = (els, start = 0) => els.forEach((el, i) => { el.dataset.mo = el.dataset.mo || 'rise'; el.style.setProperty('--i', start + i); });
    for (const head of $$('.biz-head')) { const t = $('.tape', head); if (t) t.dataset.mo = 'tape'; order($$(':scope > p', head), 3); }
    for (const grid of $$('.biz-grid')) order($$('.biz-card', grid));
    for (const b of $$('.biz-bottom')) order([...b.children]);
    order($$('.process .promise-items p')); $$('.process .promise-items p').forEach(p => { p.dataset.mo = 'step'; });
    const cc = $('.contact-copy');
    if (cc) { const t = $('.tape', cc); if (t) t.dataset.mo = 'tape'; order($$(':scope > p, :scope > a', cc), 3); }
    const seen = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) {
        const g = e.target; g.classList.add('is-seen'); seen.unobserve(g);
        setTimeout(() => $$('[data-mo]', g).forEach(el => el.removeAttribute('data-mo')), 2600);
      }
    }, { rootMargin: '0px 0px -14% 0px', threshold: .12 });
    $$('.biz-head, .biz-grid, .biz-bottom, .process, .contact-copy').forEach(el => { el.classList.add('mo-group'); seen.observe(el); });
  }

  // ── 題字の幕開け：読み込み画面が、名前の点へ縮む ──
  // fallback.js が読み込み画面を閉じるときに、ここを呼ぶ
  let introDone = false;
  const finishIntro = () => { introDone = true; root.classList.remove('mo-wait'); setTimeout(() => root.classList.remove('mo-play'), 4200); };
  if (on) root.classList.add('mo-wait');
  setTimeout(() => { if (!introDone) { root.classList.remove('mo-wait'); introDone = true; } }, 24000);   // 万一呼ばれなくても、本文は必ず出す
  window.profileIntro = (pre, animate) => {
    if (introDone) { pre.hidden = true; return; }
    const dot = $('.name-dot');
    const r = dot && dot.getBoundingClientRect();
    const usable = on && animate && r && r.width > 2 && r.top > 0 && r.bottom < innerHeight && scrollY < 40 && pre.animate;
    if (!usable) { pre.hidden = true; root.classList.remove('mo-wait'); introDone = true; return; }
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2, rad = r.width / 2;
    const far = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 24;
    for (const el of [...pre.children]) el.animate({ opacity: [1, 0] }, { duration: 320, easing: 'ease-out', fill: 'forwards' });
    window.profileCameraIntro?.();
    root.classList.add('mo-play');
    // 2色の幕：紺が先に縮み、オレンジが少し遅れて追いかけて、そのまま名前の点になる
    const disc = document.createElement('i'); disc.className = 'pre-iris'; disc.setAttribute('aria-hidden', 'true');
    const at = `${cx}px ${cy}px`, ease = 'cubic-bezier(.7,0,.2,1)';
    disc.style.clipPath = `circle(${far}px at ${at})`;
    document.body.append(disc);
    pre.animate({ clipPath: [`circle(${far}px at ${at})`, `circle(0px at ${at})`] }, { duration: 900, delay: 240, easing: ease, fill: 'forwards' });
    const close = disc.animate({ clipPath: [`circle(${far}px at ${at})`, `circle(${rad}px at ${at})`] }, { duration: 960, delay: 330, easing: ease, fill: 'forwards' });
    // 幕が閉じはじめてから、名前を立ち上げる
    setTimeout(() => root.classList.remove('mo-wait'), 520);
    const end = () => { pre.hidden = true; disc.remove(); finishIntro(); };
    close.finished.then(end).catch(end);
  };

  // ── 場面転換：次の場面が、丸い山になってせり上がる。てっぺんにオレンジの点が乗る ──
  // 山は、場面が画面に入ってくるにつれて平らになり、点は見出しの「.」に役目を渡して消える
  const caps = on ? $$('#story, #business').map(el => {
    const cap = document.createElement('i'); cap.className = 'scene-cap'; cap.setAttribute('aria-hidden', 'true');
    cap.append(document.createElement('b')); el.prepend(cap);
    return { el, cap, h: -1 };
  }) : [];
  let capQueued = false;
  const drawCaps = () => {
    capQueued = false;
    const vh = innerHeight, max = Math.min(150, innerWidth * .13);
    for (const c of caps) {
      const top = c.el.getBoundingClientRect().top;
      const p = clamp((vh - top) / (vh * .72));
      const h = top >= vh || top < -vh ? 0 : Math.round(max * Math.pow(1 - p, 1.6) * 10) / 10;
      if (h === c.h) continue;
      c.h = h; c.cap.style.height = h + 'px'; c.cap.style.setProperty('--dot', clamp(h / 18));
    }
  };
  if (caps.length) {
    const queue = () => { if (!capQueued) { capQueued = true; requestAnimationFrame(drawCaps); } };
    addEventListener('scroll', queue, { passive: true }); addEventListener('resize', queue); drawCaps();
  }

  // ── 上のメニュー：いまいる場所の印が、すべって移る ──
  const nav = $('.main-nav');
  if (on && nav) {
    const pill = document.createElement('i'); pill.className = 'nav-pill'; pill.setAttribute('aria-hidden', 'true'); nav.prepend(pill);
    const place = () => {
      const cur = $('a[aria-current]', nav);
      if (!cur) { pill.classList.remove('is-on'); return; }
      // 印は、メニュー全体に敷いた色を「いまいる場所」の形に切り抜いて見せる（幅を動かさないので軽い）
      const l = cur.offsetLeft, t = cur.offsetTop;
      pill.style.clipPath = `inset(${t}px ${nav.clientWidth - l - cur.offsetWidth}px ${nav.clientHeight - t - cur.offsetHeight}px ${l}px round 99px)`;
      pill.classList.add('is-on');
    };
    new MutationObserver(place).observe(nav, { attributes: true, subtree: true, attributeFilter: ['aria-current'] });
    addEventListener('resize', place); document.fonts?.ready.then(place); place();
  }

  // ── 動く図：ご相談内容の4枚を1本の輪でつなぎ、光が回る ──
  const grid = $('#business .biz-grid');
  if (!grid) return;
  const cards = $$('.biz-card', grid);
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (name, attrs = {}) => { const el = document.createElementNS(NS, name); for (const k in attrs) el.setAttribute(k, attrs[k]); return el; };
  // 線の絵（1本の太さでそろえる）。それぞれのカードの仕事を、短い動きで見せる
  const ICONS = [
    // ホームページ：枠の中に、行が書かれていく
    '<rect x="5" y="8" width="30" height="24" rx="3"/><path d="M5 14h30"/><circle class="acc" cx="9" cy="11" r="1.1"/><path class="d d1" d="M10 20h13"/><path class="d d2" d="M10 24.5h19"/><path class="d d3" d="M10 29h9"/>',
    // 検索と地図：ピンが落ちて、輪がひろがる
    '<g class="pin"><path d="M20 31c-5-6.4-7.5-10.6-7.5-14.2a7.5 7.5 0 0 1 15 0c0 3.6-2.5 7.8-7.5 14.2z"/><circle cx="20" cy="16.6" r="2.6"/></g><ellipse class="ripple" cx="20" cy="33" rx="7" ry="2.2"/>',
    // SNS・ブログ：投稿が重なって、きらめく
    '<rect class="post p1" x="6" y="9" width="21" height="9" rx="2.5"/><rect class="post p2" x="6" y="22" width="21" height="9" rx="2.5"/><path class="spark" d="M32.5 6.5v7M29 10h7M30.2 7.7l4.6 4.6M34.8 7.7l-4.6 4.6"/>',
    // 管理画面：棒がのびて、線が走る
    '<path d="M6 33h28"/><path class="bar b1" d="M11 33V24"/><path class="bar b2" d="M18 33V17"/><path class="bar b3" d="M25 33V21"/><path class="trend" d="M8 15l8-5 7 4 9-7"/>'
  ];
  cards.forEach((card, i) => {
    const s = svgEl('svg', { class: 'biz-icon', viewBox: '0 0 40 40', 'aria-hidden': 'true', focusable: 'false' });
    s.innerHTML = ICONS[i] || ''; card.prepend(s);
  });
  const svg = svgEl('svg', { class: 'circuit', role: 'img', 'aria-label': 'ホームページ、検索と地図、SNSとブログ、管理画面が1本の輪でつながり、光が回り続けている図' });
  const rail = svgEl('path', { class: 'c-rail' });
  const tails = [svgEl('path', { class: 'c-tail t2' }), svgEl('path', { class: 'c-tail t1' })];
  const stems = svgEl('g', { class: 'c-stems' }), nodes = svgEl('g', { class: 'c-nodes' });
  const label = svgEl('text', { class: 'c-label', 'text-anchor': 'middle' }); label.textContent = '直し続ける';
  const head = svgEl('circle', { class: 'c-head', r: 4.5 });
  svg.append(rail, stems, ...tails, nodes, label, head);
  grid.classList.add('has-circuit'); grid.prepend(svg);
  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'circuit-toggle'; toggle.setAttribute('aria-pressed', 'false');
  grid.after(toggle);

  const LAP = 11;   // 1周にかける秒数
  let total = 0, stops = [], drawn = false, visible = false, stopped = !on, dist = 0, last = 0, raf = 0, lit = -1;
  const setToggle = () => { toggle.textContent = stopped ? '図を動かす' : '図の動きを止める'; toggle.setAttribute('aria-pressed', String(stopped)); toggle.hidden = !on; };
  setToggle();
  toggle.addEventListener('click', () => { stopped = !stopped; setToggle(); if (!stopped) run(); });

  function build() {
    const W = grid.offsetWidth, H = grid.offsetHeight;
    if (!W || !cards.length) return;
    const boxes = cards.map(c => ({ x: c.offsetLeft, y: c.offsetTop, w: c.offsetWidth, h: c.offsetHeight }));
    const rows = new Set(boxes.map(b => b.y)).size, cols = Math.round(cards.length / rows);
    const m = cols === 1 ? 13 : 24, r = cols === 1 ? 11 : 20;
    const L = -m, T = -m, R = W + m, B = H + m;
    svg.setAttribute('viewBox', `${L - 8} ${T - 8} ${W + 2 * m + 16} ${H + 2 * m + 16}`);
    Object.assign(svg.style, { left: L - 8 + 'px', top: T - 8 + 'px', width: W + 2 * m + 16 + 'px', height: H + 2 * m + 16 + 'px' });
    let d, pts;
    if (cols === 1) {
      // 1列：左を下り、右を上って戻る
      d = `M${L} ${T + r}V${B - r}A${r} ${r} 0 0 0 ${L + r} ${B}H${R - r}A${r} ${r} 0 0 0 ${R} ${B - r}V${T + r}A${r} ${r} 0 0 0 ${R - r} ${T}H${L + r}A${r} ${r} 0 0 0 ${L} ${T + r}Z`;
      pts = boxes.map(b => ({ x: L, y: b.y + Math.min(b.h / 2, 46), tx: 0, ty: b.y + Math.min(b.h / 2, 46) }));
    } else {
      // 横並び：上を右へ進み、下を通って戻る
      d = `M${L + r} ${T}H${R - r}A${r} ${r} 0 0 1 ${R} ${T + r}V${B - r}A${r} ${r} 0 0 1 ${R - r} ${B}H${L + r}A${r} ${r} 0 0 1 ${L} ${B - r}V${T + r}A${r} ${r} 0 0 1 ${L + r} ${T}Z`;
      pts = boxes.map(b => (b.y === boxes[0].y
        ? { x: b.x + b.w / 2, y: T, tx: b.x + b.w / 2, ty: b.y }
        : { x: b.x + b.w / 2, y: B, tx: b.x + b.w / 2, ty: b.y + b.h }));
    }
    label.setAttribute('x', (L + R) / 2); label.setAttribute('y', B + 4);   // 戻りの線の上に、言葉を1つだけ置く
    for (const p of [rail, ...tails]) p.setAttribute('d', d);
    total = rail.getTotalLength();
    // それぞれの印が、輪のどの距離にあるか（いちばん近い点を探す）
    stops = pts.map(p => { let best = 0, bd = Infinity; for (let s = 0; s <= total; s += 2) { const q = rail.getPointAtLength(s), dd = (q.x - p.x) ** 2 + (q.y - p.y) ** 2; if (dd < bd) { bd = dd; best = s; } } return best; });
    stems.textContent = ''; nodes.textContent = '';
    pts.forEach((p, i) => {
      stems.append(svgEl('path', { d: `M${p.x} ${p.y}L${p.tx} ${p.ty}` }));
      const g = svgEl('g', { class: 'c-node', transform: `translate(${p.x} ${p.y})` }); g.style.setProperty('--i', i);
      g.append(svgEl('circle', { class: 'ping', r: 4 }), svgEl('circle', { class: 'core', r: 4 }));
      nodes.append(g);
    });
    rail.style.strokeDasharray = total; rail.style.strokeDashoffset = drawn ? 0 : total;
    tails[0].style.strokeDasharray = `${Math.min(170, total * .12)} ${total}`;
    tails[1].style.strokeDasharray = `${Math.min(70, total * .05)} ${total}`;
    if (!drawn) dist = stops[0] || 0;
    place();
  }
  function place() {
    if (!total) return;
    const p = rail.getPointAtLength(dist % total);
    head.setAttribute('cx', p.x); head.setAttribute('cy', p.y);
    tails[0].style.strokeDashoffset = -(dist % total) + Math.min(170, total * .12);
    tails[1].style.strokeDashoffset = -(dist % total) + Math.min(70, total * .05);
  }
  function light(i) {
    if (lit === i) return; lit = i;
    cards.forEach((c, k) => c.classList.toggle('is-live', k === i));
    clearTimeout(light.t); light.t = setTimeout(() => { if (lit === i) cards[i]?.classList.remove('is-live'); }, 2600);   // 灯りは、光が通りすぎたら消える
    [...nodes.children].forEach((node, k) => node.classList.toggle('is-hit', k === i));
  }
  function tick(time) {
    raf = 0;
    if (!visible || stopped || pausedByPage() || document.hidden) { last = 0; return; }
    const dt = Math.min((time - (last || time)) / 1000, .05); last = time;
    const before = dist % total;
    dist += (total / LAP) * dt;
    const after = dist % total;
    stops.forEach((s, i) => { if (before <= after ? (s > before && s <= after) : (s > before || s <= after)) light(i); });
    place();
    raf = requestAnimationFrame(tick);
  }
  function run() { if (!raf && visible && !stopped && drawn) raf = requestAnimationFrame(tick); }
  function draw() {
    if (drawn) return; drawn = true;
    svg.classList.add('is-drawn');
    if (!on) { svg.classList.add('is-static'); rail.style.strokeDashoffset = 0; cards.forEach(c => c.classList.add('is-still')); return; }
    rail.animate({ strokeDashoffset: [total, 0] }, { duration: 1700, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' })
      .finished.then(() => { rail.style.strokeDashoffset = 0; light(0); run(); }).catch(() => {});
  }
  build();
  new ResizeObserver(() => build()).observe(grid);
  document.fonts?.ready.then(build);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) { if (!drawn) draw(); else run(); }
  }, { rootMargin: '0px 0px -18% 0px', threshold: .08 }).observe(grid);
  document.addEventListener('visibilitychange', run);
  new MutationObserver(run).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
