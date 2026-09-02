import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';

const videoIds = [
  '7eF14DgXxTM', 'pFLCFgOWZUg', 'Ht-WnIEU-10', 'pSvdsGa01bQ', 'L2iWCXV6kKg',
  '7FgO4n_5PWo', 'jFi5wct7uMk', 'aXFs0DO3qW4', '7LcyjihJtg0', 'a8VyRDDx3SE',
];

const YouTubeVideos: React.FC = () => {
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    scroller.current?.scrollBy({ left: direction === 'left' ? -420 : 420, behavior: 'smooth' });
  };

  return (
    <section className="section border-t border-hairline">
      <div className="shell">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <span className="eyebrow">YouTube</span>
            <h2 className="h-section">作業の様子を公開しています</h2>
            <p className="lede">実際の現場を最初から最後まで撮っています。どんな人が来るのかご覧ください。</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
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
            <a
              href="https://www.youtube.com/@fukkaru_fuji-benriya"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              チャンネルを見る
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="shell mt-10">
        <div
          ref={scroller}
          className="hide-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2 sm:mx-0 sm:px-0"
        >
          {videoIds.map((id, index) => (
            <div key={id} className="w-[84vw] shrink-0 snap-center sm:w-[380px]">
              <div className="aspect-video w-full overflow-hidden rounded border border-hairline bg-ink-100">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${id}`}
                  title={`フッ軽ちゃんねる 動画 ${index + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default YouTubeVideos;
