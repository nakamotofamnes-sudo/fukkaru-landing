import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import instaData from '../content/insta.json';

/**
 * インスタの最新投稿（自前）
 *
 * **他社の埋め込み（Elfsight）をやめて置き換えたものです。**
 * 画像は `~/.fukkaru/insta.py` がこちらに落として、`public/insta/` に置いています。
 * インスタの画像URLは期限切れになるので、直リンクにはしません。
 *
 * **投稿の文面は載せません。**過去の投稿に「処分」などが入っており、
 * 許認可の線を越えるためです（写真・日付・リンクだけ）。
 *
 * 横スライドの作りは **YouTubeVideos.tsx と同じ形**に揃えています
 * （`hide-scrollbar` ＋ スナップ ＋ 矢印。バラバラにしない）。
 */

type Toukou = {
  id: string;
  hi: string;
  kata: string;
  ga: string;
  haba?: number;
  takasa?: number;
  url: string;
};

const data = instaData as { torikomi: string; username: string; toukou: Toukou[] };

const hizukeHyouji = (hi: string) => {
  const [y, m, d] = hi.split('-');
  return `${y}年${Number(m)}月${Number(d)}日`;
};

const InstagramFeed: React.FC = () => {
  const scroller = useRef<HTMLDivElement>(null);
  const toukou = data.toukou ?? [];

  // **1面＝3×3の9枚。**面ごと横に送る（中元さんの指定 2026-09-13）
  const HITOMEN = 9;
  const men: Toukou[][] = [];
  for (let i = 0; i < toukou.length; i += HITOMEN) {
    men.push(toukou.slice(i, i + HITOMEN));
  }

  const scroll = (direction: 'left' | 'right') => {
    const haba = scroller.current?.clientWidth ?? 0;
    scroller.current?.scrollBy({ left: direction === 'left' ? -haba : haba, behavior: 'smooth' });
  };

  if (toukou.length === 0) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-end gap-2" hidden={men.length < 2}>
        <button
          onClick={() => scroll('left')}
          aria-label="前へ"
          className="hidden h-10 w-10 items-center justify-center rounded border border-hairline bg-surface text-ink-600 transition-colors hover:border-ink-300 hover:text-ink-900 md:flex"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scroll('right')}
          aria-label="次へ"
          className="hidden h-10 w-10 items-center justify-center rounded border border-hairline bg-surface text-ink-600 transition-colors hover:border-ink-300 hover:text-ink-900 md:flex"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div
        ref={scroller}
        className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
      >
        {men.map((mai, index) => (
          <ul
            key={index}
            className="grid w-full shrink-0 snap-start grid-cols-3 gap-2 sm:gap-4"
            aria-label={`Instagramの投稿 ${index + 1}面目`}
          >
            {mai.map((t) => (
              <li key={t.id}>
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${hizukeHyouji(t.hi)}のInstagramの投稿を見る`}
                  className="relative block aspect-[4/5] overflow-hidden rounded border border-hairline bg-ink-100"
                >
                  <img
                    src={t.ga}
                    alt={`${hizukeHyouji(t.hi)}のInstagramの投稿`}
                    width={t.haba || 576}
                    height={t.takasa || 720}
                    loading="lazy"
                    decoding="async"
                    /* **切らない。**投稿カードは上と下に文字が乗っているので、
                       object-cover にすると見出しと帯が消えます（2026-09-13、実物で確認） */
                    className="h-full w-full object-contain"
                  />
                  {t.kata !== 'IMAGE' && (
                    <span
                      aria-hidden="true"
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink-900/70 text-white"
                    >
                      <Play size={12} fill="currentColor" />
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        ))}
      </div>

      <p className="mt-4 text-[13px] text-ink-500">
        Instagramの最新{toukou.length}件です（{hizukeHyouji(data.torikomi.slice(0, 10))}時点）。
        {men.length > 1 && '横にスライドすると続きの9枚が見られます。'}
        写真を押すとInstagramが開きます。
      </p>
    </div>
  );
};

export default InstagramFeed;
