import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Problems from './components/Problems';
import Features from './components/Features';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import Founder from './components/Founder';
import Contact from './components/Contact';
import Footer from './components/Footer';
import StickyCallBar from './components/StickyCallBar';
import ConsultationPage from './components/ConsultationPage';
import Reservation from './components/Reservation';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'consultation'>('home');

  const handleNavigate = (view: 'home' | 'consultation', hash?: string) => {
    setCurrentView(view);
    if (view === 'home') {
      // Small delay to allow rendering of home components before scrolling
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
    } else {
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="font-sans antialiased text-gray-800 bg-white w-full max-w-full mx-auto overflow-x-hidden">
      <Header 
        currentView={currentView} 
        onNavigate={handleNavigate} 
      />
      
      <main className="w-full max-w-full mx-auto overflow-x-hidden">
        {currentView === 'home' ? (
          <>
            <Hero onNavigate={handleNavigate} />
            <Problems />
            <Features />
            <Services />
            <Testimonials />
            <Founder />
            <Reservation />
            <Contact />
            {/* サブスクリプション紹介セクション */}
            <section className="py-16 border-t border-gray-200">
              <div className="container mx-auto px-4 max-w-4xl text-center">
                <div className="mb-6">
                  <span className="inline-block bg-brand-orange text-white text-xs font-bold px-4 py-1 rounded-full mb-3">＼ 新サービス登場 ／</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-brand-blue mb-2">住まいの「困った」、定額ですべて解決。</h2>
                  <p className="text-gray-700 mb-4">月額2,980円からの「フッ軽（フッカル）」ライフをはじめよう。<br/>地域密着・損害保険完備で安心のサブスクリプション。</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* ライト会員 */}
                  <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-brand-orange flex flex-col items-center">
                    <h3 className="font-bold text-lg text-brand-orange mb-2">ライト会員</h3>
                    <div className="text-2xl font-bold text-brand-blue mb-1">¥2,980<span className="text-base font-normal">/月</span></div>
                    <p className="text-gray-600 text-sm mb-3">日常の「手作業」を中心としたお手軽プラン。</p>
                    <ul className="text-xs text-gray-500 mb-4 space-y-1">
                      <li>月2回まで作業費無料</li>
                      <li>草むしり・買い物代行など</li>
                    </ul>
                  </div>
                  {/* スタンダード会員 */}
                  <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500 flex flex-col items-center relative">
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">一番人気</span>
                    <h3 className="font-bold text-lg text-blue-600 mb-2">スタンダード会員</h3>
                    <div className="text-2xl font-bold text-brand-blue mb-1">¥5,980<span className="text-base font-normal">/月</span></div>
                    <p className="text-gray-600 text-sm mb-3">家具移動や組み立てなど、一般的な便利屋領域をカバー。</p>
                    <ul className="text-xs text-gray-500 mb-4 space-y-1">
                      <li>月3回まで作業費無料</li>
                      <li>家具移動・草刈り機など</li>
                    </ul>
                  </div>
                  {/* エキスパート会員 */}
                  <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500 flex flex-col items-center">
                    <h3 className="font-bold text-lg text-green-600 mb-2">エキスパート会員</h3>
                    <div className="text-2xl font-bold text-brand-blue mb-1">¥14,800<span className="text-base font-normal">/月</span></div>
                    <p className="text-gray-600 text-sm mb-3">特殊機材を使用するプロ仕様のメンテナンスプラン。</p>
                    <ul className="text-xs text-gray-500 mb-4 space-y-1">
                      <li>月4回まで作業費無料</li>
                      <li>高圧洗浄・防草シートなど</li>
                    </ul>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-2">
                  <a href="#" className="bg-brand-blue hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-xl shadow transition-all">まずは無料で覗いてみる</a>
                  <a href="#" className="bg-brand-orange hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl shadow transition-all">プランの詳細を見る</a>
                  <a href="https://lin.ee/Bh5gFU6" target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3 rounded-xl shadow transition-all">LINEで無料相談</a>
                </div>
                <div className="text-xs text-gray-500 mt-4">損害賠償補償制度加入・丁寧な事前見積もり</div>
              </div>
            </section>
          </>
        ) : (
          <ConsultationPage onBack={() => handleNavigate('home')} />
        )}
      </main>
      <Footer onNavigate={handleNavigate} />
      {currentView === 'home' && <StickyCallBar />}
    </div>
  );
};

export default App;