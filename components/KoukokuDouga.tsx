import React, { useEffect, useRef, useState } from 'react';

// フッ軽の紹介動画「今日も、現場へ。」（横長・第2世代）。お知らせのすぐ下で、音なしでくり返し流します。
// 2026-10-22 中元さん「今日も現場への動画に書き換え。ループ再生で重くならないように」
// → YouTube の埋め込みをやめ、HPに軽い動画（1280x720・約2MB）を置く。
const SRC = '/douga/kyoumo-genba-1022.mp4';
const POSTER = '/douga/kyoumo-genba-poster.jpg';

// 画面に入ったときだけ読み込んで、音なしでくり返し流す。画面の外では止める（重くしない）。
// 「動きを減らす」設定の方には止まった絵だけ（再生ボタンで見られる）。
function useLoopVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [yomu, setYomu] = useState(false);
  const [ugokiHerasu] = useState(
    () => typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false),
  );
  useEffect(() => {
    const herasu = ugokiHerasu;
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      const mieru = entries.some((e) => e.isIntersecting);
      if (mieru) { setYomu(true); if (!herasu) el.play().catch(() => {}); }
      else el.pause();
    }, { rootMargin: '200px 0px', threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [ugokiHerasu]);
  return { ref, yomu, ugokiHerasu };
}

const KoukokuDouga: React.FC = () => {
  const { ref, yomu, ugokiHerasu } = useLoopVideo();
  return (
    <section className="section-tight border-b border-hairline bg-canvas" aria-labelledby="koukoku-douga">
      <div className="shell">
        <h2 id="koukoku-douga" className="sr-only">フッ軽の紹介動画</h2>
        <div className="relative aspect-video w-full overflow-hidden rounded border border-hairline bg-surface">
          <video
            ref={ref}
            className="absolute inset-0 h-full w-full object-cover"
            src={yomu ? SRC : undefined}
            poster={POSTER}
            muted
            loop
            playsInline
            preload="none"
            controls={ugokiHerasu}
            aria-label="フッ軽の紹介動画「今日も、現場へ。」"
          />
        </div>
      </div>
    </section>
  );
};

export default KoukokuDouga;
