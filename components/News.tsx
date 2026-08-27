import React from 'react';
import { Bell } from 'lucide-react';

const News: React.FC = () => {
  return (
    <section className="bg-orange-50 py-6 md:py-10 border-b border-orange-100">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-4 border-b border-orange-200 pb-2">
          <Bell className="text-brand-orange animate-bounce-slow" size={24} />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">お知らせ</h2>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 divide-y divide-gray-100 overflow-hidden">
          <div className="p-4 hover:bg-orange-50/50 transition-colors flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 bg-red-50/30">
            <div className="flex items-center gap-3 min-w-[140px]">
              <span className="text-sm font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded">2026年7月30日</span>
              <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded">キャンペーン</span>
            </div>
            <p className="text-sm md:text-base font-bold text-red-600">公式LINE登録してくれた方割引とお見積り後成約で最大で全部で3000円引きセール中！</p>
          </div>

          <div className="p-4 hover:bg-orange-50/50 transition-colors flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-3 min-w-[140px]">
              <span className="text-sm font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded">2026年7月1日</span>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">お知らせ</span>
            </div>
            <p className="text-sm md:text-base font-medium text-gray-700">春のキャンペーンは終了いたしました。沢山のお問い合わせ誠にありがとうございました。引き続きよろしくお願いいたします。</p>
          </div>

          <div className="p-4 hover:bg-orange-50/50 transition-colors flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-3 min-w-[140px]">
              <span className="text-sm font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded">2026年5月13日</span>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">お知らせ</span>
            </div>
            <p className="text-sm md:text-base font-medium text-red-600">2026年5月13日は緊急によりお休みさせていただきます。</p>
          </div>

          <div className="p-4 hover:bg-orange-50/50 transition-colors flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-3 min-w-[140px]">
              <span className="text-sm font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded">2026年3月25日</span>
              <span className="text-xs font-bold text-white bg-brand-green px-2 py-0.5 rounded">サービス追加</span>
            </div>
            <p className="text-sm md:text-base font-medium text-gray-700">新サービス「汚水枡の洗浄」を追加しました！見えない所の汚れもスッキリ綺麗に。</p>
          </div>
          
          <div className="p-4 hover:bg-orange-50/50 transition-colors flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-3 min-w-[140px]">
              <span className="text-sm font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded">2026年3月10日</span>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">お知らせ</span>
            </div>
            <p className="text-sm md:text-base text-gray-700">暖かくなりお庭のお手入れのご依頼が増えております。予約が埋まりやすいためお早めにご相談ください。</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default News;