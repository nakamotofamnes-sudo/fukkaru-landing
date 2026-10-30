(() => {
  const email = 'nakamoto.famnes@gmail.com';
  const mailLink = document.getElementById('mail-link');
  const interest = document.getElementById('interest');
  const copyButton = document.getElementById('copy-email');
  const copyStatus = document.getElementById('copy-status');

  // 相談内容を選んだ場合は、メールの下書きにも引き継ぐ。
  document.querySelectorAll('[data-interest]').forEach(link => {
    link.addEventListener('click', () => {
      const selected = link.dataset.interest;
      interest.textContent = `ご相談内容：${selected}`;
      interest.hidden = false;
      const body = `ご相談内容：${selected}\n\nどんな仕事をしているか：\n\nいま困っていること：\n`;
      mailLink.href = `mailto:${email}?subject=${encodeURIComponent('ホームページ制作の相談')}&body=${encodeURIComponent(body)}`;
    });
  });

  // コピーできない環境でも、アドレスの文字は常に表示する。
  if (navigator.clipboard?.writeText) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(email);
        copyStatus.textContent = 'メールアドレスをコピーしました。';
      } catch {
        copyStatus.textContent = 'コピーできませんでした。上のアドレスを選択してコピーしてください。';
      }
    });
  }

  // 相談先が見えている間は、スマホ下部のボタンを重ねない。
  const mobileCta = document.querySelector('.mobile-cta');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      mobileCta.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0 });
    observer.observe(document.querySelector('.contact-box'));
  }
})();
