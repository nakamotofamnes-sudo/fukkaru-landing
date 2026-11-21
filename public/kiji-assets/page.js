// 標準のリンクや詳細欄はスクリプトなしでも利用できる。
const deskNav = document.querySelector('[data-desk-nav]');
const deskPages = document.querySelector('.desk-pages');
const deskTabs = [...deskNav.querySelectorAll('button')];
const panels = deskTabs.map(tab => document.getElementById(tab.dataset.deskTab));

function showDesk(index, focus = false) {
  deskTabs.forEach((tab, position) => {
    const selected = position === index;
    const panel = panels[position];
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    panel.setAttribute('aria-hidden', String(!selected));
    panel.inert = !selected;
    panel.tabIndex = selected ? 0 : -1;
    panel.classList.toggle('is-changing', selected);
  });
  if (focus) deskTabs[index].focus();
}

deskNav.setAttribute('role', 'tablist');
deskTabs.forEach((tab, index) => {
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', panels[index].id);
  panels[index].setAttribute('role', 'tabpanel');
  panels[index].setAttribute('aria-labelledby', tab.id);
  tab.addEventListener('click', () => showDesk(index));
  tab.addEventListener('keydown', event => {
    const destinations = {
      ArrowLeft: (index + deskTabs.length - 1) % deskTabs.length,
      ArrowRight: (index + 1) % deskTabs.length,
      Home: 0,
      End: deskTabs.length - 1,
    };
    if (!Object.hasOwn(destinations, event.key)) return;
    event.preventDefault();
    showDesk(destinations[event.key], true);
  });
});
showDesk(0);
deskPages.classList.add('is-enhanced');
deskNav.hidden = false;

// 日別の記録だけを順に描き、見出しや本文の位置は動かさない。
const recordTicks = document.querySelector('.record-ticks');
for (let day = 0; day < 20; day += 1) {
  const tick = document.createElement('span');
  tick.style.setProperty('--i', day);
  recordTicks.append(tick);
}
recordTicks.classList.add('is-enhanced');

if ('IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      // 同じ親の中で並んで見えたものは、少しずつずらして出す
      const sibs = [...entry.target.parentElement.children].filter(el => el.hasAttribute('data-reveal'));
      const k = Math.max(0, sibs.indexOf(entry.target));
      entry.target.style.setProperty('--d', Math.min(k * 0.09, 0.45) + 's');
      entry.target.classList.add('reveal-in');
      reveal.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(element => reveal.observe(element));
  // 速くスクロールして見張りが拾い損ねたものも、画面より上に来たら出しておく（隠れたまま残さない）
  let pending = false;
  addEventListener('scroll', () => {
    if (pending) return; pending = true;
    requestAnimationFrame(() => {
      pending = false;
      document.querySelectorAll('[data-reveal]:not(.reveal-in)').forEach(el => {
        if (el.getBoundingClientRect().top < innerHeight * 0.92) { el.classList.add('reveal-in'); reveal.unobserve(el); }
      });
    });
  }, { passive: true });

  const quickContact = document.querySelector('.quick-contact');
  const footer = document.querySelector('.footer');
  const hero = document.querySelector('.hero');
  const contact = document.getElementById('contact');
  const quickVisibility = new IntersectionObserver(() => {
    // かんたん見積もりの欄を見ている間も隠す（送るボタンに重ねない）
    const est = document.getElementById('mitsumori');
    const er = est ? est.getBoundingClientRect() : null;
    const atEst = er && er.top < window.innerHeight && er.bottom > 0;
    const visible = hero.getBoundingClientRect().bottom <= 0 && !atEst &&
      contact.getBoundingClientRect().top >= window.innerHeight;
    if (visible || document.activeElement !== quickContact) quickContact.hidden = !visible;
  });
  [hero, contact, footer, document.getElementById("mitsumori")].filter(Boolean).forEach(element => quickVisibility.observe(element));
  quickContact.addEventListener('blur', () => {
    if (hero.getBoundingClientRect().bottom > 0 ||
        contact.getBoundingClientRect().top < window.innerHeight) quickContact.hidden = true;
  });
}

const copyEmail = document.getElementById('copy-email');
const copyStatus = document.getElementById('copy-status');
if (navigator.clipboard?.writeText) {
  copyEmail.hidden = false;
  copyEmail.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(document.getElementById('contact-email').textContent.trim());
      copyStatus.textContent = 'メールアドレスをコピーしました。';
    } catch {
      copyStatus.textContent = 'コピーできなかったため、上のメールアドレスを選んでコピーしてください。';
    }
  });
}

// 見張りの仕組みが無い古い画面では、隠したままにしない
if (!('IntersectionObserver' in window)) {
  document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('reveal-in'));
}
