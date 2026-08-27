import React from 'react';
import { Shovel, Hammer, AlertCircle, Droplets, ShoppingBag, MessageCircleHeart } from 'lucide-react';

const Problems: React.FC = () => {
  const problems = [
    {
      icon: Shovel,
      text: "庭の草むしりや物置の片付け。昔は自分でやっていたけれど、最近はすぐに疲れてしまって億劫に…",
    },
    {
      icon: Hammer,
      text: "模様替えのための家具移動や、重い荷物の持ち運び。自分たちだけでは腰を痛めそうで不安…",
    },
    {
      icon: Droplets,
      text: "見て見ぬフリをしている外壁の汚れや側溝の掃除。高いところや無理な体勢での作業はケガが怖い…",
    },
    {
      icon: ShoppingBag,
      text: "溜まった不用品の処分や粗大ゴミの搬出など、「力仕事」を安心して任せられる誠実な業者が身近にいない…",
    },
  ];

  return (
    <section id="problems" className="py-12 md:py-20 bg-gradient-to-b from-rose-50/50 to-orange-50/30 w-full relative overflow-hidden">
      {/* 背景の装飾 */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-rose-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-200/20 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 max-w-[1400px] relative z-10">
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center justify-center gap-2 bg-rose-100 text-rose-600 px-4 py-1.5 rounded-full font-bold text-sm mb-4 border border-rose-200 shadow-sm">
            <MessageCircleHeart size={18} />
            <span>一軒家・ご高齢の方のお悩み</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-800 tracking-tight leading-tight mb-4">
            こんなお悩み<br className="md:hidden" /><span className="text-rose-500">ありませんか？</span>
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-rose-400 to-orange-400 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 mt-8 p-4">
          {problems.map((item, index) => (
            <div 
              key={index} 
              className="relative bg-white pt-10 pb-8 px-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-rose-100 flex flex-col items-center text-center transform transition-transform hover:-translate-y-1 mt-6"
            >
              {/* アイコン */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-br from-white to-rose-50 p-4 rounded-full shadow-md border border-rose-100">
                <item.icon size={32} className="text-rose-400 drop-shadow-sm" />
              </div>
              
              {/* 吹き出しのしっぽ */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-b border-r border-rose-100 rotate-45 transform origin-center shadow-[4px_4px_10px_rgb(0,0,0,0.02)]"></div>
              
              <p className="text-base md:text-lg font-semibold text-gray-700 leading-loose">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl text-center max-w-full sm:max-w-3xl mx-auto border border-rose-100 shadow-lg relative">
          <div className="absolute -top-4 -left-4 w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center shadow-sm z-10 animate-bounce cursor-default border border-rose-200">
            <span className="text-2xl">✨</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 text-rose-500 font-extrabold text-xl md:text-2xl">
            <AlertCircle size={28} className="drop-shadow-sm" />
            <span>無理をしてケガをする前に、安全で確実なプロにお任せ！</span>
          </div>
          <p className="text-gray-700 font-medium leading-relaxed md:text-lg">
            ご自身で無理をしてお怪我をされるのは大変危険です。<br className="hidden sm:block"/>
            体力的に負担の大きい重労働や面倒なお家まわりの手入れは、誠実で丁寧な「フッ軽」に丸ごとお任せください。
          </p>
        </div>
      </div>
    </section>
  );
};

export default Problems;
