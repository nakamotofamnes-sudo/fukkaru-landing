// かんたん見積もりと相談の3つの入口（2026-11-21 中元さん「LINEも足して」「お問合せフォームも」「答えが早くわかる見積前の予約みたいなの」）
// ・2つ選ぶと、その場で費用が出る（ホームページあり 15万円／なし 24万円・年内。月額3万円。どれも税抜）
// ・送り方は3つ：この欄（関数 kijiSoudan）・LINE（内容を入れて開く）・メール（下書きに入れて開く）
(() => {
  const ENDPOINT = 'https://asia-northeast1-fukkaru-app.cloudfunctions.net/kijiSoudan';
  const LINE_ID = '%40200rcmxs';
  const MAIL = 'nakamoto.famnes@gmail.com';
  const root = document.getElementById('mitsumori');
  if (!root) return;
  const st = { hp: '', gyoushu: '', kobetsu: false };
  const $ = (s) => root.querySelector(s);
  const out = $('.est-out'), empty = $('.est-empty');
  const form = $('[data-form]'), done = $('[data-done]');

  const summary = () => [
    '【記事の自動化の相談】',
    `ホームページ：${st.hp === 'aru' ? 'ある' : 'まだ無い（ホームページづくりから）'}`,
    `業種：${st.gyoushu}`,
    `見積もり：初期費用 ${st.hp === 'aru' ? '15' : '24'}万円・月額3万円（税抜・年内のお申し込み）`,
    'サイト：',
    'ご相談：',
  ].join('\n');

  function render() {
    root.querySelectorAll('[data-hp]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.hp === st.hp)));
    root.querySelectorAll('[data-gyoushu]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.gyoushu === st.gyoushu)));
    const ready = st.hp && st.gyoushu;
    empty.hidden = !!ready;
    if (!ready) { out.hidden = true; return; }
    const first = out.hidden;
    out.hidden = false;
    $('[data-est-init]').textContent = st.hp === 'aru' ? '15' : '24';
    $('[data-est-old]').textContent = st.hp === 'aru' ? '30万円' : '40万円';
    $('[data-est-note]').textContent = st.kobetsu
      ? '医療・お金・法律にかかわる業種は、まちがいの責任が重いため、内容を伺ってから個別にお見積もりします。上の金額はめやすです。'
      : (st.hp === 'aru'
        ? 'いまのサイトにつないで、毎日の記事づくりを始めます。サイトの作りによって、はじめの手間が変わる場合があります。'
        : 'ホームページづくりから始めて、できたらそのまま毎日の記事づくりに入ります。');
    $('[data-line]').href = `https://line.me/R/oaMessage/${LINE_ID}/?${encodeURIComponent(summary())}`;
    $('[data-mail]').href = `mailto:${MAIL}?subject=${encodeURIComponent('記事の自動化の相談')}&body=${encodeURIComponent(summary())}`;
    if (first && out.animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      out.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.23,1,.32,1)' });
    }
  }

  root.querySelectorAll('[data-hp]').forEach((b) => b.addEventListener('click', () => { st.hp = b.dataset.hp; render(); }));
  root.querySelectorAll('[data-gyoushu]').forEach((b) => b.addEventListener('click', () => {
    st.gyoushu = b.dataset.gyoushu; st.kobetsu = b.hasAttribute('data-kobetsu'); render();
  }));
  // 矢印キーで選び直せる（radiogroup の決まり）
  root.querySelectorAll('[role="radiogroup"]').forEach((g) => g.addEventListener('keydown', (e) => {
    const bs = [...g.querySelectorAll('[role="radio"]')]; const i = bs.indexOf(document.activeElement);
    if (i < 0) return;
    const n = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!n) return; e.preventDefault(); const t = bs[(i + n + bs.length) % bs.length]; t.focus(); t.click();
  }));

  $('[data-open-form]').addEventListener('click', () => {
    form.hidden = false;
    form.querySelector('[name="namae"]').focus({ preventScroll: true });
    form.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
  const denwaRow = form.querySelector('.f-denwa');
  form.querySelectorAll('[name="renraku"]').forEach((r) => r.addEventListener('change', () => { denwaRow.hidden = form.renraku.value !== 'denwa'; }));

  const err = form.querySelector('.f-err'), btn = form.querySelector('.f-submit');
  const showErr = (m) => { err.textContent = m; err.hidden = false; };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.hidden = true;
    const f = Object.fromEntries(new FormData(form).entries());
    if (!f.namae || !f.namae.trim()) return showErr('お名前を書いてください。');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.mail || '')) return showErr('メールアドレスを確かめてください。');
    if (f.renraku === 'denwa' && !(f.denwa || '').replace(/\D/g, '').match(/^0\d{9,10}$/)) return showErr('電話番号を、市外局番から書いてください。');
    btn.disabled = true; const label = btn.textContent; btn.textContent = '送っています…';
    try {
      const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, hp: st.hp, gyoushu: st.gyoushu }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) throw new Error(j.error || '送れませんでした。LINEかメールでご相談ください。');
      form.hidden = true; done.hidden = false;
      done.querySelector('[data-done-no]').textContent = j.bangou || '';
      done.focus();
    } catch (x) {
      showErr(x.message && /[ぁ-ん]/.test(x.message) ? x.message : '送れませんでした。LINEかメールでご相談ください。');
      btn.disabled = false; btn.textContent = label;
    }
  });
})();
