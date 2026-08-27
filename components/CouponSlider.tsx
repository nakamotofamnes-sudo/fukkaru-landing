import React, { useState, useRef, useEffect } from 'react';
import { Gift, CheckCircle, ArrowRight, Sparkles, X } from 'lucide-react';

const CouponSlider: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  // Trigger modal on scroll calculation based on target section
  useEffect(() => {
    const handleScroll = () => {
      if (hasTriggered) return;
      
      const targetElement = document.getElementById('reservation');
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        // 予約コンポーネント（Web予約）が画面内に少し入ってきたら表示させる
        if (rect.top <= window.innerHeight - 100) {
          setIsVisible(true);
          setHasTriggered(true);
        }
      } else {
        // Fallback
        if (window.scrollY > 2000) {
          setIsVisible(true);
          setHasTriggered(true);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // 遅延させて初期チェック
    const timer = setTimeout(handleScroll, 100);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [hasTriggered]);

  // Handle Dragging
  useEffect(() => {
    if (!isVisible) return;
    const thumb = thumbRef.current;
    const track = trackRef.current;
    if (!thumb || !track || isUnlocked) return;

    let isDragging = false;
    let startX = 0;

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - startX;
      
      const maxDrag = track.offsetWidth - thumb.offsetWidth;
      let newProgress = Math.max(0, Math.min(deltaX, maxDrag));
      
      const percentage = newProgress / maxDrag;
      setDragProgress(percentage);

      // Snap back or Unlock
      if (percentage >= 0.95) {
        setIsUnlocked(true);
        setDragProgress(1);
        isDragging = false;
      }
    };

    const onUp = () => {
      if (!isDragging) return;
      isDragging = false;
      if (dragProgress < 0.95 && !isUnlocked) {
        // Simple animated snap back (managed via state transition in React)
        setDragProgress(0);
      }
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      // Adjust startX so that dragging starts from the current position
      const maxDrag = track.offsetWidth - thumb.offsetWidth;
      startX = clientX - (dragProgress * maxDrag);
    };

    thumb.addEventListener('mousedown', onDown);
    thumb.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false }); 
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);

    return () => {
        thumb.removeEventListener('mousedown', onDown);
        thumb.removeEventListener('touchstart', onDown);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('touchend', onUp);
    };
  }, [dragProgress, isUnlocked, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg mx-auto relative">
        {/* Modal Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute -top-12 right-0 md:-right-12 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors z-50 border border-white/20"
          aria-label="閉じる"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-3xl p-[2px] shadow-2xl relative overflow-hidden group w-full animate-fade-in-up">
          
          {/* Animated Glossy Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-45 translate-x-[-150%] animate-[shine_3s_ease-in-out_infinite] z-0 pointer-events-none"></div>

          <div className="bg-gradient-to-b from-gray-900 to-slate-900 rounded-[22px] p-5 md:p-6 relative z-10 flex flex-col items-center border border-yellow-500/20">
            
            <div className="absolute top-0 right-10 w-20 h-20 bg-yellow-500/20 blur-2xl rounded-full"></div>
            <div className="absolute bottom-0 left-10 w-20 h-20 bg-amber-500/20 blur-2xl rounded-full"></div>

            {!isUnlocked ? (
              <div className="w-full flex flex-col items-center">
                <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 font-extrabold text-xl md:text-2xl mb-1 text-center tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  LINE限定シークレットクーポン
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </h3>
                <p className="text-gray-300 text-sm md:text-base font-medium mb-6 text-center">
                  スライドして<span className="text-yellow-400 font-bold">2,000円OFF</span>を獲得する
                </p>

                {/* Slider Track */}
                <div 
                  ref={trackRef}
                  className="w-full h-14 md:h-16 bg-slate-800/80 rounded-full relative shadow-inner border border-white/5 overflow-hidden backdrop-blur-sm"
                >
                  {/* Progress Fill */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500/20 to-yellow-400/40 rounded-full"
                    style={{ width: `calc(${dragProgress * 100}% + 4rem)`, transition: dragProgress === 0 ? 'width 0.3s ease-out' : 'none' }}
                  ></div>

                  {/* Shimmer text behind */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                    <span className="text-yellow-400/70 font-bold text-sm tracking-widest pl-10 animate-pulse">
                      スライドして割引GET ＞＞
                    </span>
                  </div>

                  {/* Thumb */}
                  <div 
                    ref={thumbRef}
                    className="absolute top-1 left-1 bottom-1 w-12 md:w-14 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full cursor-grab active:cursor-grabbing shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center flex-shrink-0 z-10"
                    style={{ 
                      transform: `translateX(${dragProgress * (trackRef.current ? trackRef.current.offsetWidth - (trackRef.current.offsetHeight - 8) : 0)}px)`,
                      transition: dragProgress === 0 ? 'transform 0.3s ease-out' : 'none' 
                    }}
                  >
                    <Gift className="w-6 h-6 text-slate-900 drop-shadow-sm" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center animate-fade-in">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400 mb-3 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  <CheckCircle className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <h3 className="text-yellow-400 font-extrabold text-2xl mb-2 text-center drop-shadow-md">
                  🎉 クーポン獲得完了！
                </h3>
                <div className="bg-slate-800/80 border border-yellow-500/30 rounded-xl p-4 md:p-5 mb-5 w-full text-center shadow-inner">
                   <p className="text-white font-bold text-lg md:text-xl leading-relaxed mb-2">
                     LINE登録で <span className="text-yellow-400 text-2xl md:text-3xl mx-1">2,000円</span> OFF!
                   </p>
                   <p className="text-green-400 font-bold text-[13px] md:text-sm bg-green-500/10 inline-block px-3 py-1.5 rounded-full border border-green-500/20">
                     さらにご成約時に追加で <span className="text-yellow-400 text-base md:text-lg">1,000円</span> OFF
                   </p>
                   <p className="text-gray-300 text-[11px] md:text-xs mt-3 font-medium">※合計最大3,000円分お得にご利用いただけます。</p>
                </div>
                
                <a 
                  href="https://lin.ee/Bh5gFU6"
                  className="w-full bg-gradient-to-r from-[#06c755] to-[#05b34c] hover:from-[#05b34c] hover:to-[#04a044] text-white font-black text-lg py-4 px-6 rounded-full shadow-[0_5px_20px_rgba(6,199,85,0.4)] flex items-center justify-center gap-2 transition-transform hover:scale-105 group/btn"
                >
                  LINEを開いて特典を受け取る
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponSlider;