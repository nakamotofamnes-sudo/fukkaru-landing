import React, { useRef, useState } from 'react';
import { ChevronRight, Droplets, Home, MessageCircle, Sofa, Star, Trees, Warehouse, type LucideIcon } from 'lucide-react';
import Kyara from './Kyara';
import Kugiri from './Kugiri';

// link を持つ項目は、作業ごとの詳細ページへ案内します（2026-09-04）。
// トップに全部を書くと重くなるうえ、トップの中身は JavaScript の中にあって
// Google からは読めません。**詳しい話は静的なページ側に置きます。**
type Service = { title: string; price: string; desc: string; popular?: boolean; link?: string };
// hidden の分類は、画面（トップと /service/）には出さない。
// 料金は記事の道具の金額の弁が読むので、行は消さずに残す（2026-10-20 中元さん
// 「あそこにあると普通の依頼が来なくなる」。管理は専用サイトで案内する）。
type Group = { id: string; title: string; note: string; services: Service[]; defaultOpen?: boolean; hidden?: boolean };

// 見積もりの予約（/yoyaku/）も、作業の名前をここから読む（2026-11-19）。写しを作らないため export
export const groups: Group[] = [
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
  // 空き家調査（2026-11-19）は画面にも出す。見積もりの予約（/yoyaku/）からも選べる（中元さん 11/20「予約の画面に出していい」）
  {
    id: 'akiya-chousa',
    title: '空き家調査',
    note: '1回8,000円〜・写真でご報告',
    services: [
      { title: '空き家調査', price: '8,000円〜', desc: '税込・1回。外まわりと、入れる場合は室内も確認し、写真でご報告。4市は出張費無料', link: '/blog/akiya/#chousa' },
    ],
  },
  {
    id: 'garden',
    title: '庭・外まわりのお手入れ',
    note: '草むしりから伐採・抜根、防草シートまで',
    defaultOpen: true,
    services: [
      { title: '草むしり（手作業）', price: '8,000円〜', desc: '根元から丁寧に抜き取ります', popular: true , link: '/blog/kusakari/' },
      { title: '草刈り（機械使用）', price: '10,000円〜', desc: '草刈機で広い範囲に対応します', link: '/blog/kusakari/' },
      { title: '木の伐採', price: '9,000円〜', desc: '地上からの作業', link: '/blog/kusakari/' },
      { title: '抜根（切り株の掘り起こし）', price: '9,000円〜', desc: '1株あたり。根の太さ・張り方で変わります。掘った根の持ち込みは別料金。大きな切り株は協力会社と一緒に作業します', link: '/blog/kusakari/' },
      { title: '防草シート・砂利敷き', price: '10,000円〜', desc: '資材費は別途', link: '/blog/kusakari/' },
      { title: '刈った草・木の持ち込み', price: '8,000円〜', desc: '軽トラック1車ぶん・富士市', link: '/blog/kusakari/' },
    ],
  },
  {
    id: 'indoor',
    title: '室内・引越しのお手伝い',
    note: '家具の組立・移動、お部屋の片付け、軽貨物での運搬',
    defaultOpen: true,
    services: [
      { title: '家具・デスクの組み立て', price: '8,000円〜', desc: '複雑な家具や昇降デスクも承ります' , link: '/blog/kagu-kumitate/' },
      { title: '家具の移動・模様替え', price: '8,000円〜', desc: '室内の移動、階をまたぐ移動', link: '/blog/kagu-kumitate/' },
      { title: '軽引越し', price: '15,000円〜', desc: '単身の方、少量のお引越しに', popular: true, link: '/blog/fuji-unpan-kaitori-guide/' },
      { title: '荷造り・荷解き', price: '1時間8,000円〜', desc: '箱詰めから、運んだ先での開梱まで', link: '/blog/fuji-unpan-kaitori-guide/' },
      // 2026-11-20 中元さん「買取は引取に変えて欲しい」。「まだ使える」は外さない（外すと、ごみの引き取りと読めて許認可の線を越える）
      { title: '不用品の運搬・まだ使えるものの引き取り', price: '5,000円〜', desc: 'まだ使えるものは引き取り、運び出しも承ります', popular: true , link: '/blog/fuji-unpan-kaitori-guide/' },
      // 2026-11-22 中元さん「1R・1K 4万から〜出していい」「決まった書き方でいい」。許認可の線：「まだ使えるものは」を外さない。処分は許可を持つ回収業者と一緒に（フッ軽が処分・回収するとは書かない）
      { title: 'お部屋の片付け・ゴミ屋敷・遺品整理', price: '40,000円〜', desc: '1R・1Kのめやす。広さと量で変わります。まだ使えるものは引き取り、それ以外は一般廃棄物の許可を持つ回収業者と一緒に片付けます' },
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

// ── ここから下は見せ方だけ（2026-11-21 作り直し）──────────────────────────
// 上の groups（料金のデータ）は触らない。記事の道具（blog.py）・記事読み（kiji_yomu.py）・
// サービス一覧のページ（build-blog.mjs）が、上の書き方のまま文字として読んでいる。
// この下に、上の料金の行と同じ書き方の文字を足すと、道具が金額として拾ってしまうので書かない。
//
// 中元さん（11/21）「口コミとサービスと料金のとこを、よりお客様が見やすく」。
// 前の形は、分類ごとに開け閉めする箱で、5つのうち3つが閉じていた（高圧洗浄や物置の料金は、押さないと見えなかった）。
// パソコンでは2列の箱の高さがそろわず、左に大きな空きが出ていた。
// いまの形：作業の種類を札（タブ）で並べ、押すとその料金が出る。最初は「人気」の札が付いた作業を集めて見せる。

// 分類ごとの線のアイコン。データの形を変えないため、見せる側で持つ
const ICON: Record<string, LucideIcon> = {
  'akiya-chousa': Home,
  garden: Trees,
  indoor: Sofa,
  cleaning: Droplets,
  other: Warehouse,
};

type Row = Service & { from?: string };
type Tab = { key: string; title: string; note: string; Icon: LucideIcon; rows: Row[]; ninki?: boolean };

const shown = groups.filter((group) => !group.hidden);
const tabs: Tab[] = [
  {
    key: 'popular',
    title: '人気の作業',
    note: 'よくご依頼いただく作業です',
    Icon: Star,
    rows: shown.flatMap((group) => group.services.filter((s) => s.popular).map((s) => ({ ...s, from: group.title }))),
    ninki: true,
  },
  ...shown.map((group) => ({ key: group.id, title: group.title, note: group.note, Icon: ICON[group.id] ?? Home, rows: group.services })),
];

// 札の名前は、最後の「の」のあとでだけ折り返す（「庭・外まわりのお手 / 入れ」のような切れ方を防ぐ）。
// 画面の幅で変わる切れ目に任せると、機種によって切れ方が変わる
const oriKaeshi = (title: string) => {
  const i = title.lastIndexOf('の');
  if (title.length <= 6 || i < 1) return title;
  return (
    <span className="break-keep">
      {title.slice(0, i + 1)}
      <wbr />
      {title.slice(i + 1)}
    </span>
  );
};

// 料金の1行。行のどこを押しても、作業ごとのくわしいページへ。
// スマホ：作業名／料金と「くわしく」／説明 の3段（説明を横いっぱいに使う。右に列を作ると説明が細くなり、最後の1字だけ次の行に落ちていた）
// パソコン：作業名と料金を左右に、説明と「くわしく」をその下に
// 作業名と説明は Kugiri で「、」「・」「。」のあとで区切り、1〜2字だけ次の行に落ちないようにする（/nihongo-kumihan）。
// text-wrap: pretty は使わない（Safari では段落全体の行をそろえて細く見える。11/19 にトップで外した）
const RyokinRow: React.FC<{ s: Row; ninki?: boolean }> = ({ s, ninki }) => (
  <div className="relative grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-canvas sm:gap-y-1.5 sm:px-6">
    <dt className="col-span-2 text-[15px] font-semibold leading-[1.6] text-ink-900 sm:col-span-1">
      {ninki && s.from && <span className="mb-0.5 block text-[12px] font-medium text-ink-500">{s.from}</span>}
      <Kugiri text={s.title} />
      {s.popular && !ninki && <span className="chip chip-accent ml-2 py-0.5 align-[1px]">人気</span>}
    </dt>
    <dd className="row-start-2 whitespace-nowrap text-[18px] font-bold leading-[1.5] tabular-nums tracking-tight text-ink-900 sm:col-start-2 sm:row-start-1 sm:text-right sm:text-[17px]">
      {s.price}
    </dd>
    <dd className="col-span-2 row-start-3 text-[13px] leading-relaxed text-ink-500 sm:col-span-1 sm:row-start-2">
      <Kugiri text={s.desc} ato="、・。" />
    </dd>
    {s.link && (
      <dd className="col-start-2 row-start-2 self-center text-right text-[13px] leading-relaxed sm:self-end">
        <a
          href={s.link}
          className="inline-flex items-center gap-0.5 whitespace-nowrap text-[13px] font-medium text-ink-900 underline underline-offset-2 after:absolute after:inset-0 after:content-['']"
        >
          くわしく
          <ChevronRight size={14} aria-hidden="true" />
        </a>
      </dd>
    )}
  </div>
);

const Services: React.FC = () => {
  const [active, setActive] = useState(tabs[0].key);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 矢印キーでも札を選べるように（キーボードで使う人のため）
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const last = tabs.length - 1;
    let to = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = i === last ? 0 : i + 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = i === 0 ? last : i - 1;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = last;
    if (to < 0) return;
    e.preventDefault();
    setActive(tabs[to].key);
    tabRefs.current[to]?.focus();
  };

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

        <div className="mt-10 grid items-start gap-4 lg:mt-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
          {/* 作業の種類の札。スマホは2列、パソコンは左に縦1列 */}
          <div>
            <p id="services-tabs-label" className="mb-3 text-[13px] font-medium text-ink-600">
              作業の種類を選ぶと、料金が切り替わります
            </p>
            <div role="tablist" aria-labelledby="services-tabs-label" className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-1">
              {tabs.map((t, i) => {
                const on = t.key === active;
                return (
                  <button
                    key={t.key}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`services-tab-${t.key}`}
                    aria-selected={on}
                    aria-controls={`services-${t.key}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setActive(t.key)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                    className={`flex min-h-[60px] items-center gap-2 rounded border bg-surface px-3 py-2.5 text-left transition-colors sm:gap-3 lg:px-4 lg:py-3 ${
                      on ? 'border-ink-900' : 'border-hairline hover:border-ink-300'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded border sm:h-9 sm:w-9 lg:h-10 lg:w-10 ${
                        on ? 'border-ink-900 bg-ink-900 text-white' : 'border-hairline bg-canvas text-ink-500'
                      }`}
                    >
                      <t.Icon size={18} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-[14px] font-semibold leading-snug lg:text-[15px] ${on ? 'text-ink-900' : 'text-ink-700'}`}>
                        {oriKaeshi(t.title)}
                      </span>
                      <span className="mt-0.5 hidden text-[12px] leading-snug text-ink-500 lg:block">{t.note}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 料金。選ばれていない札の中身も置いておく（AIや検索が読めるように）。画面では隠す */}
          <div>
            {tabs.map((t) => (
              <div
                key={t.key}
                role="tabpanel"
                id={`services-${t.key}`}
                aria-labelledby={`services-tab-${t.key}`}
                hidden={t.key !== active}
                className="card overflow-hidden"
              >
                <div className="flex items-center gap-3 border-b border-hairline px-5 py-4 sm:px-6 sm:py-5">
                  <span className="icon-frame">
                    <t.Icon size={20} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[17px] font-semibold tracking-tight text-ink-900">{t.title}</h3>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink-500">{t.note}</p>
                  </div>
                </div>
                {/* line-break: strict … 「ー」「。」「っ」が行の頭に来ないように（「アンカ／ー」と割れていた） */}
                <dl className="rule-list [line-break:strict]">
                  {t.rows.map((s) => (
                    <RyokinRow key={s.title} s={s} ninki={t.ninki} />
                  ))}
                </dl>
              </div>
            ))}
          </div>
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
              {/* 2026-11-21：市の名前が「富士／宮市」と行をまたいで割れていたので、市の名前だけ折り返さない（文字は同じ） */}
              <p className="mt-2 max-w-2xl text-[14px] leading-[1.85] text-ink-600">
                作業の内容や現場の状況によって、適切なプランと料金をご案内します。
                まずは「こんなこと頼める？」とお声がけください。LINEで写真をお送りいただくお見積りは、エリアを問わず無料です。現地に伺う出張費も、<span className="whitespace-nowrap">富士市</span>・<span className="whitespace-nowrap">富士宮市</span>・<span className="whitespace-nowrap">静岡市</span>・<span className="whitespace-nowrap">沼津市</span>ならいただきません。{' '}
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
