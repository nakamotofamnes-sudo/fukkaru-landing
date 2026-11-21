// 記事の自動化のページの動き（2026-11-21 中元さん「2Dモーションを活用して」「インタラクティブチャートを活用して」）
// ・毎月の報告：週ごとの実際の数字を、押して切り替え・指やマウスで週ごとの数字を出すグラフ
// ・流れの線・料金の取り消し線は、見えたときに1回だけ（CSS の .is-on）
// 動きを減らす設定の人には、線を引く動きを省いて、すぐ出す
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 見えたら1回 .is-on を付ける（グラフ・流れ・料金）──
  const onceSel = '[data-chart], .steps, .price-card, .industries';
  const onceIO = 'IntersectionObserver' in window ? new IntersectionObserver((ents) => {
    for (const e of ents) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-on');
      e.target.dispatchEvent(new CustomEvent('seen'));
      onceIO.unobserve(e.target);
    }
  }, { threshold: 0.3 }) : null;
  document.querySelectorAll(onceSel).forEach((el) => onceIO ? onceIO.observe(el) : el.classList.add('is-on'));

  // ── どの業種でも：業種の名前が入れ替わって、最後に「どんな」で止まる（1回だけ）──
  const word = document.querySelector('.ind-word');
  const indSec = document.querySelector('.industries');
  if (word && indSec && !reduce) {
    const list = word.dataset.words.split(',').concat(['どんな']);
    let started = false;
    indSec.addEventListener('seen', () => {
      if (started) return; started = true;
      let k = 0;
      const swap = () => {
        word.classList.add('is-out');
        setTimeout(() => {
          word.textContent = list[k];
          word.classList.remove('is-out', 'is-in'); void word.offsetWidth; word.classList.add('is-in');
          k += 1;
          if (k < list.length) setTimeout(swap, k === list.length - 1 ? 1300 : 900);
        }, 150);
      };
      swap();
    });
  }

  // ── グラフ ──
  // フッ軽のブログ（記事のページだけ）の週ごとの数字。サーチコンソールから 2026-11-21 に取った（11/19 まで）
  // art は、その週の終わりまでに出した記事の本数（累計）
  const DATA = [
    { w: '2026-08-31', to: '2026-09-06', d: 6, imp: 0, clk: 0, art: 18 },
    { w: '2026-09-07', to: '2026-09-13', d: 7, imp: 121, clk: 4, art: 30 },
    { w: '2026-09-14', to: '2026-09-20', d: 7, imp: 238, clk: 4, art: 45 },
    { w: '2026-09-21', to: '2026-09-27', d: 7, imp: 761, clk: 5, art: 59 },
    { w: '2026-09-28', to: '2026-10-04', d: 7, imp: 864, clk: 4, art: 73 },
    { w: '2026-10-05', to: '2026-10-11', d: 7, imp: 710, clk: 14, art: 87 },
    { w: '2026-10-12', to: '2026-10-18', d: 7, imp: 617, clk: 8, art: 102 },
    { w: '2026-10-19', to: '2026-10-25', d: 7, imp: 486, clk: 7, art: 117 },
    { w: '2026-10-26', to: '2026-11-01', d: 7, imp: 746, clk: 29, art: 131 },
    { w: '2026-11-02', to: '2026-11-08', d: 7, imp: 854, clk: 44, art: 145 },
    { w: '2026-11-09', to: '2026-11-15', d: 7, imp: 755, clk: 19, art: 159 },
    { w: '2026-11-16', to: '2026-11-19', d: 4, imp: 428, clk: 9, art: 167 },
  ];
  const METRIC = {
    clk: { title: '検索から記事が押された回数', unit: '回' },
    imp: { title: '記事が検索結果に出た回数', unit: '回' },
    art: { title: '出した記事の本数（累計）', unit: '本' },
  };
  const md = (iso) => { const [, m, d] = iso.split('-'); return `${+m}/${+d}`; };
  const fmt = (n) => n.toLocaleString('ja-JP');

  const box = document.querySelector('[data-chart]');
  if (!box) return;
  const svg = box.querySelector('svg');
  const tip = box.querySelector('.chart-tip');
  const titleEl = document.querySelector('[data-chart-title]');
  const buttons = [...document.querySelectorAll('[data-metric]')];
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent = svg) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent.appendChild(n); return n; };

  // 表（いつでも全部の数字を読めるように）
  const rows = document.querySelector('[data-chart-rows]');
  if (rows) rows.innerHTML = DATA.map((r) => `<tr><th scope="row">${md(r.w)}〜${md(r.to)}${r.d < 7 ? `（${r.d}日分）` : ''}</th><td>${fmt(r.clk)}</td><td>${fmt(r.imp)}</td><td>${fmt(r.art)}</td></tr>`).join('');

  let metric = 'clk', idx = DATA.length - 2, geo = null, drawn = false;

  // 目盛りは4つ。1目盛りが切りのよい数（1・2・5・10・20・25・50…）になる上限にする
  function niceMax(v) {
    if (v <= 0) return 4;
    const raw = (v * 1.1) / 4, p = Math.pow(10, Math.floor(Math.log10(raw)));
    for (const k of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (k * p >= raw && Number.isInteger(k * p)) return k * p * 4;
    return 10 * p * 4;
  }

  function draw(animate) {
    const W = box.clientWidth, H = Math.max(240, Math.min(340, Math.round(W * 0.42)));
    const narrow = W < 560;
    const pad = { l: narrow ? 36 : 48, r: narrow ? 12 : 20, t: 22, b: 34 };
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.textContent = '';
    const vals = DATA.map((r) => r[metric]);
    const max = niceMax(Math.max(...vals));
    const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / (DATA.length - 1);
    const y = (v) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
    geo = { x, y, W, H, pad };

    // 目盛り（控えめ）
    for (let k = 0; k <= 4; k++) {
      const v = (max * k) / 4, yy = y(v);
      el('line', { x1: pad.l, x2: W - pad.r, y1: yy, y2: yy, class: k === 0 ? 'c-base' : 'c-grid' });
      el('text', { x: pad.l - 8, y: yy + 4, class: 'c-ylab', 'text-anchor': 'end' }).textContent = fmt(Math.round(v));
    }
    DATA.forEach((r, i) => {
      if (narrow && (DATA.length - 1 - i) % 2 === 1) return;   // せまい画面は1週おき（最後の週は必ず出す）
      el('text', { x: x(i), y: H - 10, class: 'c-xlab', 'text-anchor': 'middle' }).textContent = md(r.w);
    });

    // 面と線（最後の週は4日分なので点線）
    const pts = DATA.map((r, i) => [x(i), y(r[metric])]);
    const full = pts.slice(0, -1), last = pts.slice(-2);
    const line = (ps) => ps.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
    const area = el('path', { d: `${line(full)}L${full.at(-1)[0]},${y(0)}L${full[0][0]},${y(0)}Z`, class: 'c-area' });
    const path = el('path', { d: line(full), class: 'c-line' });
    const dash = el('path', { d: line(last), class: 'c-line c-partial' });

    // 値の札は、最後の完全な週だけ（全部の点に数字を付けない）
    const li = DATA.length - 2;
    el('circle', { cx: x(li), cy: y(vals[li]), r: 4.5, class: 'c-end' });
    el('text', { x: x(li), y: y(vals[li]) - 12, class: 'c-endlab', 'text-anchor': 'middle' }).textContent = fmt(vals[li]) + METRIC[metric].unit;

    // なぞったときの縦線と点
    const cross = el('line', { y1: pad.t, y2: H - pad.b, class: 'c-cross' });
    const dot = el('circle', { r: 6, class: 'c-dot' });
    geo.cross = cross; geo.dot = dot;

    if (animate && !reduce) {
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len} ${len}`;
      path.style.strokeDashoffset = len;
      area.style.opacity = 0; dash.style.opacity = 0;
      requestAnimationFrame(() => {
        path.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.77,0,.175,1)';
        area.style.transition = 'opacity .8s ease .5s';
        dash.style.transition = 'opacity .4s ease 1.1s';
        path.style.strokeDashoffset = 0; area.style.opacity = 1; dash.style.opacity = 1;
      });
    }
    show(idx, false);
  }

  function show(i, focus = true) {
    if (!geo) return;
    idx = Math.max(0, Math.min(DATA.length - 1, i));
    const r = DATA[idx], v = r[metric];
    const cx = geo.x(idx), cy = geo.y(v);
    geo.cross.setAttribute('x1', cx); geo.cross.setAttribute('x2', cx);
    geo.dot.setAttribute('cx', cx); geo.dot.setAttribute('cy', cy);
    box.classList.toggle('is-hover', focus);
    tip.innerHTML = `<span>${md(r.w)}〜${md(r.to)}${r.d < 7 ? `（${r.d}日分）` : ''}</span><b>${fmt(v)}<small>${METRIC[metric].unit}</small></b>`;
    const tw = tip.offsetWidth || 140;
    const left = Math.min(Math.max(cx - tw / 2, 4), geo.W - tw - 4);
    tip.style.transform = `translate(${left}px, ${Math.max(cy - 70, 0)}px)`;
  }

  function pick(ev) {
    const rect = svg.getBoundingClientRect();
    const px = ev.clientX - rect.left;
    const step = (geo.W - geo.pad.l - geo.pad.r) / (DATA.length - 1);
    show(Math.round((px - geo.pad.l) / step));
  }
  svg.addEventListener('pointermove', pick);
  svg.addEventListener('pointerdown', pick);
  svg.addEventListener('pointerleave', () => box.classList.remove('is-hover'));
  box.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { show(idx - 1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { show(idx + 1); e.preventDefault(); }
  });
  box.addEventListener('focus', () => show(idx));
  box.addEventListener('blur', () => box.classList.remove('is-hover'));

  buttons.forEach((b) => b.addEventListener('click', () => {
    metric = b.dataset.metric;
    buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    if (titleEl) titleEl.textContent = METRIC[metric].title;
    draw(true);
  }));

  // 見えたときに線を引く。幅が変わったら引き直す（動きなし）
  box.addEventListener('seen', () => { if (!drawn) { drawn = true; draw(true); } });
  draw(false);
  if (!onceIO) { drawn = true; }
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => draw(false), 120); });
})();
