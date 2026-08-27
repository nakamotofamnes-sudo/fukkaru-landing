import React from 'react';
import { CalendarCheck } from 'lucide-react';

const getOptimizedImageUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w2560`;
    }
  }
  return url;
};
// ...existing code...
const Reservation: React.FC = () => {
  const reservationImageUrl = "https://res.cloudinary.com/dyclm0vti/image/upload/v1772757436/discover_master_1770688407567_fjecub.jpg";

  return (
    <section id="reservation" className="py-6 md:py-12 relative overflow-hidden w-full max-w-full overflow-x-hidden">
      <div className="w-full max-w-full px-4 sm:px-6 mx-auto">
        <div className="w-full flex flex-col md:flex-row justify-center items-center md:items-stretch">
          <div className="py-8 md:p-12 w-full md:w-1/2 flex flex-col justify-center items-center md:items-start text-center md:text-left min-w-0 z-10 md:pr-8">
            <div className="inline-flex items-center gap-2 text-brand-blue font-bold mb-4">
              <CalendarCheck className="text-brand-orange" size={24} />
              <span>24時間受付中</span>
            </div>
            <h2 className="text-[1.35rem] sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight w-full">
              お電話が繋がりにくい時間帯でも。<br/>
              <span className="text-brand-blue block mt-2">Webでかんたん日時予約</span>
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed max-w-full px-2 sm:px-0">
              「早朝や深夜しか時間が取れない」「電話予約だと聞き間違いが不安だ」<br className="hidden lg:block"/>
              そんな方は、カレンダーから空いている日時を選ぶだけで、安全に訪問やお電話での相談予約枠を確保できます。<br className="hidden lg:block"/>
              <strong className="block mt-2">ご家族（お子様など）からの代理予約もこちらから可能です。</strong>
            </p>
            <a 
              href="https://calendar.app.google/uEAbmr2BFUyw87GL9" 
              target="_blank"
              rel="noopener noreferrer"
              className="relative text-white font-bold text-lg px-8 py-4 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 w-full sm:w-auto bg-brand-blue rounded-xl shadow-md z-10"
            >
              <CalendarCheck size={22} className="inline-block align-middle mr-2" />
              <span className="align-middle">空き状況を見て予約する</span>
            </a>
            <p className="text-xs text-gray-400 mt-4">
              ※ Googleカレンダーの予約ページへ移動します
            </p>
          </div>
          <div className="md:w-1/2 min-h-[250px] sm:min-h-[300px] relative w-full mt-8 md:mt-0 overflow-hidden rounded-xl md:rounded-l-none">
            <img 
              src={getOptimizedImageUrl(reservationImageUrl)} 
              alt="Web予約" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reservation;