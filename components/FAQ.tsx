import React from 'react';

const FAQ: React.FC = () => {
  return (
    <section id="faq" className="py-20 bg-white w-full">
      <div className="container mx-auto px-2 sm:px-4 max-w-2xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-blue mb-2">よくある質問</h2>
          <p className="text-gray-600 text-base sm:text-lg">お客様の不安を解消します</p>
        </div>
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-5 sm:p-6 shadow-sm border border-gray-100">
            <p className="font-bold text-brand-orange mb-2">Q. 出張費や見積もりは本当に無料ですか？</p>
            <p className="text-gray-700 text-base leading-relaxed">はい、出張費・お見積もりは完全無料です。お気軽にご相談ください。</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 sm:p-6 shadow-sm border border-gray-100">
            <p className="font-bold text-brand-orange mb-2">Q. 土日祝日も対応していますか？</p>
            <p className="text-gray-700 text-base leading-relaxed">はい、土日祝日もご対応可能です。ご希望日時をお知らせください。</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 sm:p-6 shadow-sm border border-gray-100">
            <p className="font-bold text-brand-orange mb-2">Q. 後から追加料金を請求されませんか？</p>
            <p className="text-gray-700 text-base leading-relaxed">事前に必ずお見積もりを提示し、ご納得いただいた上で作業いたします。追加料金は一切ありません。</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 sm:p-6 shadow-sm border border-gray-100">
            <p className="font-bold text-brand-orange mb-2">Q. 支払い方法は何がありますか？</p>
            <p className="text-gray-700 text-base leading-relaxed">現金・銀行振込・各種キャッシュレス決済に対応しています。</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
