import React from 'react';
import { ArrowUpRight, Home, Building2, MessageCircle, Camera } from 'lucide-react';

const RegularCareIntro: React.FC = () => (
  <section id="regular-care" className="section border-t border-hairline bg-canvas">
    <div className="shell">
      <div className="max-w-3xl">
        <span className="eyebrow">新しい定期サービスを始めました</span>
        <h2 className="h-section">空き家の見回りと、<br className="sm:hidden" />アパートの定期清掃。</h2>
        <p className="lede">遠くのご実家が気になるご家族へ。お掃除に行く時間が取れない大家さんへ。定期的に訪ねて、家の様子と作業の結果を写真でお知らせします。</p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <article className="card flex flex-col p-6 sm:p-8">
          <Home size={26} className="mb-5 text-ink-500" aria-hidden="true" />
          <h3 className="text-[20px] font-semibold text-ink-900">空き家・ご実家の見回り</h3>
          <p className="mt-3 text-[15px] font-semibold text-ink-900">月1回・月額5,500円〜<span className="ml-2 text-[12px] font-normal text-ink-500">税込</span></p>
          <p className="mt-4 flex-1 text-[14px] leading-[1.9] text-ink-500">外壁・窓・庭木・郵便受けの様子を確認し、写真でLINE報告。室内の換気・通水を含むプランは月額8,800円〜（税込）です。</p>
          <a href="https://fuji.creo-sumai.jp/#vacant" className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-ink-900 underline underline-offset-4">作業範囲・料金を見る<ArrowUpRight size={16} aria-hidden="true" /></a>
        </article>
        <article className="card flex flex-col p-6 sm:p-8">
          <Building2 size={26} className="mb-5 text-ink-500" aria-hidden="true" />
          <h3 className="text-[20px] font-semibold text-ink-900">アパート共用部の巡回清掃</h3>
          <p className="mt-3 text-[15px] font-semibold text-ink-900">月1回・月額6,600円〜<span className="ml-2 text-[12px] font-normal text-ink-500">税込</span></p>
          <p className="mt-4 flex-1 text-[14px] leading-[1.9] text-ink-500">廊下・階段・玄関・駐車場の日常清掃と写真報告。月2回のプランは月額11,000円〜（税込）。小規模店舗・事務所も個別にご相談いただけます。</p>
          <a href="https://fuji.creo-sumai.jp/#apartment" className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-ink-900 underline underline-offset-4">作業範囲・料金を見る<ArrowUpRight size={16} aria-hidden="true" /></a>
        </article>
      </div>
      <div className="mt-6 flex items-start gap-2 text-[13px] leading-[1.9] text-ink-500"><Camera size={17} className="mt-1 shrink-0" aria-hidden="true" /><p>富士市・富士宮市・沼津市・静岡市に対応。規模・状態を確認して作業範囲と月額を決めます。草刈り・高圧洗浄・大量の片付け等は別途お見積もり。1回だけのお試しもご相談ください。</p></div>
      <div className="mt-7 flex flex-wrap gap-3">
        <a href="https://fuji.creo-sumai.jp/" className="btn btn-primary inline-flex items-center gap-2">詳しい内容・料金を見る<ArrowUpRight size={16} aria-hidden="true" /></a>
        <a href="https://lin.ee/Bh5gFU6" target="_blank" rel="noopener noreferrer" className="btn btn-line inline-flex items-center gap-2"><MessageCircle size={17} aria-hidden="true" />LINEで無料相談する</a>
      </div>
      <p className="mt-4 text-[12px] leading-[1.8] text-ink-500">相談・見積もりにご納得いただいてから、Stripeのお支払いリンクをご案内します。新しい定期サービスに12か月の契約縛りはありません。</p>
    </div>
  </section>
);

export default RegularCareIntro;
