import React from 'react';
import { FileText } from 'lucide-react';

const Founder: React.FC = () => {
  return (
    <section id="founder" className="py-6 md:py-12 relative overflow-hidden">
      <div className="px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          
          <div className="w-full md:w-1/2">
            <div className="relative">
              {/* Representative Image: Professional Asian Male in work attire (Construction/Architect) */}
              <img 
                src="https://res.cloudinary.com/dyclm0vti/image/upload/v1782467437/IMG_1176_kcxykw_jkbh6n.webp" 
                alt="代表" 
                className="w-full h-auto relative z-10 object-cover aspect-[4/3] rounded-2xl shadow-lg"
              />
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <h3 className="text-brand-orange font-bold text-lg mb-2">代表メッセージと保有資格</h3>
            <h2 className="text-[1.35rem] sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight break-keep">
              「体力が落ちて頼れる人がいない…」<br/>そのお悩み、フッ軽が解決します。
            </h2>
            <div className="space-y-5 text-gray-700 leading-relaxed md:text-lg">
              <p>
                富士市で生まれ育ち、この街で長年様々なご家庭と関わってきました。そこで多く耳にしたのが、<strong>「昔は自分でできたのに、今は少しの作業でも体が痛くて…」「重い物を動かしたいけれど、子供は遠方にいて頼めない」</strong>といった切実な声です。
              </p>
              <p>
                私たちは<strong>「力仕事やお家まわりのお困りごとを、安心して丸ごと任せられる存在」</strong>として、フッ軽を立ち上げました。<br/>
                重い荷物の移動から、草むしり、不用品のお片付けまで、どんな些細なことでも<strong>礼儀正しく誠実に対応</strong>いたします。(富士市・富士宮市はもちろん、市外のご相談も大歓迎です)
              </p>
              <p className="border-l-4 border-brand-orange pl-4 py-1 bg-orange-50/30">
                <strong className="text-brand-blue block mb-1">無理をしてケガをする前に、安全で確実なプロへ。</strong>
                皆様の安全で快適な暮らしを守るため、様々な専門資格を持つ私たちが誠心誠意サポートさせていただきます。
              </p>
            </div>

            <div className="mt-6 sm:mt-8 bg-orange-50/50 p-4 sm:p-6 rounded-xl border border-orange-100 shadow-sm">
              <p className="font-bold text-brand-orange text-base sm:text-lg mb-4 flex items-center gap-2">
                <span className="bg-brand-orange text-white px-2 py-1 rounded text-xs font-black shadow-sm">安心の証</span>
                保有資格・講習修了など
              </p>
              <div className="flex flex-wrap gap-2 text-xs sm:text-sm font-bold text-gray-700">
                <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">宅地建物取引士</span>
                <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">FP2級</span>
                <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">運行管理者「貨物」</span>
                <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">古物商許可</span>
                <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">フォークリフト</span>
                <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">玉掛け</span>
                <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">クレーン作業</span>
                <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">高所作業者</span>
                <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">無人航空従事者3級</span>
                <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">チェーンソー（伐木）</span>
                <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">Microsoft associate</span>
              </div>
            </div>

            <div className="mt-6 sm:mt-8">
              <p className="font-bold text-brand-blue text-lg sm:text-xl mb-6">代表 中元 晋平</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Founder;