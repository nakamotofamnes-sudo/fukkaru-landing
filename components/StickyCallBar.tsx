import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle } from 'lucide-react';

const StickyCallBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const targetElement = document.getElementById('flow');
      if (targetElement) {
        // 対象セクションが画面上に入ってきたかを正確に判定
        const rect = targetElement.getBoundingClientRect();
        // 画面下部から要素が見え始めたら（＝rect.top が window.innerHeight より小さくなったら）ふわっと表示
        if (rect.top <= window.innerHeight) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else {
        // セクションが見つからない場合はある程度スクロールしたら表示
        setIsVisible(window.scrollY > 800);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    // 描画後少し遅らせて初期判定（ページロード直後の誤作動防止）
    const timer = setTimeout(handleScroll, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`fixed bottom-0 left-0 w-full z-50 md:hidden flex shadow-[0_-8px_30px_rgba(0,0,0,0.15)] font-sans backdrop-blur-xl bg-white/40 border-t border-white/60 transition-all duration-700 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0 pointer-events-none'}`}>
      {/* Phone Button - Left Side (40%) */}
      <a 
        href="tel:0545-78-3704" 
        className="w-[40%] bg-white/70 text-gray-800 flex flex-col items-center justify-center active:bg-white/90 transition-colors pt-3 relative overflow-hidden backdrop-blur-md"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
      >
        {/* Glossy highlight */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/60 to-transparent"></div>
        {/* Shine Animation Sweeping Across */}
        <div className="absolute top-0 -left-[100%] w-[150%] h-full pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent -skew-x-45 animate-[shine_3s_ease-in-out_infinite]"></div>
        </div>

        <div className="flex items-center gap-1.5 mb-1 relative z-10">
          <Phone size={20} className="text-brand-orange fill-brand-orange drop-shadow-sm" />
          <span className="text-sm font-bold leading-none tracking-tight">電話で相談</span>
        </div>
        <span className="text-[10px] text-gray-600 font-bold bg-white/80 px-2 py-0.5 rounded-sm shadow-sm relative z-10 border border-white/50">
          8:00〜18:00
        </span>
      </a>

      {/* LINE Button - Right Side (60%) */}
      <a 
        href="https://lin.ee/Bh5gFU6" 
        className="w-[60%] bg-gradient-to-br from-[#06c755]/90 to-[#05b34c]/95 text-white flex flex-col items-center justify-center pt-3 relative overflow-hidden active:from-[#05b34c]/95 active:to-[#04a044]/95 transition-all backdrop-blur-md border-l border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
      >
        {/* Social Proof Badge */}
        <div className="absolute -top-10 right-4 bg-gradient-to-r from-red-600 to-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xl animate-bounce border border-white/30 z-20 whitespace-nowrap">
            🔥 今月16人が相談中
            <div className="absolute -bottom-1.5 right-6 w-2.5 h-2.5 bg-rose-500 rotate-45 border-r border-b border-white/30"></div>
        </div>

        {/* Glossy shine effects */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
        
        {/* Shine Animation Sweeping Across */}
        <div className="absolute top-0 -left-[100%] w-[150%] h-full pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-45 animate-[shine_3s_ease-in-out_infinite_0.5s]"></div>
        </div>

        <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/20 rounded-full blur-xl pointer-events-none"></div>
        
        <div className="flex items-center gap-2 mb-1 relative z-10">
          <MessageCircle size={22} className="fill-white/30 drop-shadow-sm" />
          <span className="text-[17px] font-black leading-none tracking-tight drop-shadow-md">LINE見積もり</span>
        </div>
        <span className="text-[10px] font-black text-[#05b34c] bg-white/95 px-3 py-0.5 rounded-full shadow-md relative z-10 border border-white/50 truncate max-w-[90%]">
          写真で簡単・24時間受付
        </span>
      </a>
    </div>
  );
};

export default StickyCallBar;