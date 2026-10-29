import React, { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import Kyara from './Kyara';

// link を持つ項目は、作業ごとの詳細ページへ案内します（2026-09-04）。
// トップに全部を書くと重くなるうえ、トップの中身は JavaScript の中にあって
// Google からは読めません。**詳しい話は静的なページ側に置きます。**
type Service = { title: string; price: string; desc: string; popular?: boolean; link?: string };
// hidden の分類は、画面（トップと /service/）には出さない。
// 料金は記事の道具の金額の弁が読むので、行は消さずに残す（2026-10-20 中元さん
// 「あそこにあると普通の依頼が来なくなる」。管理は専用サイトで案内する）。
type Group = { id: string; title: string; note: string; services: Service[]; defaultOpen?: boolean; hidden?: boolean };

const groups: Group[] = [
  {
    id: 'regular-care',
    title: '空き家・マンションの管理',
    note: '4市対応／訪問回数・作業場所・月額を最初に決定。共用部は月額内の床洗浄の範囲・回数を開始前に決定',
    defaultOpen: true,
    hidden: true,
    services: [
      { title: '空き家・外まわりのお手入れ', price: '月額4,400円〜', desc: '税込・月1回。外まわり確認・玄関清掃・指定範囲の小さな草取り・写真報告', link: 'https://fuji.creo-sumai.jp/#vacant' },
      { title: '空き家・室内込みのお手入れ', price: '月額6,600円〜', desc: '税込・月1回。外まわりに加え、換気・通水・室内の目視確認', link: 'https://fuji.creo-sumai.jp/#vacant' },
      { title: 'アパート・マンション共用部の清掃（月1回）', price: '月額5,500円〜', desc: '税込・合意した範囲と回数の床洗浄を含む。実施時期は汚れを見て写真で相談', link: 'https://fuji.creo-sumai.jp/#apartment' },
      { title: 'アパート・マンション共用部の清掃（月2回）', price: '月額9,900円〜', desc: '税込・合意した範囲と回数の床洗浄を含む。実施時期は汚れを見て写真で相談', link: 'https://fuji.creo-sumai.jp/#apartment' },
    ],
  },
  {
    id: 'garden',
    title: '庭・外まわりのお手入れ',
    note: '草むしりから伐採、防草シートまで',
    defaultOpen: true,
    services: [
      { title: '草むしり（手作業）', price: '8,000円〜', desc: '根元から丁寧に抜き取ります', popular: true , link: '/blog/kusakari/' },
      { title: '草刈り（機械使用）', price: '10,000円〜', desc: '草刈機で広い範囲に対応します', link: '/blog/kusakari/' },
      { title: '木の伐採', price: '9,000円〜', desc: '地上からの作業', link: '/blog/kusakari/' },
      { title: '防草シート・砂利敷き', price: '10,000円〜', desc: '資材費は別途', link: '/blog/kusakari/' },
      { title: '刈った草・木の持ち込み', price: '8,000円〜', desc: '軽トラック1車ぶん・富士市', link: '/blog/kusakari/' },
    ],
  },
  {
    id: 'indoor',
    title: '室内・引越しのお手伝い',
    note: '家具の組立・移動、軽貨物での運搬',
    defaultOpen: true,
    services: [
      { title: '家具・デスクの組み立て', price: '8,000円〜', desc: '複雑な家具や昇降デスクも承ります' , link: '/blog/kagu-kumitate/' },
      { title: '家具の移動・模様替え', price: '8,000円〜', desc: '室内の移動、階をまたぐ移動', link: '/blog/kagu-kumitate/' },
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
      { title: '高圧洗浄', price: '15,000円〜', desc: '家の外まわり、駐車場の洗浄', popular: true , link: '/blog/senjo/' },
      { title: 'カーポート洗浄', price: '12,000円〜', desc: '屋根や柱の汚れ落とし', popular: true, link: '/blog/senjo/' },
      { title: '出張洗車', price: '8,000円〜', desc: '手洗いと車内の清掃', link: '/blog/senjo/' },
      { title: '汚水枡の洗浄', price: '6,000円〜', desc: '家庭用・小型店舗用' , link: '/blog/senjo/' },
    ],
  },
  {
    id: 'other',
    title: 'その他の代行',
    note: '物置の設置・解体、買い物の代行',
    services: [
      { title: '物置の設置・解体', price: '15,000円〜', desc: 'お庭のスペースを有効に使えます', popular: true , link: '/blog/monooki/' },
      { title: '物置のアンカー固定', price: '10,000円〜', desc: '土・アスファルト・コンクリート。アンカーだけのご依頼も承ります', link: '/blog/monooki-anchor/' },
      { title: 'まだ使える物置の引き取り', price: '8,000円〜', desc: 'サイズにより変わります', link: '/blog/fuji-monooki-hikiteri-ryokin-benriya/' },
      { title: '買い物代行', price: '7,000円〜', desc: '重い物、遠方への買い出しも', link: '/blog/kaimono/' },
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

      {/* 閉じていても中身は置いておく（AIが読めるように）。画面では隠す */}
      <dl id={panelId} hidden={!isOpen} className="rule-list border-t border-hairline">
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
          {groups.filter((group) => !group.hidden).map((group) => (
            <ServiceGroup key={group.id} group={group} />
          ))}
        </div>

        {/* 2026-10-29：相談の箱を淡い琥珀にして、ボタンを指さす中元さんのキャラを立たせる（ブログの相談の箱と同じ形）。
            キャラの足を箱の下の線にそろえるため、下の余白は字とボタンの側に持たせる。
            淡い琥珀の上では ink-500 が 4.5:1 を切るので、説明の字は ink-600 に。文言はそのまま */}
        <div className="mt-6 rounded border border-accent-line bg-accent-soft px-6 pt-6 sm:px-8 sm:pt-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="sm:pb-8">
              <h3 className="text-[17px] font-semibold tracking-tight text-ink-900">
                お見積もり・ご相談は無料です
              </h3>
              <p className="mt-2 max-w-2xl text-[14px] leading-[1.85] text-ink-600">
                作業の内容や現場の状況によって、適切なプランと料金をご案内します。
                まずは「こんなこと頼める？」とお声がけください。LINEで写真をお送りいただくお見積りは、エリアを問わず無料です。現地に伺う出張費も、富士市・富士宮市・静岡市・沼津市ならいただきません。{' '}
                <a href="/blog/service/" className="whitespace-nowrap font-medium text-ink-900 underline underline-offset-2">
                  できることと料金の一覧 →
                </a>
              </p>
              <p className="mt-3 max-w-2xl text-[14px] leading-[1.85] text-ink-600">
                ご高齢の方、力仕事にご不安がある方はお気軽にお電話ください。
                礼儀正しく丁寧なスタッフが、皆様の暮らしを安全にサポートいたします。
              </p>
            </div>
            <div className="flex shrink-0 items-end justify-between gap-3 sm:justify-end">
              <a href="#contact" className="btn btn-primary mb-6 shrink-0 sm:mb-8">
                <MessageCircle size={17} />
                無料で相談する
              </a>
              <Kyara name="point" className="[--k:.24] sm:[--k:.28]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
