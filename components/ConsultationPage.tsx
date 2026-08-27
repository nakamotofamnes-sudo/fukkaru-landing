import React from 'react';
import { ArrowLeft, Send, CheckCircle, Calendar, MapPin } from 'lucide-react';

interface ConsultationPageProps {
  onBack: () => void;
}

const ConsultationPage: React.FC<ConsultationPageProps> = ({ onBack }) => {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo(0, 0);
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-32 pb-12 px-4 bg-gray-50 flex flex-col items-center justify-center animate-fade-in">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full text-center border border-gray-100">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">送信完了</h2>
          <p className="text-gray-600 mb-10 leading-relaxed">
            お問い合わせありがとうございます。<br/>
            内容を確認次第、担当者より<br/>24時間以内にご連絡させていただきます。
          </p>
          <button 
            onClick={onBack}
            className="w-full bg-brand-blue text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors shadow-lg hover:shadow-xl"
          >
            トップページへ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={onBack}
            className="group flex items-center text-gray-500 hover:text-brand-blue mb-8 transition-colors font-medium"
          >
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mr-3 group-hover:bg-brand-blue group-hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </div>
            トップページへ戻る
          </button>
          
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-brand-blue p-8 md:p-12 text-center relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand-orange opacity-20 rounded-full translate-x-1/3 translate-y-1/3"></div>
              
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 relative z-10">無料相談・お見積り</h1>
              <p className="text-blue-100 relative z-10 max-w-lg mx-auto leading-relaxed">
                些細なことでもお気軽にご相談ください。<br/>
                内容を確認後、担当スタッフより折り返しご連絡いたします。
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
              {/* Form Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block font-bold text-gray-700 text-sm">お名前 <span className="text-red-500">*</span></label>
                  <input type="text" required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all" placeholder="例：富士 太郎" />
                </div>
                <div className="space-y-2">
                  <label className="block font-bold text-gray-700 text-sm">電話番号 <span className="text-red-500">*</span></label>
                  <input type="tel" required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all" placeholder="例：090-1234-5678" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-gray-700 text-sm">ご住所（エリア確認のため）</label>
                <div className="relative">
                  <MapPin className="absolute top-4 left-4 text-gray-400" size={20} />
                  <input type="text" className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all" placeholder="例：富士市永田町..." />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-gray-700 text-sm">ご相談カテゴリ <span className="text-red-500">*</span></label>
                <select className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all appearance-none cursor-pointer">
                  <option value="">選択してください</option>
                  <option>物置の設置・撤去</option>
                  <option>お庭の手入れ（草むしり等）</option>
                  <option>不用品回収・片付け</option>
                  <option>不動産売却・査定</option>
                  <option>リフォーム・修繕</option>
                  <option>その他</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-gray-700 text-sm">訪問希望日時（任意）</label>
                <div className="relative">
                  <Calendar className="absolute top-4 left-4 text-gray-400" size={20} />
                  <input type="text" className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all" placeholder="例：平日の午前中希望、土日希望など" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-gray-700 text-sm">ご相談内容 <span className="text-red-500">*</span></label>
                <textarea required rows={5} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all" placeholder="具体的なお困りごとや、現状の様子をご記入ください。"></textarea>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold text-xl py-5 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <Send size={24} />
                  この内容で相談する
                </button>
                <p className="text-center text-xs text-gray-500 mt-4">
                  ※ 個人情報は厳重に管理し、本業務以外には使用いたしません。<br/>
                  ※ 24時間以内に担当者より折り返しご連絡いたします。
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationPage;