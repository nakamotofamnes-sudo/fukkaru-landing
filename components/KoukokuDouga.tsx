import React, { useEffect, useRef, useState } from 'react';

// フッ軽の紹介動画（横長・約37秒）。お知らせのすぐ下で、音なしで自動にくり返し流します。
// 中元さん（2026-10-17）「YouTubeで投稿後にYouTubeでできたのを指定した場所でループ再生させてください。
// 動画のインプレッションが増えればいい」→ HPに動画ファイルを置かず、YouTube の動画を埋め込む。
// HPを重くしないために：
// - 画面に近づくまで YouTube の部品を読み込まない（最初は止まった1枚の絵だけ）
// - youtube-nocookie（プライバシー強化モード）は使わない：YouTube 側の数字につなげたいため
// - 「動きを減らす」設定の方には自動で流さない（YouTube の再生ボタンで見られる）
const VIDEO_ID = '5hCWQzLqzos';   // 2026-10-17 23:11 に上げた横長の広告動画（試作4）
const POSTER = '/douga/fukkaru-koukoku-poster.jpg';

const KoukokuDouga: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [mieta, setMieta] = useState(false);
  const [ugokiHerasu, setUgokiHerasu] = useState(false);

  useEffect(() => {
    setUgokiHerasu(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      setMieta(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMieta(true);
          io.disconnect();
        }
      },
      { rootMargin: '300px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 自動でくり返す：autoplay（音なしのときだけ許される）＋ loop（playlist に同じ動画を入れるとくり返す）
  const params = new URLSearchParams({
    autoplay: ugokiHerasu ? '0' : '1',
    mute: '1',
    loop: '1',
    playlist: VIDEO_ID,
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
  });

  return (
    <section className="section-tight border-b border-hairline bg-canvas" aria-labelledby="koukoku-douga">
      <div className="shell">
        <h2 id="koukoku-douga" className="sr-only">
          フッ軽の紹介動画
        </h2>
        <div ref={ref} className="relative aspect-video w-full overflow-hidden rounded border border-hairline bg-surface">
          {mieta ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${VIDEO_ID}?${params.toString()}`}
              title="フッ軽の紹介動画（YouTube）"
              allow="autoplay; encrypted-media; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <img src={POSTER} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          )}
        </div>
      </div>
    </section>
  );
};

export default KoukokuDouga;
