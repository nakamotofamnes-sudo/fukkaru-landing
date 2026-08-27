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
import { ArrowRight, ExternalLink } from 'lucide-react';

// よくある質問アコーディオンコンポーネント
const FAQAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    {
      q: '出張費や見積もりは本当に無料ですか？',
      a: 'はい、富士市・富士宮市エリアであれば出張費・お見積りは完全無料です。市外・県外の方も柔軟に対応いたしますので、まずはお気軽にご相談ください。お見積り後のキャンセルも無料です。',
    },
    {
      q: '土日祝日も対応していますか？',
      a: '平日の日中、ご家族が不在の時間帯での作業も大歓迎です！土曜日は隔週（第2・第4）で対応可能です。日曜・祝日はお休みをいただいておりますが、ご事情により柔軟に対応いたします。',
    },
    {
      q: '後から追加料金を請求されませんか？',
      a: '作業前にお見積りを提示し、ご納得いただいてから作業を開始します。お客様からの追加のご要望がない限り、お見積り以上の金額を請求することは一切ありません。',
    },
    {
      q: '支払い方法は何がありますか？',
      a: '現金払いのほか、クレジットカード決済（Stripe）に対応しております。作業完了後にご希望のお支払い方法をお選びください。',
    },
  ];
  return (
    <div className="space-y-4">
      {faqs.map((item, idx) => (
        <div key={idx}>
          <button
            className="w-full flex justify-between items-center px-2 sm:px-6 py-5 text-left focus:outline-none focus:bg-gray-100 transition-colors"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            aria-expanded={openIndex === idx}
          >
            <span className="font-bold text-brand-blue text-base md:text-lg">Q. {item.q}</span>
            <svg className={`w-6 h-6 ml-4 transition-transform duration-200 ${openIndex === idx ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {openIndex === idx && (
            <div className="px-2 sm:px-6 pb-6 text-gray-700 text-base md:text-lg animate-fade-in">
              <span className="font-bold text-brand-orange">A.</span> {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'consultation'>('home');

  const handleNavigate = (view: 'home' | 'consultation', hash?: string) => {
    setCurrentView(view);
    if (view === 'home') {
      setTimeout(() => {
        if (hash) {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);

      window.scrollTo(0, 0);
    }
  };

  return (
    <main className="overflow-x-hidden w-full max-w-[100vw]">
      {currentView === 'home' ? (
        <>
          <Header currentView={currentView} onNavigate={handleNavigate} />
          <Hero onNavigate={handleNavigate} />
          <CouponSlider />
          <News />
          <Partners />
          {/* 共感・お悩み＋選ばれる理由セクション（連続背景） */}
          <section className="relative">
            <img
              src="https://res.cloudinary.com/dyclm0vti/image/upload/v1772755588/%E3%81%8A%E6%82%A9%E3%81%BF%E3%81%A8%E7%90%86%E7%94%B1%E3%82%BB%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3_qel8xt.png"
              alt="お悩み・理由セクション背景"
              className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none z-0"
              style={{objectPosition:'center top', minHeight:'100%'}}
            />
            <div className="relative z-10 max-w-[1400px] mx-auto px-2 sm:px-6 xl:px-8">
              <div className="bg-white bg-opacity-90 rounded-2xl shadow-2xl px-4 py-8 md:px-14 md:py-16 w-full">
                <Problems />
                <Features />
              </div>
            </div>
          </section>
          <YouTubeVideos />
          <Services />
          {/* ご利用の流れセクション（おしゃれver） */}
          <section id="flow" className="relative py-24 bg-gray-50 overflow-visible">
            <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl w-full border border-gray-100 px-6 md:px-16 py-16 md:py-24 mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-blue mb-6 text-center tracking-tight">ご利用の流れ</h2>
              <p className="text-xl md:text-2xl text-gray-700 mb-16 text-center font-bold">簡単<span className='text-brand-orange font-extrabold ml-1'>4ステップ</span>で解決</p>
              <div className="relative flex flex-col md:flex-row items-stretch justify-between gap-8 md:gap-10">
                {/* 1. 相談 */}
                <div className="relative px-8 py-10 flex flex-col items-center text-center flex-1 z-10 hover:-translate-y-2 transition-transform duration-300 bg-gradient-to-b from-white to-blue-50/30 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100">
                  <div className="mb-5 bg-gradient-to-br from-brand-blue to-blue-400 rounded-2xl p-4 shadow-lg text-white">
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2.5"/></svg>
                  </div>
                  <div className="text-xl font-bold text-brand-blue mb-3">LINE/電話で相談</div>
                  <p className="text-gray-600 text-sm md:text-[15px] font-medium leading-relaxed max-w-[200px]">まずは「こんなこと頼める？」とお気軽にご連絡ください。<br/>最短即日対応も可能です。</p>
                </div>
                {/* → 矢印 */}
                <div className="hidden md:flex items-center justify-center w-8 z-10">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M13 18l6-6-6-6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                {/* 2. 無料お見積り */}
                <div className="relative px-8 py-10 flex flex-col items-center text-center flex-1 z-10 hover:-translate-y-2 transition-transform duration-300 bg-gradient-to-b from-white to-orange-50/30 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100">
                  <div className="mb-5 bg-gradient-to-br from-brand-orange to-orange-400 rounded-2xl p-4 shadow-lg text-white">
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M9 17v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M7 7h10M7 11h10M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div className="text-xl font-bold text-brand-orange mb-3">無料お見積り</div>
                  <p className="text-gray-600 text-sm md:text-[15px] font-medium leading-relaxed max-w-[200px]">現地調査または写真にて状況を確認し、明確な料金をご提示します。</p>
                </div>
                {/* → 矢印 */}
                <div className="hidden md:flex items-center justify-center w-8 z-10">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M13 18l6-6-6-6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                {/* 3. 作業実施 */}
                <div className="relative px-8 py-10 flex flex-col items-center text-center flex-1 z-10 hover:-translate-y-2 transition-transform duration-300 bg-gradient-to-b from-white to-green-50/30 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100">
                  <div className="mb-5 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl p-4 shadow-lg text-white">
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M9 12v-2a3 3 0 1 1 6 0v2m-9 4h12M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div className="text-xl font-bold text-green-600 mb-3">作業実施</div>
                  <p className="text-gray-600 text-sm md:text-[15px] font-medium leading-relaxed max-w-[200px]">経験豊富なスタッフが丁寧かつ迅速に作業を行います。</p>
                </div>
                {/* → 矢印 */}
                <div className="hidden md:flex items-center justify-center w-8 z-10">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M5 12h14M13 18l6-6-6-6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                {/* 4. お支払い */}
                <div className="relative px-8 py-10 flex flex-col items-center text-center flex-1 z-10 hover:-translate-y-2 transition-transform duration-300 bg-gradient-to-b from-white to-yellow-50/30 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100">
                  <div className="mb-5 bg-gradient-to-br from-yellow-400 to-amber-300 rounded-2xl p-4 shadow-lg text-white">
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div className="text-xl font-bold text-yellow-500 mb-3">お支払い</div>
                  <p className="text-gray-600 text-sm md:text-[15px] font-medium leading-relaxed max-w-[200px]">作業完了後、仕上がりをご確認いただきお支払いとなります。</p>
                </div>
              </div>
            </div>
          </section>
          {/* FAQ〜Testimonials〜Founder〜Reservationを1つのsectionでラップ */}
          <section className="relative py-16 md:py-24 bg-gradient-to-b from-gray-50 via-blue-50/30 to-orange-50/30">
            <div className="relative z-10 container mx-auto px-4 sm:px-6 xl:px-8">
              <div className="bg-white rounded-xl md:rounded-3xl shadow-xl w-full border border-gray-100 px-4 sm:px-6 py-10 md:px-20 md:py-20 max-w-7xl mx-auto flex flex-col items-center">
                <div className="flex flex-col gap-24 w-full">
                      {/* FAQカード */}
                      <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg w-full border border-gray-100 px-4 sm:px-8 py-10 md:px-16 md:py-16 max-w-5xl mx-auto flex flex-col items-center hover:shadow-xl transition-shadow">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-brand-blue mb-4 text-center">よくある質問</h2>
                        <p className="text-lg text-gray-600 mb-8 text-center font-medium">お客様の不安を解消します</p>
                        <FAQAccordion />
                      </div>
                      {/* お客様の声（左寄せ） */}
                      <div className="flex flex-col md:flex-row max-w-5xl mx-auto w-full gap-8 items-center">
                        <div className="flex-1 w-full">
                          <Testimonials />
                        </div>
                      </div>
                      {/* 代表（右寄せ） */}
                      <div className="flex flex-col md:flex-row-reverse max-w-5xl mx-auto w-full gap-8 items-center">
                        <div className="flex-1 w-full">
                          <Founder />
                        </div>
                      </div>
                      {/* Web予約（中央寄せ） */}
                      <div className="bg-gradient-to-br from-blue-50/50 to-orange-50/50 rounded-2xl md:rounded-3xl shadow-lg w-full border border-blue-100/50 px-4 sm:px-8 py-10 md:px-16 md:py-16 max-w-5xl mx-auto flex flex-col items-center">
                        <Reservation />
                      </div>
                    </div>
              </div>
            </div>
          </section>
          <div className="-mt-8 md:-mt-16"></div>
          <Contact />
          {/* サブスクリプション紹介セクション */}
          <section
            className="relative py-20 border-t border-gray-200 flex justify-center items-center"
            style={{ minHeight: '600px' }}
          >
            <img
              src="https://res.cloudinary.com/dyclm0vti/image/upload/v1772756899/%E3%83%95%E3%83%83%E8%BB%BD%E3%83%92%E3%83%BC%E3%83%AD%E3%83%BC_qsnrar.png"
              alt="サブスク背景"
              className="absolute inset-0 w-full h-full object-cover object-[70%_center] md:object-center opacity-30 pointer-events-none z-0"
            />
            <div className="container mx-auto px-4 max-w-7xl text-center relative z-10">
              <div className="mb-10">
                <span className="inline-block bg-brand-orange text-white text-base md:text-lg font-bold px-2 sm:px-6 py-2 rounded-full mb-5 tracking-widest shadow-lg animate-bounce-slow">＼ 新サービス登場 ／</span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-brand-blue mb-4 leading-tight drop-shadow-lg whitespace-normal lg:whitespace-nowrap">旦那さんに頼まなくても、<br className="md:hidden" />定額ですべて解決。</h2>
                <p className="text-xl md:text-2xl font-bold text-gray-800 mb-6 leading-relaxed drop-shadow">月額2,980円からの定額サポートで、主婦のストレスをゼロに。<br />地域密着・損害保険完備で安心のサブスクリプション。</p>
              </div>
              <div className="flex flex-col md:flex-row gap-10 md:gap-16 mb-10 justify-center items-center max-w-7xl mx-auto">
                {/* ライト会員 */}
                <div className="px-8 py-8 flex flex-col items-center justify-center min-h-[220px] w-full md:w-1/3 break-words overflow-hidden bg-gradient-to-br from-white to-orange-50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-orange-200/60 transform transition-transform hover:-translate-y-2">
                  <h3 className="font-extrabold text-base md:text-xl text-brand-orange mb-2 drop-shadow-sm text-center">ライト会員</h3>
                  <div className="text-3xl md:text-4xl font-black text-brand-blue mb-2 drop-shadow-sm text-center">¥2,980<span className="text-base font-bold">/月</span></div>
                  <p className="text-gray-700 text-sm mb-3 font-semibold text-center leading-relaxed">日常の「手作業」を中心とした<br/>お手軽プラン。</p>
                  <ul className="text-sm text-gray-600 space-y-1.5 font-medium text-center bg-white/60 px-4 py-2 rounded-xl w-full">
                    <li>✔️ 月2回まで作業費無料</li>
                    <li>✔️ 草むしり・買い物代行など</li>
                  </ul>
                </div>
                {/* スタンダード会員 */}
                <div className="px-8 py-10 flex flex-col items-center justify-center min-h-[260px] w-full md:w-1/3 break-words overflow-visible bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-[0_12px_40px_rgba(59,130,246,0.2)] border-2 border-brand-blue/30 relative transform transition-transform hover:-translate-y-2 sm:scale-105">
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-sm font-bold px-6 py-1.5 rounded-full shadow-lg z-20 border-2 border-white animate-bounce-slow tracking-wider">一番人気</span>
                  <h3 className="font-extrabold text-base md:text-xl text-brand-blue mb-2 drop-shadow-sm text-center">スタンダード会員</h3>
                  <div className="text-3xl md:text-5xl font-black text-brand-blue mb-2 drop-shadow-sm text-center">¥5,980<span className="text-base font-bold">/月</span></div>
                  <p className="text-gray-700 text-sm mb-3 font-semibold text-center leading-relaxed">家具移動や組み立てなど、<br/>一般的な便利屋領域をカバー。</p>
                  <ul className="text-sm text-gray-600 space-y-1.5 font-medium text-center bg-white/60 px-4 py-2 rounded-xl w-full">
                    <li>✔️ 月3回まで作業費無料</li>
                    <li>✔️ 家具移動・草刈り機など</li>
                  </ul>
                </div>
                {/* エキスパート会員 */}
                <div className="px-8 py-8 flex flex-col items-center justify-center min-h-[220px] w-full md:w-1/3 break-words overflow-hidden bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-green-200/60 transform transition-transform hover:-translate-y-2">
                  <h3 className="font-extrabold text-base md:text-xl text-green-600 mb-2 drop-shadow-sm text-center">エキスパート会員</h3>
                  <div className="text-3xl md:text-4xl font-black text-brand-blue mb-2 drop-shadow-sm text-center">¥14,800<span className="text-base font-bold">/月</span></div>
                  <p className="text-gray-700 text-sm mb-3 font-semibold text-center leading-relaxed">特殊機材を使用する<br/>プロ仕様のメンテナンスプラン。</p>
                  <ul className="text-sm text-gray-600 space-y-1.5 font-medium text-center bg-white/60 px-4 py-2 rounded-xl w-full">
                    <li>✔️ 月4回まで作業費無料</li>
                    <li>✔️ 高圧洗浄・防草シートなど</li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-2">
                <a href="https://fuji.creo-sumai.jp/" target="_blank" rel="noopener noreferrer" className="font-bold px-10 py-4 text-lg rounded-full border-2 border-brand-green/60 bg-brand-green/90 text-white hover:bg-brand-green hover:border-brand-green transition-colors duration-150 inline-flex items-center gap-2 group shadow-md">
                  まずは無料で覗いてみる
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="https://fuji.creo-sumai.jp/" target="_blank" rel="noopener noreferrer" className="font-bold px-10 py-4 text-lg rounded-full border-2 border-brand-blue/60 bg-white/80 hover:bg-brand-blue/10 hover:border-brand-blue transition-colors duration-150 inline-flex items-center gap-2 group shadow-md">
                  プランの詳細を見る
                  <ExternalLink className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </a>
              </div>
              <div className="text-sm text-gray-600 mt-2 font-semibold">損害賠償補償制度加入・丁寧な事前見積もり</div>
            </div>
          </section>
          <StickyCallBar />
          <Footer onNavigate={handleNavigate} />
        </>
      ) : (
        <ConsultationPage onBack={() => handleNavigate('home')} />
      )}
    </main>
  );
};

export default App;
