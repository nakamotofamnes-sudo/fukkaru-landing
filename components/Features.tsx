import React from 'react';
import { Truck, MessagesSquare, Home } from 'lucide-react';

/** Googleドライブの共有リンクを、そのまま表示できる画像URLに直します。 */
const getOptimizedImageUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  return url;
};

const reasons = [
  {
    title: 'すぐ駆けつけます',
    description:
      '富士市・富士宮市を中心に、最短即日で伺います（市外もご相談ください）。「体力的にしんどい」というご要望に、フットワーク軽くお応えします。',
    icon: Truck,
    imageUrl: 'https://res.cloudinary.com/dyclm0vti/image/upload/v1773024410/1_drrtxv.png',
  },
  {
    title: '説明が丁寧です',
    description:
      '「こんな小さなこと、頼んでいいのかな」という遠慮は要りません。お見積もりと作業内容を分かりやすくご説明し、繰り返しご依頼をいただいています。',
    icon: MessagesSquare,
    imageUrl: 'https://res.cloudinary.com/dyclm0vti/image/upload/v1773024411/2_sz9b13.png',
  },
  {
    title: 'まとめて片づきます',
    description:
      '家具の移動、不用品の片づけ、草むしりから外構の掃除まで。業者をいくつも探す手間なく、お家まわりの力仕事をまるごと代行します。',
    icon: Home,
    imageUrl: 'https://res.cloudinary.com/dyclm0vti/image/upload/v1773024411/3_lwbdcx.png',
  },
];

const Features: React.FC = () => {
  return (
    <section id="reasons" className="section border-t border-hairline">
      <div className="shell">
        <div className="max-w-2xl">
          <span className="eyebrow">Reasons</span>
          <h2 className="h-section">フッ軽が選ばれる理由</h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reasons.map((item, index) => (
            <article key={item.title} className="card card-hover overflow-hidden">
              <div className="aspect-[4/3] w-full bg-ink-100">
                <img
                  src={getOptimizedImageUrl(item.imageUrl)}
                  alt=""
                  className="h-full w-full object-cover object-[50%_28%]"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold tabular-nums text-ink-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <item.icon size={18} className="text-ink-500" />
                </div>
                <h3 className="mt-3 text-[18px] font-semibold tracking-tight text-ink-900">{item.title}</h3>
                <p className="mt-2.5 text-[14px] leading-[1.85] text-ink-500">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
