import React from 'react';
import { ArrowUpRight, Home, Building2, MessageCircle, Camera } from 'lucide-react';

const RegularCareIntro: React.FC = () => (
  <section id="regular-care" className="section border-t border-hairline bg-canvas">
    <div className="shell">
      <div className="max-w-3xl">
        <span className="eyebrow">空き家調査を始めました</span>
        <h2 className="h-section text-balance">空き家・マンションの管理を、<br className="sm:hidden" />フッ軽にお任せください。</h2>
        <p className="lede">まずは1回の空き家調査から。見たことを写真つきでLINEにご報告し、必要な作業はお見積りします。続けて見てほしい方には、毎月の見回りも。アパート・マンションの共用部の定期清掃もお任せください。</p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <article className="card flex flex-col p-6 sm:p-8">
          <Home size={26} className="mb-5 text-ink-500" aria-hidden="true" />
          <h3 className="text-[20px] font-semibold text-ink-900">空き家調査</h3>
          <p className="mt-3 text-[15px] font-semibold text-ink-900">1回8,000円〜<span className="ml-2 text-[12px] font-normal text-ink-500">税込</span></p>
          <p className="mt-4 flex-1 text-[14px] leading-[1.9] text-ink-500">外まわりを見て、入れる場合は室内も。写真つきでLINEにご報告し、必要な作業はお見積りします。続けて見てほしい方は、毎月の見回り（<span className="whitespace-nowrap">月額4,400円〜</span>）も選べます。</p>
          <a href="/blog/akiya/#chousa" className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-ink-900 underline underline-offset-4 relative after:absolute after:-inset-x-1 after:-inset-y-3 after:content-['']">空き家調査の内容を見る<ArrowUpRight size={16} aria-hidden="true" /></a>
        </article>
        <article className="card flex flex-col p-6 sm:p-8">
          <Building2 size={26} className="mb-5 text-ink-500" aria-hidden="true" />
          <h3 className="text-[20px] font-semibold text-ink-900"><span className="inline-block">アパート・マンション</span><span className="inline-block">共用部の管理</span></h3>
          <p className="mt-3 text-[15px] font-semibold text-ink-900">月1回・月額5,500円〜<span className="ml-2 text-[12px] font-normal text-ink-500">税込</span></p>
          <p className="mt-4 flex-1 text-[14px] leading-[1.9] text-ink-500">毎回の掃き拭きと小さな草取りに加え、床の汚れも確認。高圧洗浄が必要な時期を写真でご相談します。月2回は月額9,900円〜（税込）。月額に含む洗浄の範囲と回数は、始める前に決めます。大きな建物は個別にお見積もりします。</p>
          <a href="https://fuji.creo-sumai.jp/#apartment" className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-ink-900 underline underline-offset-4 relative after:absolute after:-inset-x-1 after:-inset-y-3 after:content-['']">作業範囲・料金を見る<ArrowUpRight size={16} aria-hidden="true" /></a>
        </article>
      </div>
      <div className="mt-6 flex items-start gap-2 text-[13px] leading-[1.9] text-ink-500"><Camera size={17} className="mt-1 shrink-0" aria-hidden="true" /><p>富士市・富士宮市・沼津市・静岡市に対応。来る回数、やる場所、毎月の金額を最初に決めます。範囲外の作業は先に相談し、無断で追加請求しません。表示は税込の目安。必要な初回整備は事前に別見積もりです。1回だけのお試し（日常清掃）もご相談ください。</p></div>
      <div className="mt-7 flex flex-wrap gap-3">
        <a href="https://fuji.creo-sumai.jp/" className="btn btn-primary inline-flex items-center gap-2">詳しい内容・料金を見る<ArrowUpRight size={16} aria-hidden="true" /></a>
        <a href="https://lin.ee/Bh5gFU6" target="_blank" rel="noopener noreferrer" className="btn btn-line inline-flex items-center gap-2"><MessageCircle size={17} aria-hidden="true" />LINEで無料相談する</a>
      </div>
      <p className="mt-3 text-[13px] leading-[1.8] text-ink-500">LINEを使っていない方は、<a href={`mailto:nakamoto.famnes@gmail.com?subject=${encodeURIComponent('空き家・建物の管理の相談')}`} className="inline-block text-ink-900 underline underline-offset-4 relative after:absolute after:-inset-x-1 after:-inset-y-3 after:content-['']">こちらからメールでご相談ください</a></p>
      <p className="mt-4 text-[12px] leading-[1.8] text-ink-500">相談・見積もりにご納得いただいてから、お支払い方法をご案内します。新しい定期サービスに12か月の契約縛りはありません。</p>
    </div>
  </section>
);

export default RegularCareIntro;
