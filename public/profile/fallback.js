// The page remains readable if WebGL, model loading, or ES modules are unavailable.
(() => {
  const status = document.getElementById('scene-status');
  const preloader = document.getElementById('preloader');
  let timer, shown = 0;
  // 読み込み画面：数字は実際の進み具合を追いかけて、なめらかに増やす
  const closePreloader = (animate = false) => {
    if (!preloader || preloader.hidden) return;
    // 動きの設計（motion.js）があれば任せる：読み込み画面が名前の点へ縮み、題字が組み上がる
    if (window.profileIntro) { window.profileIntro(preloader, animate); return; }
    if (!animate) { preloader.hidden = true; return; }
    preloader.classList.add('is-done');
    setTimeout(() => { preloader.hidden = true; }, 900);
  };
  // 圧縮して届くと大きさの見込みが外れて100を超えるので、読み終わるまでは99で止める
  window.profileProgress = (percent, done = false) => {
    shown = Math.max(shown, done ? 100 : Math.min(99, percent));
    document.getElementById('pre-percent').textContent = String(shown).padStart(3, '0');
    document.getElementById('pre-bar').style.transform = `scaleX(${shown / 100})`;
  };
  document.getElementById('pre-skip').addEventListener('click', () => document.getElementById('skip-scene').click());
  window.profileFallback = (message = '3Dを表示できませんでした。本文をご覧いただけます。') => {
    clearTimeout(timer);
    closePreloader();
    document.body.classList.remove('scene-ready', 'scan-reveal');
    document.documentElement.style.setProperty('--hero-opacity', 1);
    document.getElementById('status-text').textContent = message;
    document.getElementById('load-percent').hidden = true;
    status.hidden = false;
    setTimeout(() => { status.hidden = true; }, 6000);
  };
  window.profileLoaded = () => { clearTimeout(timer); status.hidden = true; window.profileProgress(100, true); setTimeout(() => closePreloader(true), 350); };
  window.profileSkipped = false;
  document.getElementById('skip-scene').addEventListener('click', () => {
    window.profileSkipped = true;
    clearTimeout(timer);
    closePreloader();
    document.body.classList.remove('scene-ready', 'scan-reveal');
    status.hidden = true;
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
  });
  timer = setTimeout(() => window.profileFallback(), 18000);
  document.getElementById('static-view').addEventListener('click', event => {
    window.profileSkipped = true;
    clearTimeout(timer);
    document.body.classList.remove('scene-ready', 'scan-reveal');
    document.documentElement.style.setProperty('--hero-opacity', 1);
    status.hidden = true;
    event.currentTarget.hidden = true;
  });
  const nav = [...document.querySelectorAll('[data-nav]')];
  // 場面の印は3つ（2026-11-19）。MY STORY（#story）と進め方（.process）は地が明るいのに、前は印に入っていなかったので、
  // 紺・墨の帯とうすい色のロゴが、明るい地にずっと重なっていた。
  //   data-stage … 下のナビの色。場面の上端が画面の42%を越えたら切り替える（前と同じ）
  //   data-band  … 画面の上にあるもの（上の帯・動きを止める）の色。次の場面が帯の下まで来たら切り替える。
  //                紺の場面だけは42%のまま（3Dの地が先に紺へ変わっていくため）
  //   active     … ナビで光らせる所（MY STORY は ABOUT、進め方は SERVICE のまま）
  const stages = [['home', 'home'], ['about', 'about'], ['story', 'about'], ['business', 'business'], ['process', 'business'], ['contact', 'contact']]
    .map(([id, navId]) => ({ el: document.getElementById(id) || document.querySelector('.' + id), stage: id, navId }))
    .filter(s => s.el);
  const header = document.querySelector('.site-header');
  let scheduled = false;
  function update() {
    scheduled = false;
    const mid = innerHeight * .42, under = header ? header.offsetHeight : 0;
    let stage = 'home', band = 'home', active = 'home';
    for (const s of stages) {
      const top = s.el.getBoundingClientRect().top;
      if (top < mid) { stage = s.stage; active = s.navId; }
      if (top < (s.stage === 'about' ? mid : under)) band = s.stage;
    }
    document.body.dataset.stage = stage;
    document.body.dataset.band = band;
    nav.forEach(link => { if (link.dataset.nav === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  }
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();
