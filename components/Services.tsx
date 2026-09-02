import React, { useState } from 'react';
import { 
  Warehouse, Shovel, Monitor, 
  Home, Hammer, FileText,
  Leaf, Truck, Droplets, ShoppingBag,
  ChevronDown
} from 'lucide-react';

const ServiceCard: React.FC<{ title: string, price: string, desc: string, icon: any, popular?: boolean }> = ({ title, price, desc, icon: Icon, popular }) => {
  return (
    <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-100/50 bg-white/60 backdrop-blur-sm group">
      <div className={`p-3 sm:p-3.5 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110 ${popular ? 'bg-gradient-to-br from-orange-50 to-orange-100 text-brand-orange border border-orange-200/50' : 'bg-gradient-to-br from-blue-50 to-blue-100 text-brand-blue border border-blue-200/50'}`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
      </div>
      <div className="flex-1 pt-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
          <h4 className="font-bold text-gray-800 text-[15px] sm:text-base tracking-tight flex items-center gap-2 flex-wrap truncate text-wrap">
            {title}
            {popular && (
              <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold tracking-wider shadow-sm flex-shrink-0">人気</span>
            )}
          </h4>
          <span className="font-black text-red-500 text-base sm:text-lg tracking-tight whitespace-nowrap drop-shadow-sm">
            {price}
          </span>
        </div>
        <p className="text-[13px] text-gray-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

const ServiceSectionAccordion: React.FC<{
    title: string, colorClass: string, bgClass: string, services: any[], defaultOpen?: boolean
}> = ({ title, colorClass, bgClass, services, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
      <div className={`rounded-3xl border border-gray-100 shadow-sm transition-all overflow-hidden ${isOpen ? bgClass : 'bg-white'}`}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-5 md:p-6 bg-white/50 backdrop-blur-sm hover:bg-black/5 transition-colors focus:outline-none"
        >
            <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-3">
              <span className={`flex items-center justify-center w-8 h-8 rounded-full ${colorClass}`}>●</span> {title}
            </h3>
            <ChevronDown className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <div 
          className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
        >
            <div className="p-4 pt-0 md:p-6 md:pt-0 space-y-3">
              {services.map((item, index) => (
                <ServiceCard key={index} {...item} />
              ))}
            </div>
        </div>
      </div>
    );
};

const Services: React.FC = () => {
  const gardenServices = [
    { title: "草むしり（手作業）", price: "8,000円〜", desc: "根元から丁寧に除去", icon: Leaf, popular: true },
    { title: "草刈り（機械使用）", price: "10,000円〜", desc: "草刈機で広範囲に対応", icon: Leaf },
    { title: "木の伐採", price: "9,000円〜", desc: "高さ3m未満・地上作業", icon: Shovel },
    { title: "防草シート・砂利敷き", price: "10,000円〜", desc: "資材費別途", icon: Shovel },
    { title: "落ち葉清掃", price: "6,000円〜", desc: "お庭を綺麗に保ちます", icon: Leaf },
    { title: "庭の水やり", price: "3,000円〜", desc: "留守中の水やりもお任せ", icon: Droplets },
  ];

  const indoorServices = [
    { title: "軽引越し", price: "15,000円〜", desc: "単身の方・少量のお引越しに", icon: Truck, popular: true },
    { title: "法人向け緊急運搬", price: "要お見積り", desc: "緊急時の配送・運送対応", icon: Truck },
    { title: "不用品の運搬・買取", price: "5,000円〜", desc: "まだ使えるものは買取、運び出しもお任せ", icon: Truck, popular: true },
    { title: "家具の移動・模様替え", price: "8,000円〜", desc: "室内移動・階層移動", icon: Home },
    { title: "家具・デスク組み立て", price: "8,000円〜", desc: "複雑な家具・昇降デスク等", icon: Hammer },
  ];

  const cleaningServices = [
    { title: "高圧洗浄", price: "15,000円〜", desc: "家の外回り洗浄・駐車場", icon: Droplets, popular: true },
    { title: "カーポート洗浄", price: "12,000円〜", desc: "カーポートの屋根や柱の汚れ落とし", icon: Droplets, popular: true },
    { title: "出張洗車", price: "8,000円〜", desc: "手洗い・車内清掃", icon: Droplets },
    { title: "側溝掃除・泥上げ", price: "10,000円〜", desc: "詰まりを解消", icon: Shovel },
    { title: "汚水枡の洗浄", price: "6,000円〜", desc: "家庭用・小型店舗用", icon: Droplets },
  ];

  const otherServices = [
    { title: "物置の設置・解体", price: "15,000円〜", desc: "お庭のスペース有効活用", icon: Warehouse, popular: true },
    { title: "買い物代行", price: "7,000円〜", desc: "重量物・遠方対応", icon: ShoppingBag },
    { title: "お墓参り代行", price: "7,000円〜", desc: "清掃・献花含む", icon: Home },
  ];

  return (
    <section id="services" className="mobile-section bg-transparent pt-12 md:pt-20">
      <div className="container mx-auto mobile-px">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-brand-blue tracking-tight relative inline-block pb-3 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1.5 after:bg-gradient-to-r after:from-brand-blue after:to-brand-orange after:rounded-full">
            サービス・料金一覧
          </h2>
          <p className="mt-6 text-gray-500 font-medium md:text-lg">一軒家のお庭の手入れから重い物の移動まで、幅広く対応</p>
          <div className="mt-8 flex justify-center">
            <p className="text-[15px] md:text-[17px] text-brand-orange font-bold px-6 md:px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-50 to-orange-100/50 inline-block border border-orange-200/50 shadow-sm leading-relaxed">
              ご高齢の方、力仕事にご不安がある方はお気軽にお電話ください！<br className="md:hidden"/>礼儀正しく丁寧なスタッフが、皆様の暮らしを安全にサポートいたします。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto items-start">
          <ServiceSectionAccordion
            title="庭・外回りのお手入れ"
            colorClass="bg-brand-green/10 text-brand-green"
            bgClass="bg-gradient-to-b from-green-50/50 to-white"
            services={gardenServices}
            defaultOpen={true}
          />
          <ServiceSectionAccordion
            title="室内・引越しサポート"
            colorClass="bg-brand-orange/10 text-brand-orange"
            bgClass="bg-gradient-to-b from-orange-50/50 to-white"
            services={indoorServices}
            defaultOpen={true}
          />
          <ServiceSectionAccordion
            title="清掃・洗浄サービス"
            colorClass="bg-blue-500/10 text-blue-500"
            bgClass="bg-gradient-to-b from-blue-50/50 to-white"
            services={cleaningServices}
            defaultOpen={false}
          />
          <ServiceSectionAccordion
            title="その他・代行サービス"
            colorClass="bg-purple-500/10 text-purple-500"
            bgClass="bg-gradient-to-b from-purple-50/50 to-white"
            services={otherServices}
            defaultOpen={false}
          />
        </div>

        <div className="mt-8 max-w-6xl mx-auto bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 text-center">
          <h4 className="text-lg font-bold text-brand-blue mb-4">お見積もり・ご相談は完全無料です</h4>
          <p className="text-sm text-gray-600 leading-relaxed font-medium">
            作業内容や状況によって適切なプラン・料金をご案内しております。<br/>
            お電話またはLINEから、まずはお気軽に「こんなこと頼める？」とご相談ください。<br/>
            ※ 記載のない作業も柔軟に対応いたします。
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <a href="#contact" className="inline-flex items-center gap-2 bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
              今すぐ無料相談する
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;