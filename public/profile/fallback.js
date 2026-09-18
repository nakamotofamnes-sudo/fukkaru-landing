// The page remains readable if WebGL, model loading, or ES modules are unavailable.
(() => {
  const status = document.getElementById('scene-status');
  const preloader = document.getElementById('preloader');
  let timer, shown = 0;
  // 読み込み画面：数字は実際の進み具合を追いかけて、なめらかに増やす
  const closePreloader = (animate = false) => {
    if (!preloader || preloader.hidden) return;
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
  const sections = ['home', 'about', 'business', 'contact'].map(id => document.getElementById(id));
  let scheduled = false;
  function update() {
    scheduled = false;
    let active = 'home';
    for (const section of sections) if (section.getBoundingClientRect().top < innerHeight * .42) active = section.id;
    document.body.dataset.stage = active;
    nav.forEach(link => { if (link.dataset.nav === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  }
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();
