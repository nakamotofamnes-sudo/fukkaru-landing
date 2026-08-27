import React from 'react';
import { Phone, MessageCircle, Mail } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <section
      id="contact"
      className="relative py-8 bg-transparent overflow-hidden"
      style={{
        backgroundImage: `url('https://res.cloudinary.com/dyclm0vti/image/upload/v1772755588/%E3%81%93%E3%82%99%E5%88%A9%E7%94%A8%E3%81%AE%E6%B5%81%E3%82%8C_kgmzhv.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* オーバーレイ（さらに薄く） */}
      <div className="absolute inset-0 bg-white/5 z-0"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="bg-white/90 rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto border-t-8 border-brand-orange">
          <div className="p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-blue mb-4">
              お問い合わせ
            </h2>
            <p className="text-gray-600 mb-8">
              「どんな人が来るか不安…」「金額が分からない」といったご心配は一切不要です。<br/>
              ご高齢の方にもわかりやすく、親切・丁寧なお見積もりを徹底しております。<br className="hidden md:block"/>まずはお気軽にお電話やLINEでご相談ください。
            </p>

            <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-10">
              {/* LINE CTA with Badge */}
              <div className="relative w-full md:w-auto min-w-[280px]">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-max bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border border-white/20 z-20 whitespace-nowrap">
                    🌸 離れて暮らすご家族（お子様）からの代理相談も歓迎
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
                </div>
                <a 
                  href="https://lin.ee/Bh5gFU6" 
                  className="w-full flex flex-col items-center bg-brand-green hover:bg-green-600 text-white p-6 rounded-xl transition-transform hover:-translate-y-1 shadow-md"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle size={32} />
                    <span className="font-bold text-2xl">LINEでご相談</span>
                  </div>
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">24時間受付中</span>
                  <span className="mt-2 text-xs font-medium">お写真での概算見積もりも可能です</span>
                </a>
              </div>

              {/* Phone CTA */}
              <a 
                href="tel:08067347746" 
                className="w-full md:w-auto flex flex-col items-center bg-brand-orange hover:bg-orange-600 text-white p-6 rounded-xl transition-transform hover:-translate-y-1 shadow-md min-w-[280px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Phone size={32} />
                  <span className="font-bold text-2xl">0545-78-3704</span>
                </div>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">受付時間 8:00〜18:00</span>
                <span className="mt-2 text-xs font-medium">スマホが苦手な方は直接お電話で！<br/>ゆっくり丁寧にお伺いします</span>
              </a>
            </div>

            <a 
              href="mailto:nakamoto.famnes@gmail.com"
              className="text-gray-500 text-sm flex items-center justify-center gap-2 hover:text-brand-orange transition-colors mt-auto pt-4 md:pt-0"
            >
              <Mail size={16} />
              <span>メールでのご相談も受け付けております</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;