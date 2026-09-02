import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle } from 'lucide-react';

// スマホの画面下に出る、電話とLINEの帯。
// 光る演出やバウンドは入れません。押しやすさだけを担保します。
const StickyCallBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const target = document.getElementById('flow');
      if (target) {
        setIsVisible(target.getBoundingClientRect().top <= window.innerHeight);
      } else {
        setIsVisible(window.scrollY > 800);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    const timer = setTimeout(handleScroll, 100);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 flex border-t border-hairline bg-surface transition-transform duration-300 md:hidden ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <a
        href="tel:0545-78-3704"
        className="flex w-2/5 flex-col items-center justify-center gap-1 py-3 text-ink-900 active:bg-canvas"
      >
        <span className="flex items-center gap-1.5">
          <Phone size={17} />
          <span className="text-[14px] font-semibold">電話で相談</span>
        </span>
        <span className="text-[11px] text-ink-500">8:00〜18:00</span>
      </a>

      <a
        href="https://lin.ee/Bh5gFU6"
        className="flex w-3/5 flex-col items-center justify-center gap-1 bg-line py-3 text-white active:bg-line-hover"
      >
        <span className="flex items-center gap-1.5">
          <MessageCircle size={17} />
          <span className="text-[14px] font-semibold">LINEで見積もり</span>
        </span>
        <span className="text-[11px] text-white/75">写真を送るだけ・24時間受付</span>
      </a>
    </div>
  );
};

export default StickyCallBar;
