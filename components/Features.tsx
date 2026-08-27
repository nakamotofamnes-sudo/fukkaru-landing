import React from 'react';
import { Truck, Home, HeartHandshake } from 'lucide-react';
import { ReasonItem } from '../types';

/**
 * Google Driveの共有リンクを直接表示可能な画像URLに変換するヘルパー関数
 */
const getOptimizedImageUrl = (url: string) => {
  if (!url) return '';
  
  // Check if it is a Google Drive URL
  if (url.includes('drive.google.com')) {
    // Extract File ID
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      // sz=w1000 は横幅1000pxで取得するという指定です（高画質確保）
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
  }
  
  return url;
};

const Features: React.FC = () => {
  const reasons: ReasonItem[] = [
    {
      title: "重い物や高い所など、大変な作業もすぐ駆けつけ！",
      description: "富士市・富士宮市を中心にフットワーク軽く最短即日で対応！（市外もご相談可）「体力的にしんどくて…」というご要望にも、親切・丁寧なお手伝いでスピード対応いたします。",
      icon: Truck,
      imageUrl: "https://res.cloudinary.com/dyclm0vti/image/upload/v1773024410/1_drrtxv.png"
    },
    {
      title: "説明が丁寧で、何度でも頼みたくなる安心感",
      description: "「こんな小さなこと頼んでいいのかな？」という遠慮は一切不要です！お見積もりや作業内容をわかりやすくご説明し、誠実な対応で皆様から繰り返しご依頼をいただいております。",
      icon: HeartHandshake,
      imageUrl: "https://res.cloudinary.com/dyclm0vti/image/upload/v1773024411/2_sz9b13.png"
    },
    {
      title: "お庭から室内まで、面倒なことはすべて完了",
      description: "重い家具の移動、不用品のお片付け、手のかかるお庭の草むしりから外構のお掃除まで。複数の業者を探す手間なく、お家まわりの「体力が必要なこと」をまるごと代行いたします。",
      icon: Home,
      imageUrl: "https://res.cloudinary.com/dyclm0vti/image/upload/v1773024411/3_lwbdcx.png"
    },
  ];

  // Images mapped to reasons using reliable Unsplash IDs
  const reasonImages = [
    "https://res.cloudinary.com/dyclm0vti/image/upload/v1773024410/1_drrtxv.png", // Reason 1: User provided Cloudinary Image
    "https://res.cloudinary.com/dyclm0vti/image/upload/v1773024411/2_sz9b13.png", // Reason 2: User provided Cloudinary Image
    "https://res.cloudinary.com/dyclm0vti/image/upload/v1773024411/3_lwbdcx.png"  // Reason 3: User provided Cloudinary Image
  ];

  return (
    <section id="reasons" className="mobile-section bg-transparent w-full">
      <div className="container mx-auto mobile-px max-w-full">
        <div className="text-center mb-16">
          <span className="text-brand-orange font-bold text-sm tracking-widest block mb-3 uppercase">Reasons</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            フッ軽が選ばれる理由
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-brand-blue to-brand-orange mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {reasons.map((item, index) => (
            <div key={index} className="flex flex-col group bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              {/* Card Image Wrapper - Ensure overflow is visible for the icon to pop out */}
              <div className="relative mb-8 z-0">
                <div className="h-64 md:h-56 w-full bg-gray-100 overflow-hidden rounded-2xl shadow-sm relative z-0">
                  <img 
                    src={getOptimizedImageUrl(reasonImages[index])} 
                    alt={item.title} 
                    className="w-full h-full object-cover object-[50%_30%] md:object-[50%_25%] transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                   />
                </div>
                {/* Icon Box - High z-index to ensure visibility */}
                <div className="absolute -bottom-6 left-6 w-14 h-14 bg-brand-blue text-white rounded-xl shadow-lg z-20 group-hover:bg-brand-orange transition-colors duration-300 flex items-center justify-center border-4 border-white backdrop-blur-sm">
                  <item.icon size={28} strokeWidth={2.5} />
                </div>
              </div>
              
              <div className="pt-2 px-2">
                <h3 className="text-xl md:text-[22px] font-bold text-gray-800 mb-3 leading-snug">
                  <span className="text-brand-orange text-2xl font-black mr-2 opacity-80 italic">0{index + 1}.</span>
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-loose text-sm md:text-[15px] font-medium">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;