import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

/**
 * Google Driveの共有リンクを直接表示可能な画像URLに変換するヘルパー関数
 */
const getOptimizedImageUrl = (url: string) => {
  if (!url) return '';
  
  // Check if it is a Google Drive URL
  if (url.includes('drive.google.com')) {
    // Extract File ID
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      // ヒーロー画像用に高解像度を指定
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w2560`;
    }
  }
  
  return url;
};

type HeroProps = {
  onNavigate: (view: 'home' | 'consultation', hash?: string) => void;
};

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  // Infinite Scrolling Background Image
  const bgImageUrl = "https://res.cloudinary.com/dyclm0vti/image/upload/v1772757439/hi-ro-%E3%83%92%E3%82%99%E3%83%A5%E3%83%BC_w3lcfl.png";

  // Prominent Woman Image (Foreground/Background Layer)
  const womanImageUrl = "https://res.cloudinary.com/dyclm0vti/image/upload/v1772757439/%E3%83%A2%E3%83%86%E3%82%99%E3%83%AB%E3%83%92%E3%83%BC%E3%83%AD%E3%83%BC%E3%83%92%E3%82%99%E3%83%A5%E3%83%BC_cqufdm.png";

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden bg-brand-blue mobile-section">
      {/* 
        Animated Background Wrapper
        Fix: Use w-max container and h-full w-auto images to ensure exact slide distance
        without distorting or cropping the before/after image.
      */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="flex animate-slide-bg w-max h-full">
          <img 
            src={getOptimizedImageUrl(bgImageUrl)} 
            alt="Background Pattern 1" 
            className="h-full w-auto min-w-[100vw] max-w-none object-cover"
          />
          <img 
            src={getOptimizedImageUrl(bgImageUrl)} 
            alt="Background Pattern 2" 
            className="h-full w-auto min-w-[100vw] max-w-none object-cover"
          />
        </div>
      </div>

      {/* 
        Gradient Overlay
        - Placed behind text but covering the background slide.
      */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent"></div>
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900/95 via-transparent to-transparent md:hidden"></div>

      {/* 
        Woman Image Layer
        - Z-index 20: Above background/gradient, but Below text (z-30).
      */}
      <div className="absolute bottom-0 right-0 z-20 pointer-events-none flex items-end justify-end
        /* Mobile: Shorter height to avoid overlapping with buttons/badge, high opacity, shifted right */
        h-[60vh] w-auto opacity-90 translate-x-[15%]
        /* Tablet: High opacity, aligned to right edge, slightly adjusted height to fit well */
        md:h-[85vh] md:opacity-100 md:translate-x-0
        /* Desktop: Full visibility */
        lg:h-[100vh] lg:opacity-100 lg:translate-x-0
      ">
            <img 
            src={getOptimizedImageUrl(womanImageUrl)} 
            alt="スタッフ" 
            className="h-full w-auto object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
        />
      </div>

      {/* 
        Text Content Area
        - Z-index 30: Highest priority to sit on top of everything.
      */}
      <div className="container mx-auto mobile-px relative z-30 pt-16 pb-10 h-full flex flex-col justify-center">
        <div className="w-full lg:w-3/5 text-white">
          <div className="inline-block bg-brand-orange text-white px-4 py-1.5 lg:px-6 lg:py-2.5 rounded-full text-xs lg:text-sm font-black tracking-widest mb-6 lg:mb-8 shadow-lg shadow-orange-500/30">
            富士市・富士宮市エリア対応（市外もご相談OK！）
          </div>
          <h1 className="text-[23px] min-[390px]:text-[26px] sm:text-4xl lg:text-[2.8rem] xl:text-[3.2rem] lg:leading-[1.4] xl:leading-[1.4] font-black mb-6 drop-shadow-xl tracking-tight text-white leading-[1.45] w-full">
            <span className="block mb-2 md:mb-0 md:inline-block md:whitespace-nowrap">
              年齢とともに自分でやるのが<br className="md:hidden" />
              <strong>大変に・・・</strong>
            </span>
            <br className="hidden md:block"/>
            <span className="block mb-2 md:mb-0 md:inline-block md:whitespace-nowrap">
              そんな<strong className="text-brand-orange drop-shadow-md">「力仕事や面倒なこと」</strong>は
            </span>
            <br className="hidden md:block"/>
            <span className="block md:inline-block md:whitespace-nowrap">
              私たちプロにお任せください！
            </span>
          </h1>
          {/* Increased bottom margin to accommodate the social proof badge without overlap */}
          <p className="text-base md:text-lg lg:text-xl mb-12 leading-loose text-white/90 max-w-2xl drop-shadow-md font-medium tracking-wide">
            <strong>重い家具の移動</strong>、溜まった<strong>庭の草むしり</strong>、<strong>外構掃除</strong>、<strong>不用品のお片付け</strong>まで。<br/>
            「遠方の子供に頼むのも気が引ける…」とご無理をされる前に、<br className="hidden md:block" />誠実で礼儀正しい地域密着の「フッ軽」が安全に解決します！
          </p>
          
          <div className="flex flex-col sm:flex-row mobile-gap relative z-40 items-start">
            <div className="relative">
                {/* Social Proof Badge */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-max bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce border border-white/20">
                    🔥 今月16人が相談中
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
                </div>
                <a 
                  href="https://lin.ee/Bh5gFU6" 
                  className="bg-brand-green hover:bg-green-600 text-white mobile-btn font-bold shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105"
                >
                  <MessageCircle size={24} />
                  LINEで無料相談・見積もり
                </a>
            </div>
            <a 
              href="tel:0545-78-3704" 
              className="bg-white hover:bg-gray-100 text-brand-blue mobile-btn font-bold shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105"
            >
              <Phone size={24} />
              電話で今すぐ相談
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm opacity-95">
            <div className="bg-blue-950/50 backdrop-blur-md px-4 py-2 rounded border border-white/20 shadow-sm">
              <span className="font-bold text-brand-orange">安心:</span> 経験豊富なプロが対応
            </div>
            <div className="bg-blue-950/50 backdrop-blur-md px-4 py-2 rounded border border-white/20 shadow-sm">
              <span className="font-bold text-brand-orange">最短:</span> 即日訪問可能
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;