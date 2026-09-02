import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

/** Googleドライブの共有リンクを、そのまま表示できる画像URLに直します。 */
const getOptimizedImageUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w2560`;
  }
  return url;
};

const Hero: React.FC = () => {
  const bgImageUrl = 'https://res.cloudinary.com/dyclm0vti/image/upload/v1772757439/hi-ro-%E3%83%92%E3%82%99%E3%83%A5%E3%83%BC_w3lcfl.png';
  const womanImageUrl = 'https://res.cloudinary.com/dyclm0vti/image/upload/v1772757439/%E3%83%A2%E3%83%86%E3%82%99%E3%83%AB%E3%83%92%E3%83%BC%E3%83%AD%E3%83%BC%E3%83%92%E3%82%99%E3%83%A5%E3%83%BC_cqufdm.png';

  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden bg-ink-900">
      {/* 流れる背景写真 */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-35">
        <div className="flex h-full w-max animate-slide-bg">
          <img src={getOptimizedImageUrl(bgImageUrl)} alt="" className="h-full w-auto min-w-[100vw] max-w-none object-cover" />
          <img src={getOptimizedImageUrl(bgImageUrl)} alt="" className="h-full w-auto min-w-[100vw] max-w-none object-cover" />
        </div>
      </div>

      {/* 文字を読ませるための覆い。グラデーションではなく、単色の膜を2枚重ねます。 */}
      <div className="absolute inset-0 z-10 bg-ink-900/70" />
      <div className="absolute inset-0 z-10 bg-ink-900/40 lg:bg-transparent" />

      {/* 人物写真。画面が狭いほど文字と重なるので、そのぶん薄くして背景になじませます。
          パソコン（lg以上）は重ならないので、そのままの濃さで出します。
          実在の従業員ではなくモデルの写真なので、飾りとして扱い alt は空にしています。 */}
      <div className="pointer-events-none absolute bottom-0 right-0 z-20 flex h-[44vh] items-end justify-end opacity-30 sm:h-[70vh] sm:opacity-40 md:h-[82vh] md:opacity-40 lg:h-[94vh] lg:opacity-100">
        <img src={getOptimizedImageUrl(womanImageUrl)} alt="" className="h-full w-auto object-contain object-bottom" />
      </div>

      <div className="shell relative z-30 pt-24 pb-16">
        <div className="w-full lg:w-[66%]">
          <p className="mb-6 inline-flex items-center rounded border border-white/20 bg-white/10 px-3 py-1.5 text-[12px] font-medium tracking-[0.04em] text-white backdrop-blur-sm">
            富士市・富士宮市エリア対応（市外もご相談ください）
          </p>

          {/* 1行が長いと折り返しが読みにくいので、行そのものを分けて置きます。 */}
          <h1 className="mb-6 text-[26px] font-bold leading-[1.5] tracking-tight text-white sm:text-[32px] lg:text-[38px] lg:leading-[1.45]">
            <span className="block">年齢とともに、自分でやるのが大変に。</span>
            <span className="block">その力仕事と面倒ごとは、</span>
            <span className="block text-accent-line">私たちにお任せください。</span>
          </h1>

          <p className="mb-10 max-w-xl text-[15px] leading-[1.9] text-white/80 sm:text-base">
            重い家具の移動、溜まった庭の草むしり、外構掃除、不用品のお片付けまで。
            「遠方の子どもに頼むのも気が引ける」とご無理をされる前に、
            地域密着のフッ軽が安全に片づけます。
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="https://lin.ee/Bh5gFU6" className="btn btn-line btn-lg w-full sm:w-auto">
              <MessageCircle size={18} />
              LINEで無料相談・見積もり
            </a>
            <a href="tel:0545-78-3704" className="btn btn-lg w-full border border-white/30 text-white hover:bg-white/10 sm:w-auto">
              <Phone size={18} />
              電話で相談する
            </a>
          </div>

          {/* 事実だけを、飾らずに置きます。 */}
          <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-6 text-white/75">
            <div>
              <dt className="text-[12px] tracking-[0.06em] text-white/60">見積もり・出張費</dt>
              <dd className="mt-1 text-[15px] font-semibold text-white">無料（富士市・富士宮市）</dd>
            </div>
            <div>
              <dt className="text-[12px] tracking-[0.06em] text-white/60">最短</dt>
              <dd className="mt-1 text-[15px] font-semibold text-white">即日訪問</dd>
            </div>
            <div>
              <dt className="text-[12px] tracking-[0.06em] text-white/60">受付</dt>
              <dd className="mt-1 text-[15px] font-semibold text-white">LINEは24時間</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
};

export default Hero;
