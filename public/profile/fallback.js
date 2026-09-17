// The page remains readable if WebGL, model loading, or ES modules are unavailable.
(() => {
  const status = document.getElementById('scene-status');
  status.hidden = false;
  let timer;
  window.profileFallback = (message = '3Dを表示できませんでした。本文をご覧いただけます。') => {
    clearTimeout(timer);
    document.body.classList.remove('scene-ready', 'scan-reveal');
    document.documentElement.style.setProperty('--hero-opacity', 1);
    document.getElementById('status-text').textContent = message;
    document.getElementById('load-percent').hidden = true;
    status.hidden = false;
    setTimeout(() => { status.hidden = true; }, 6000);
  };
  window.profileLoaded = () => { clearTimeout(timer); status.hidden = true; };
  window.profileSkipped = false;
  document.getElementById('skip-scene').addEventListener('click', () => {
    window.profileSkipped = true;
    clearTimeout(timer);
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
