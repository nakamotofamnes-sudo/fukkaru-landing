import React from 'react';
import { ArrowUpRight } from 'lucide-react';

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

// 以前は横に流れ続けるスライダーでしたが、
// 6社なら並べて置いたほうが読めますし、動き続けるものは目が休まりません。
const Partners: React.FC = () => {
  return (
    <section id="partners" className="section border-t border-hairline bg-canvas">
      <div className="shell">
        <div className="max-w-2xl">
          <span className="eyebrow">Partners</span>
          <h2 className="h-section">協力会社</h2>
          <p className="lede">
            フッ軽だけでは手が届かない工事や専門作業は、信頼できる会社におつなぎしています。
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card card-hover group flex flex-col overflow-hidden"
            >
              <div className="flex h-28 items-center justify-center border-b border-hairline bg-canvas p-4">
                {partner.imageUrl ? (
                  <img
                    src={partner.imageUrl}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="px-3 text-center text-[13px] font-medium leading-snug text-ink-500">
                    {partner.name}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="flex items-start justify-between gap-2 text-[15px] font-semibold text-ink-900">
                  {partner.name}
                  <ArrowUpRight size={16} className="mt-0.5 shrink-0 text-ink-500 transition-colors group-hover:text-ink-900" />
                </h3>
                <p className="mt-2 text-[13px] leading-[1.8] text-ink-500">{partner.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
