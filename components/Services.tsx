import React, { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';

// link を持つ項目は、作業ごとの詳細ページへ案内します（2026-09-04）。
// トップに全部を書くと重くなるうえ、トップの中身は JavaScript の中にあって
// Google からは読めません。**詳しい話は静的なページ側に置きます。**
type Service = { title: string; price: string; desc: string; popular?: boolean; link?: string };
type Group = { id: string; title: string; note: string; services: Service[]; defaultOpen?: boolean };

const groups: Group[] = [
  {
    id: 'garden',
    title: '庭・外まわりのお手入れ',
    note: '草むしりから伐採、防草シートまで',
    defaultOpen: true,
    services: [
      { title: '草むしり（手作業）', price: '8,000円〜', desc: '根元から丁寧に抜き取ります', popular: true , link: '/service/kusakari/' },
      { title: '草刈り（機械使用）', price: '10,000円〜', desc: '草刈機で広い範囲に対応します', link: '/service/kusakari/' },
      { title: '木の伐採', price: '9,000円〜', desc: '高さ3m未満・地上からの作業', link: '/service/kusakari/' },
      { title: '防草シート・砂利敷き', price: '10,000円〜', desc: '資材費は別途', link: '/service/kusakari/' },
    ],
  },
  {
    id: 'indoor',
    title: '室内・引越しのお手伝い',
    note: '家具の組立・移動、軽貨物での運搬',
    defaultOpen: true,
    services: [
      { title: '家具・デスクの組み立て', price: '8,000円〜', desc: '複雑な家具や昇降デスクも承ります' , link: '/service/kagu-kumitate/' },
      { title: '家具の移動・模様替え', price: '8,000円〜', desc: '室内の移動、階をまたぐ移動', link: '/service/kagu-kumitate/' },
      { title: '軽引越し', price: '15,000円〜', desc: '単身の方、少量のお引越しに', popular: true, link: '/blog/fuji-unpan-kaitori-guide/' },
      { title: '荷造り・荷解き', price: '1時間8,000円〜', desc: '箱詰めから、運んだ先での開梱まで', link: '/blog/fuji-unpan-kaitori-guide/' },
      { title: '不用品の運搬・買取', price: '5,000円〜', desc: 'まだ使えるものは買取、運び出しも承ります', popular: true , link: '/blog/fuji-unpan-kaitori-guide/' },
      { title: '法人向けの緊急運搬', price: '要お見積り', desc: '急ぎの配送・運送に対応します', link: '/blog/fuji-unpan-kaitori-guide/' },
    ],
  },
  {
    id: 'cleaning',
    title: '清掃・洗浄',
    note: '家の外まわり、駐車場、汚水枡の洗浄',
    services: [
      { title: '高圧洗浄', price: '15,000円〜', desc: '家の外まわり、駐車場の洗浄', popular: true , link: '/service/senjo/' },
      { title: 'カーポート洗浄', price: '12,000円〜', desc: '屋根や柱の汚れ落とし', popular: true, link: '/service/senjo/' },
      { title: '出張洗車', price: '8,000円〜', desc: '手洗いと車内の清掃', link: '/service/senjo/' },
      { title: '汚水枡の洗浄', price: '6,000円〜', desc: '家庭用・小型店舗用' , link: '/service/senjo/' },
    ],
  },
  {
    id: 'other',
    title: 'その他の代行',
    note: '物置の設置・解体、買い物の代行',
    services: [
      { title: '物置の設置・解体', price: '15,000円〜', desc: 'お庭のスペースを有効に使えます', popular: true , link: '/service/monooki/' },
      { title: '買い物代行', price: '7,000円〜', desc: '重い物、遠方への買い出しも' },
    ],
  },
];

const ServiceGroup: React.FC<{ group: Group }> = ({ group }) => {
  const [isOpen, setIsOpen] = useState(Boolean(group.defaultOpen));
  // 開け閉めのボタンと、開く中身を結びつけるための名前。
  const panelId = `services-${group.id}`;

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-canvas sm:px-6 sm:py-5"
      >
        <span className="min-w-0">
          <span className="block text-[16px] font-semibold tracking-tight text-ink-900">{group.title}</span>
          <span className="mt-0.5 block truncate text-[13px] text-ink-500">{group.note}</span>
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-ink-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <dl id={panelId} className="rule-list border-t border-hairline">
          {group.services.map((s) => (
            <div key={s.title} className="flex flex-wrap items-baseline justify-between gap-x-4 px-5 py-4 sm:px-6">
              <dt className="min-w-0 flex-1 flex flex-wrap items-center gap-2 text-[15px] font-medium text-ink-900">
                {s.title}
                {s.popular && <span className="chip chip-accent">人気</span>}
              </dt>
              <dd className="shrink-0 text-[15px] font-semibold tabular-nums tracking-tight text-ink-900">
                {s.price}
              </dd>
              {/* 説明は幅いっぱいにして、項目名と料金の下の行に回します。 */}
              <dd className="mt-1 w-full text-[13px] leading-relaxed text-ink-500">
                {s.desc}
                {s.link && (
                  <>
                    {' '}
                    <a href={s.link} className="whitespace-nowrap font-medium text-ink-900 underline underline-offset-2">
                      くわしく →
                    </a>
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};

const Services: React.FC = () => {
  return (
    <section id="services" className="section border-t border-hairline bg-canvas">
      <div className="shell">
        <div className="max-w-2xl">
          <span className="eyebrow">Services</span>
          <h2 className="h-section">サービスと料金</h2>
          <p className="lede">
            お庭の手入れから重い物の移動まで。記載のない作業も、できるかぎり柔軟に対応します。
          </p>
        </div>

        <div className="mt-12 grid items-start gap-5 lg:grid-cols-2">
          {groups.map((group) => (
            <ServiceGroup key={group.id} group={group} />
          ))}
        </div>

        <div className="mt-6 card p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-[17px] font-semibold tracking-tight text-ink-900">
                お見積もり・ご相談は無料です
              </h3>
              <p className="mt-2 max-w-2xl text-[14px] leading-[1.85] text-ink-500">
                作業の内容や現場の状況によって、適切なプランと料金をご案内します。
                まずは「こんなこと頼める？」とお声がけください。LINEで写真をお送りいただくお見積りは、エリアを問わず無料です。現地に伺う出張費も、富士市・富士宮市・静岡市・沼津市ならいただきません。{' '}
                <a href="/service/" className="whitespace-nowrap font-medium text-ink-900 underline underline-offset-2">
                  できることと料金の一覧 →
                </a>
              </p>
              <p className="mt-3 max-w-2xl text-[14px] leading-[1.85] text-ink-600">
                ご高齢の方、力仕事にご不安がある方はお気軽にお電話ください。
                礼儀正しく丁寧なスタッフが、皆様の暮らしを安全にサポートいたします。
              </p>
            </div>
            <a href="#contact" className="btn btn-primary shrink-0">
              <MessageCircle size={17} />
              無料で相談する
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
