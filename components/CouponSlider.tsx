import React, { useCallback, useState, useEffect } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import Modal from './Modal';

// LINE登録の割引をご案内する小さな窓。
// 以前は金色のグラデーションと「スライドして解除」の仕掛けが入っていましたが、
// 演出そのものが広告くさく見え、押すまでの手数も増えていたので、
// 中身（最大3,000円引き）はそのままに、静かな案内に作り替えています。
const CouponSlider: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (hasTriggered) return;
      const target = document.getElementById('reservation');
      const reached = target
        ? target.getBoundingClientRect().top <= window.innerHeight - 100
        : window.scrollY > 2000;
      if (reached) {
        setIsVisible(true);
        setHasTriggered(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    const timer = setTimeout(handleScroll, 100);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [hasTriggered]);

  // 閉じ方は3通り（背景を押す・Escape・中のボタン）。行き先はここ1つにまとめます。
  const close = useCallback(() => setIsVisible(false), []);

  if (!isVisible) return null;

  return (
    <Modal onClose={close} labelledBy="coupon-title" panelClassName="w-full max-w-md">
      <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-5">
        <div>
          <span className="chip chip-accent">LINE限定</span>
          <h2 id="coupon-title" className="mt-3 text-[19px] font-bold tracking-tight text-ink-900">
            合計で最大 3,000円 引きになります
          </h2>
        </div>
        <button
          onClick={close}
          aria-label="閉じる"
          className="-mr-2 -mt-1 rounded p-2 text-ink-500 transition-colors hover:bg-canvas hover:text-ink-900"
        >
          <X size={18} />
        </button>
      </div>

      <div className="px-6 py-5">
        <ul className="rule-list">
          <li className="flex items-baseline justify-between gap-4 pb-3">
            <span className="flex items-start gap-2.5 text-[14px] text-ink-600">
              <Check size={16} className="mt-1 shrink-0 text-accent" />
              公式LINEにご登録
            </span>
            <span className="shrink-0 text-[15px] font-semibold tabular-nums text-ink-900">2,000円引き</span>
          </li>
          <li className="flex items-baseline justify-between gap-4 pt-3">
            <span className="flex items-start gap-2.5 text-[14px] text-ink-600">
              <Check size={16} className="mt-1 shrink-0 text-accent" />
              お見積り後にご成約
            </span>
            <span className="shrink-0 text-[15px] font-semibold tabular-nums text-ink-900">1,000円引き</span>
          </li>
        </ul>

        <a href="https://lin.ee/Bh5gFU6" className="btn btn-line btn-lg mt-6 w-full">
          LINEを開いて受け取る
          <ArrowRight size={17} />
        </a>

        <button
          onClick={close}
          className="mt-3 w-full py-2 text-[13px] text-ink-500 transition-colors hover:text-ink-900"
        >
          今はしない
        </button>
      </div>
    </Modal>
  );
};

export default CouponSlider;
