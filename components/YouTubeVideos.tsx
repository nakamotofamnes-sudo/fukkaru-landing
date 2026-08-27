import React, { useRef } from 'react';
import { Youtube, ChevronLeft, ChevronRight } from 'lucide-react';

const YouTubeVideos: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      // スクロール量（動画1つ分程度）
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const videoIds = [
    '7eF14DgXxTM',
    'pFLCFgOWZUg',
    'Ht-WnIEU-10',
    'pSvdsGa01bQ',
    'L2iWCXV6kKg',
    '7FgO4n_5PWo',
    'jFi5wct7uMk',
    'aXFs0DO3qW4',
    '7LcyjihJtg0',
    'a8VyRDDx3SE'
  ];

  return (
    <section className="py-12 md:py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 xl:px-8 mb-8 text-center">
        <div className="inline-flex items-center justify-center gap-2 text-red-600 font-bold mb-4 bg-red-50 px-4 py-2 rounded-full">
          <Youtube size={24} />
          <span>YouTubeで作業の様子を公開中！</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          フッ軽ちゃんねる
        </h2>
        <a 
          href="https://www.youtube.com/@fukkaru_fuji-benriya" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block mt-4 text-brand-blue hover:text-blue-700 font-bold underline underline-offset-4"
        >
          @fukkaru_fuji-benriya
        </a>
      </div>

      {/* 横スクロール対応のコンテナ */}
      <div className="container mx-auto px-4 sm:px-6 xl:px-8 relative group">
        {/* 左スクロールボタン (デスクトップ用) */}
        <button 
          onClick={() => scroll('left')} 
          className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 z-10 bg-white/95 p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 text-gray-800 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="前へ"
        >
          <ChevronLeft size={28} />
        </button>

        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
        >
          {videoIds.map((id, index) => (
            <div key={index} className="flex-none w-[85vw] sm:w-[400px] md:w-[450px] snap-center shrink-0">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-100 bg-gray-100">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${id}`}
                  title={`YouTube video player ${index + 1}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          ))}
        </div>

        {/* 右スクロールボタン (デスクトップ用) */}
        <button 
          onClick={() => scroll('right')} 
          className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 z-10 bg-white/95 p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 text-gray-800 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="次へ"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default YouTubeVideos;