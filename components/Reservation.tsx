import React from 'react';
import { CalendarCheck, ArrowUpRight } from 'lucide-react';

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
    'https://res.cloudinary.com/dyclm0vti/image/upload/v1772757436/discover_master_1770688407567_fjecub.jpg';

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
                Webから日時を選べます。
              </h2>
              <p className="mt-4 text-[14px] leading-[1.9] text-ink-500">
                「早朝や深夜しか時間が取れない」「電話だと聞き間違いが不安」という方は、
                カレンダーから空いている日時を選ぶだけで、訪問やお電話の相談枠を確保できます。
                離れて暮らすご家族からの代理予約も、こちらから可能です。
              </p>

              <div className="mt-8 flex items-center gap-3">
                <CalendarCheck size={17} className="text-ink-500" />
                <span className="text-[13px] text-ink-500">受付は24時間。Googleカレンダーの予約ページへ移動します</span>
              </div>

              <a
                href="https://calendar.app.google/uEAbmr2BFUyw87GL9"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg mt-6 w-full sm:w-auto"
              >
                空き状況を見て予約する
                <ArrowUpRight size={17} />
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
