import React, { useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import News from '../components/News';
import Problems from '../components/Problems';
import Features from '../components/Features';
import Services from '../components/Services';
import Testimonials from '../components/Testimonials';
import Founder from '../components/Founder';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import StickyCallBar from '../components/StickyCallBar';
import ConsultationPage from '../components/ConsultationPage';
import Reservation from '../components/Reservation';
import Partners from '../components/Partners';
import CouponSlider from '../components/CouponSlider';
import YouTubeVideos from '../components/YouTubeVideos';
import BlogTeaser from '../components/BlogTeaser';
import {
  ArrowUpRight, ChevronDown, MessageSquare, ClipboardList, Wrench, Wallet, Check,
} from 'lucide-react';

/* ------------------------------------------------------------------
   ご利用の流れ
   ------------------------------------------------------------------ */
const steps = [
  {
    icon: MessageSquare,
    title: 'LINEか電話でご相談',
    text: 'まずは「こんなこと頼める？」とお声がけください。最短で即日伺えます。',
  },
  {
    icon: ClipboardList,
    title: '無料でお見積り',
    text: '現地または写真で状況を確認し、はっきりした金額をご提示します。',
  },
  {
    icon: Wrench,
    title: '作業',
    text: 'ご納得いただいてから着手します。追加のご要望がなければ、金額は変わりません。',
  },
  {
    icon: Wallet,
    title: 'お支払い',
    text: '仕上がりをご確認いただいてからのお支払いです。現金とカードに対応しています。',
  },
];

const Flow: React.FC = () => (
  <section id="flow" className="section border-t border-hairline bg-canvas">
    <div className="shell">
      <div className="max-w-2xl">
        <span className="eyebrow">Flow</span>
        <h2 className="h-section">ご利用の流れ</h2>
        <p className="lede">ご相談からお支払いまで、4つの段階だけです。</p>
      </div>

      <ol className="mt-12 grid gap-px overflow-hidden rounded border border-hairline bg-hairline md:grid-cols-4">
        {steps.map((step, i) => (
          <li key={step.title} className="bg-surface p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-semibold tabular-nums text-ink-500">
                {String(i + 1).padStart(2, '0')}
              </span>
              <step.icon size={18} className="text-ink-500" />
            </div>
            <h3 className="mt-4 text-[16px] font-semibold text-ink-900">{step.title}</h3>
            <p className="mt-2 text-[13.5px] leading-[1.85] text-ink-500">{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

/* ------------------------------------------------------------------
   よくある質問
   ------------------------------------------------------------------ */
const faqs = [
  {
    q: '出張費や見積もりは、本当に無料ですか。',
    a: '富士市・富士宮市エリアであれば、出張費とお見積りは無料です。市外・県外の方も柔軟に対応しますので、まずはご相談ください。お見積り後のキャンセルも無料です。',
  },
  {
    q: '土日祝日も対応していますか。',
    a: '平日の日中、ご家族が不在の時間帯での作業も歓迎です。土曜日は隔週（第2・第4）で対応できます。日曜・祝日はお休みですが、ご事情によっては相談に応じます。',
  },
  {
    q: 'あとから追加料金を請求されませんか。',
    a: '作業前にお見積りをお出しし、ご納得いただいてから始めます。お客様からの追加のご要望がないかぎり、お見積り以上の金額を請求することはありません。',
  },
  {
    q: '支払い方法には何がありますか。',
    a: '現金のほか、クレジットカード決済（Stripe）に対応しています。作業完了後に、ご希望の方法をお選びください。',
  },
];

const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section border-t border-hairline">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
          <div>
            <span className="eyebrow">FAQ</span>
            <h2 className="h-section">よくある質問</h2>
            <p className="lede">ここに無いことも、遠慮なくお尋ねください。</p>
          </div>

          <dl className="rule-list border-t border-hairline">
            {faqs.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={item.q}>
                  <dt>
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-${idx}`}
                      className="flex w-full items-start justify-between gap-6 py-5 text-left"
                    >
                      <span className="text-[15px] font-semibold text-ink-900 sm:text-[16px]">{item.q}</span>
                      <ChevronDown
                        size={18}
                        className={`mt-0.5 shrink-0 text-ink-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </dt>
                  {isOpen && (
                    <dd id={`faq-${idx}`} className="-mt-1 pb-5 pr-10 text-[14px] leading-[1.9] text-ink-500">
                      {item.a}
                    </dd>
                  )}
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------
   定額サポート（サブスク）
   ------------------------------------------------------------------ */
const plans = [
  {
    name: 'ライト',
    price: '2,980',
    summary: '日常の手作業を中心にした、お手軽なプラン。',
    features: ['月2回まで作業費無料', '草むしり・買い物代行など'],
  },
  {
    name: 'スタンダード',
    price: '5,980',
    summary: '家具の移動や組み立てなど、一般的な便利屋の範囲をカバー。',
    features: ['月3回まで作業費無料', '家具移動・草刈り機など'],
    recommended: true,
  },
  {
    name: 'エキスパート',
    price: '14,800',
    summary: '特殊な機材を使う、プロ仕様のメンテナンスプラン。',
    features: ['月4回まで作業費無料', '高圧洗浄・防草シートなど'],
  },
];

const Subscription: React.FC = () => (
  <section className="section border-t border-hairline bg-canvas">
    <div className="shell">
      <div className="max-w-2xl">
        <span className="eyebrow">Subscription</span>
        <h2 className="h-section">定額で、その都度頼まなくてよくなります</h2>
        <p className="lede">
          月々のお支払いで、決まった回数まで作業費がかかりません。損害賠償の補償制度に加入しています。
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`card flex flex-col p-7 ${plan.recommended ? 'border-ink-900' : ''}`}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[16px] font-semibold text-ink-900">{plan.name}会員</h3>
              {plan.recommended && <span className="chip chip-accent">いちばん人気</span>}
            </div>

            <p className="mt-5 flex items-baseline gap-1 tracking-tight text-ink-900">
              <span className="text-[15px]">¥</span>
              <span className="text-[34px] font-bold tabular-nums leading-none">{plan.price}</span>
              <span className="text-[14px] text-ink-500">/月</span>
            </p>

            {/* flex-1 を持たせて、下の区切り線と項目の位置を3枚でそろえます。 */}
            <p className="mt-4 flex-1 text-[13.5px] leading-[1.85] text-ink-500">{plan.summary}</p>

            <ul className="mt-6 space-y-2.5 border-t border-hairline pt-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-ink-600">
                  <Check size={15} className="mt-1 shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href="https://fuji.creo-sumai.jp/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-lg"
        >
          まずは無料で見てみる
          <ArrowUpRight size={17} />
        </a>
        <a
          href="https://fuji.creo-sumai.jp/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-lg"
        >
          プランの詳細を見る
        </a>
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------
   ページ全体
   ------------------------------------------------------------------ */
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'consultation'>('home');

  const handleNavigate = (view: 'home' | 'consultation', hash?: string) => {
    const wasHome = currentView === 'home';
    setCurrentView(view);
    if (view !== 'home') return;

    const move = () => {
      if (hash) {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    if (wasHome) {
      // すでにホーム画面にいるので、そのまま飛び先へ1回だけ動かします。
      // 先に一番上へ戻すと、なめらかスクロールが2回走って一度上に動きかけます。
      move();
      return;
    }

    // 相談ページから戻るときは、ホームが描かれるのを待ってから動かします。
    window.scrollTo(0, 0);
    setTimeout(move, 50);
  };

  if (currentView === 'consultation') {
    return (
      <main className="w-full overflow-x-hidden">
        <Header currentView={currentView} onNavigate={handleNavigate} />
        <ConsultationPage onBack={() => handleNavigate('home')} />
        <Footer onNavigate={handleNavigate} />
      </main>
    );
  }

  // 上から順に「困りごと → 任せられる理由 → 何がいくらか → どう進むか →
  // 実際の評判 → 誰がやるか → 疑問 → 予約」。入れ子のカードは作りません。
  return (
    <main className="w-full overflow-x-hidden">
      <Header currentView={currentView} onNavigate={handleNavigate} />
      <Hero />
      <CouponSlider />
      <News />
      <Problems />
      <Features />
      <Services />
      <Flow />
      <Testimonials />
      <YouTubeVideos />
      <Founder />
      <Faq />
      <Reservation />
      <Subscription />
      <Partners />
      <BlogTeaser />
      <Contact />
      <StickyCallBar />
      <Footer onNavigate={handleNavigate} />
    </main>
  );
};

export default App;
