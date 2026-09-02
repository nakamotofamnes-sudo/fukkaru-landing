import React from 'react';
import { Phone, MessageCircle, Mail } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <section id="contact" className="section border-t border-hairline bg-ink-900">
      <div className="shell">
        <div className="max-w-2xl">
          <span className="mb-3 inline-block text-[12px] font-semibold uppercase tracking-[0.08em] text-accent-line">
            Contact
          </span>
          <h2 className="text-[26px] font-bold tracking-tight text-white sm:text-[32px]">お問い合わせ</h2>
          <p className="mt-4 text-[15px] leading-[1.9] text-white/70">
            「どんな人が来るか不安」「金額が分からない」というご心配は要りません。
            ご高齢の方にも分かりやすく、ゆっくり丁寧にお見積もりをご説明します。
            離れて暮らすご家族からの代理相談も歓迎です。
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <a
            href="https://lin.ee/Bh5gFU6"
            className="group rounded border border-white/15 bg-white/5 p-7 transition-colors hover:border-white/35"
          >
            <MessageCircle size={22} className="text-accent-line" />
            <p className="mt-4 text-[20px] font-semibold tracking-tight text-white">LINEで相談する</p>
            <p className="mt-1.5 text-[13px] text-white/60">24時間受付・写真を送るだけで概算をお伝えできます</p>
          </a>

          <a
            href="tel:0545-78-3704"
            className="group rounded border border-white/15 bg-white/5 p-7 transition-colors hover:border-white/35"
          >
            <Phone size={22} className="text-accent-line" />
            <p className="mt-4 text-[20px] font-semibold tabular-nums tracking-tight text-white">0545-78-3704</p>
            <p className="mt-1.5 text-[13px] text-white/60">受付8:00〜18:00・スマホが苦手な方はこちらへ</p>
          </a>
        </div>

        <a
          href="mailto:nakamoto.famnes@gmail.com"
          className="mt-6 inline-flex items-center gap-2 text-[13px] text-white/60 transition-colors hover:text-white"
        >
          <Mail size={15} />
          メールでのご相談も受け付けています
        </a>
      </div>
    </section>
  );
};

export default Contact;
