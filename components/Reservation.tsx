import React from 'react';
import { CalendarCheck, ArrowRight } from 'lucide-react';

const getOptimizedImageUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w2560`;
  }
  return url;
};

const Reservation: React.FC = () => {
  const reservationImageUrl =
    'https://res.cloudinary.com/dyclm0vti/image/upload/f_auto,q_auto:good,w_1600,c_limit/v1772757436/discover_master_1770688407567_fjecub.jpg';

  return (
    <section id="reservation" className="section border-t border-hairline">
      <div className="shell">
        <div className="card overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-7 sm:p-10 lg:p-12">
              <span className="eyebrow">Reservation</span>
              <h2 className="text-[22px] font-bold leading-[1.45] tracking-tight text-ink-900 sm:text-[26px]">
                電話が繋がりにくい時間でも、
                <br />
                Webから見積もりの日時を選べます。
              </h2>
              <p className="mt-4 text-[14px] leading-[1.9] text-ink-500">
                作業の種類と、見に来てほしい日時を選ぶだけ。
                中元が確かめて、LINEかお電話で確定のご連絡をします。
                早朝や深夜でも、離れて暮らすご家族からの代理予約でも、こちらからどうぞ。
              </p>

              <div className="mt-8 flex items-center gap-3">
                <CalendarCheck size={17} className="text-ink-500" />
                <span className="text-[13px] text-ink-500">受付は24時間。明日から4週間先まで選べます</span>
              </div>

              {/* 2026-11-19 中元さん「独自のフッ軽ばんで」。Google の予約ページから、フッ軽の予約のページへ */}
              <a href="/yoyaku/" className="btn btn-primary btn-lg mt-6 w-full sm:w-auto">
                空いている日時を見る
                <ArrowRight size={17} />
              </a>
            </div>

            <div className="min-h-[240px] border-t border-hairline md:border-l md:border-t-0">
              <img
                src={getOptimizedImageUrl(reservationImageUrl)}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reservation;
