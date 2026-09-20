import React, { useEffect } from 'react';

// 草刈りの料金めやす（2026-09-19）。計算は public/tools/kusakari-calc.js の1か所だけ（記事と同じもの）
const KusakariCalc: React.FC = () => {
  useEffect(() => {
    const w = window as unknown as { fukkaruKusakariCalc?: () => void };
    if (w.fukkaruKusakariCalc) { w.fukkaruKusakariCalc(); return; }
    const s = document.createElement('script');
    s.src = '/tools/kusakari-calc.js?v=20260920b';
    s.defer = true;
    document.body.appendChild(s);
  }, []);
  return (
    <section id="kusakari-ryokin" className="section border-t border-hairline">
      <div className="mx-auto max-w-2xl px-4">
        <div data-kusakari-calc />
      </div>
    </section>
  );
};

export default KusakariCalc;
