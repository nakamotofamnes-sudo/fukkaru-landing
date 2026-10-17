import React, { useEffect, useRef, useState } from 'react';

// フッ軽の紹介動画（横長・約37秒）。お知らせのすぐ下で、音なしで自動にくり返し流します（2026-10-17 中元さん）。
// HPを重くしないために：
// - 動画はHP用に小さくしたもの（1280x720・音なし・約4.7MB）。元の動画は YouTube などに出す版
// - 画面に近づくまで読み込まない（最初は止まった1枚の絵だけ）
// - 「動きを減らす」設定の方には自動で流さない（絵の上の再生ボタンで見られる）
const SRC = '/douga/fukkaru-koukoku.mp4';
const POSTER = '/douga/fukkaru-koukoku-poster.jpg';

const KoukokuDouga: React.FC = () => {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | undefined>(undefined);
  const [ugokiHerasu, setUgokiHerasu] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const herasu = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    setUgokiHerasu(herasu);
    if (!('IntersectionObserver' in window)) {
      setSrc(SRC);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setSrc(SRC);
            if (!herasu) v.play().catch(() => {});
          } else if (!v.paused) {
            v.pause();
          }
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <section className="section-tight border-b border-hairline bg-canvas" aria-labelledby="koukoku-douga">
      <div className="shell">
        <h2 id="koukoku-douga" className="sr-only">
          フッ軽の紹介動画
        </h2>
        <video
          ref={ref}
          src={src}
          poster={POSTER}
          muted
          loop
          playsInline
          autoPlay={!ugokiHerasu}
          controls={ugokiHerasu}
          preload="none"
          className="aspect-video w-full rounded border border-hairline bg-surface object-cover"
          aria-label="フッ軽の紹介動画。草むしり・物置・家具の組み立て・高圧洗浄・軽トラックでの運搬の作業の様子と、LINEでのご相談の案内（音声なし）"
        />
      </div>
    </section>
  );
};

export default KoukokuDouga;
