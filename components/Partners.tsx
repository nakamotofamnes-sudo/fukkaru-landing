import React, { useRef, useEffect } from 'react';

interface Partner {
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
}

const partners: Partner[] = [
  {
    name: 'お手伝い屋',
    description: '埼玉の松江で便利屋頼むならここにお問合せ。地域密着で様々なトラブルを解決します。',
    url: 'https://otetsudaiya.jp/',
    imageUrl: 'https://res.cloudinary.com/dyclm0vti/image/upload/v1776848412/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88_2026-04-22_17.58.52_wj2dfz.png',
  },
  {
    name: 'K-PLAN',
    description: '塗装工事・リフォーム工事の専門業者。塗装・防水・足場・外構など家屋のメンテナンスはお任せください。経験豊富な有資格者が最適な施工をご提案します。',
    url: 'https://k-plan.top/',
    imageUrl: 'https://res.cloudinary.com/dyclm0vti/image/upload/v1780030592/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88_2026-05-29_13.56.21_zfr5ov.png',
  },
  {
    name: '信濃屋',
    description: 'さいたま市を中心に活動する剪定・高所特殊伐採の専門業者。「重機が入らない」「他で断られた」といった難しい伐採やお庭のお悩みを真心こめて解決いたします。',
    url: 'https://shinanoya01.com/',
    imageUrl: 'https://res.cloudinary.com/dyclm0vti/image/upload/v1780030526/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88_2026-05-28_8.32.01_w5tc5r.png',
  },
  {
    name: '地域の寄り添い処 つむぎ',
    description: '介護福祉士が運営する生活支援・お出かけサポートサービス。家事や買い物の支援、お墓参り・病院の付き添い、見守りなど、地域のお年寄りのちょっとした困りごとに寄り添います。',
    url: 'https://www.canva.com/design/DAHIMooiTTY/pfUyEnObIBJbnYtJ2fp49w/edit',
  },
  {
    name: '株式会社望月塗装工業所',
    description: '富士市で自動車の鈑金塗装・修理・車検・カーリースを行う専門業者。最新の設備とプロスタッフが大切なお車をサポートいたします。',
    url: 'https://www.auto-mochiduki.com/',
  },
  {
    name: 'アリサラのうんてい屋さん',
    description: '知育・育脳に基づいた設計で、子供の運動能力や考える力を育むフルオーダーメイドの「知育うんてい」専門店。年間600台以上の制作実績があり、プロ集団がご家庭に合わせた世界に一つだけのうんていを制作します。',
    url: 'https://untei.jp/',
    imageUrl: 'https://res.cloudinary.com/dyclm0vti/image/upload/v1785409389/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88_2026-07-30_20.00.56_mkti92.png',
  },
];

const Partners: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isInteracting = useRef(false);
  const currentPos = useRef(0);
  const startX = useRef(0);
  const startPos = useRef(0);
  const dragDistance = useRef(0);

  // 画面幅が広い場合でもシームレスにループするように複製
  const duplicateTimes = 6;
  const singleSet = Array.from({ length: duplicateTimes }).flatMap(() => partners);
  const slideItems = [...singleSet, ...singleSet];

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let animationFrameId: number;
    let lastTime = Date.now();

    const scroll = () => {
      const now = Date.now();
      let dt = now - lastTime;
      // タブが裏側に回った時のカクつきを防止
      if (dt > 100) dt = 16;
      lastTime = now;

      // インタラクトされていない時に等速で自動スクロール
      if (!isInteracting.current) {
        currentPos.current += dt * 0.03; // スクロール速度
      }

      const halfWidth = el.scrollWidth / 2;

      // 無限ループ処理：半分を超えたら最初に戻す
      if (currentPos.current >= halfWidth && halfWidth > 0) {
        currentPos.current -= halfWidth;
      } else if (currentPos.current < 0 && halfWidth > 0) {
        // 逆方向にスクロールした場合の処理
        currentPos.current += halfWidth;
      }

      // GPUアクセラレーションを使用して小数点以下のピクセルまで滑らかに移動
      el.style.transform = `translate3d(-${currentPos.current}px, 0, 0)`;

      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const getClientX = (e: React.MouseEvent | React.TouchEvent) => {
    return 'touches' in e ? e.touches[0].clientX : e.clientX;
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    isInteracting.current = true;
    dragDistance.current = 0;
    startX.current = getClientX(e);
    startPos.current = currentPos.current;
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isInteracting.current) return;
    const x = getClientX(e);
    const deltaX = x - startX.current;
    dragDistance.current += Math.abs(x - startX.current); // 移動したトータル距離をざっくり追跡
    currentPos.current = startPos.current - deltaX;
  };

  const handleEnd = () => {
    isInteracting.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    // 指やマウスで画面を大きく引っ張った（ドラッグした）場合は
    // 間違えてリンクをクリックしてしまうのを防ぐ
    if (dragDistance.current > 10) {
      e.preventDefault();
    }
  };

  return (
    <section id="partners" className="bg-gray-50 py-12 border-t border-b border-gray-200 overflow-hidden select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8 mt-2">
        <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1 after:bg-brand-orange">
          協力会社様一覧
        </h2>
      </div>

      <div className="relative w-full py-4 cursor-grab active:cursor-grabbing overflow-hidden">
        {/* レール(translate3dで丸ごと動かす) */}
        <div 
          ref={trackRef}
          className="flex w-max"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          onTouchCancel={handleEnd}
          onClick={handleClick}
        >
          {slideItems.map((partner, index) => (
            <a 
              key={index} 
              href={partner.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-shrink-0 w-64 md:w-72 mx-3 block group/item overflow-hidden rounded-xl bg-white transition-colors border border-gray-100 hover:border-brand-blue hover:shadow-lg p-4 flex flex-col items-center text-center"
              draggable={false} // ネイティブのドラッグによる画像のゴーストを防ぐ
            >
              <div className="w-full h-24 mb-3 overflow-hidden rounded flex items-center justify-center bg-gray-50 border border-gray-50 pointer-events-none">
                {partner.imageUrl ? (
                  <img 
                    src={partner.imageUrl} 
                    alt={`${partner.name}のロゴ・画像`} 
                    className="max-w-full max-h-full object-contain group-hover/item:scale-105 transition-transform duration-300 pointer-events-none" 
                    draggable={false}
                  />
                ) : (
                  <div className="text-gray-400 font-bold text-sm tracking-widest leading-tight px-2 pointer-events-none">{partner.name}</div>
                )}
              </div>
              <h3 className="font-bold text-brand-blue text-[15px] mb-2 pointer-events-none">{partner.name}</h3>
              <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed w-full pointer-events-none">{partner.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
