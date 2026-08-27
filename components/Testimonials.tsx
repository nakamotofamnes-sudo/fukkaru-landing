import React, { useState } from 'react';
import { Quote, Instagram, ChevronDown, ChevronUp, Star, User } from 'lucide-react';

interface Review {
  id: number;
  author: string;
  date: string;
  service?: string;
  text: string;
  reply?: string;
}

const reviews: Review[] = [
  {
    id: 1,
    author: "安田小夜子様",
    date: "4 週間前",
    text: "とても誠実な人柄で頼みごと以上の仕事ぶりでした。もう二回目でしたが高齢者にはいろいろできないことがあり、またリピートしたいです。",
    reply: "この度もご依頼いただき、そして温かいお言葉まで本当にありがとうございます！お役に立てたようで何よりです。高齢の方々だとどうしても大変な作業用が増えてしまうと思いますので、またお困りごとがありましたら、どうぞ遠慮なくお声掛けください。必要なことは何でもこちらでサポートいたします。引き続きよろしくお願いいたします^_^"
  },
  {
    id: 12,
    author: "ニシムラさん",
    date: "6日前",
    service: "荷造り・荷解きサービス",
    text: "この度は引っ越し後の荷ほどき作業をお願いしましたが、男性スタッフ・女性スタッフのお二人とも本当に素晴らしいご対応でした。 女性スタッフの方は、とても細やかで気配りが行き届いており、生活動線まで考えながら丁寧に荷ほどきや収納を進めてくださったので、引っ越し直後の慌ただしい中でも安心してお任せすることができました。 また、男性スタッフの方は家具の組み立てや配置、重たい荷物の移動などをテキパキと対応してくださり、自分一人では難しかった作業もスムーズに進み大変助かりました。 お二人それぞれの得意分野や気遣いがうまく活かされた、とてもバランスの良いチームだと感じました。おかげさまで新生活を気持ちよくスタートすることができ、本当に感謝しています。 また機会があればぜひお願いしたいと思います。ありがとうございました。"
  },
  {
    id: 3,
    author: "匿名さん",
    date: "2週間前",
    service: "荷造り・荷解きサービス",
    text: "今回、家族の急病でアパートに戻れなくなり荷物引き上げと部屋の清掃をお願いしました。 こちらの事情にお気遣いいただきながら丁寧に対応していただきました。お願いしていた時間よりオーバーしていたにも関わらず追加料金もなく、本当に助かりました。 この度は有り難うございました、また何かありまきたら相談させて下さい。"
  },
  {
    id: 4,
    author: "匿名さん",
    date: "2026年5月4日",
    service: "草むしり（手作業）",
    text: "雑草だらけで困っていたのですが急なお願いにも関わらず、即対応していただけてGW中に庭が綺麗になりとても助かりました！ お値段もお安く、ゴミの回収と除草剤まで撒いていただき、ただただ感謝しかありません。 メッセージでのやり取りも丁寧で安心してお願いすることができました。 また機会がありましたらお願いしたいです。"
  },
  {
    id: 5,
    author: "匿名さん",
    date: "6日前",
    service: "荷造り・荷解きサービス",
    text: "引っ越しに伴いダンボールへ詰め込み作業をして頂きました。お一人でとても早く片付けて下さってビックリしました。埃だらけの家でしたが掃除機、不要物もまとめて頂きありがとうございました。大変助かりました。"
  },
  {
    id: 7,
    author: "ゴルフ大好きさん",
    date: "2週間前",
    service: "家具の移動・模様替え",
    text: "大きくて重い婚礼家具の移動をお願いしました。下見にも来てくださり、とても丁寧でキチンとしてました。またお願いしたいと思いました。友人にも勧めたいと思います。"
  },
  {
    id: 2,
    author: "匿名さん",
    date: "3週間前",
    service: "家具組み立てサービス",
    text: "丁寧に作業して頂き、大満足の内容です！ 中々骨の折れる作業だったかと思いますが、 お一人で淡々と迅速にこなして頂きました！ 最終的に出たゴミの処理もして頂き、 完成品に娘も大喜びです！ ご丁寧にありがとうございます！ また何かあれば依頼させて頂きます！"
  },
  {
    id: 6,
    author: "匿名さん",
    date: "3日前",
    service: "格安引越し",
    text: "問い合わせにも迅速に対応していただき安心しました。ありがとうございました。また機会がありましたらよろしくお願いします。"
  },
  {
    id: 8,
    author: "匿名さん",
    date: "2週間前",
    service: "家具組み立てサービス",
    text: "ありがとうございました！"
  },
  {
    id: 9,
    author: "匿名さん",
    date: "2026年5月6日",
    service: "家具の移動・模様替え",
    text: "素早く対応頂きありがとうございました。 料金も非常にリーズナブルでした また何かあったときにはお願い致します"
  },
  {
    id: 11,
    author: "匿名さん",
    date: "2026年5月4日",
    service: "家具組み立てサービス",
    text: "親切な対応で組み立てに関係ないゴミまで持って帰ってくださって感謝です。 また機会があったら頼もうと思います。"
  },
  {
    id: 10,
    author: "ゲストユーザー",
    date: "2026年4月30日",
    text: "過去に物置の設置をお願いしたことがあり、とても早く対応してくださり助かりました。 解体や移動するときがあればまた頼もうと思います！"
  }
];

const ReviewAccordionItem = ({ review }: { review: Review }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={`bg-white rounded-xl shadow-md border mb-4 overflow-hidden transition-all duration-300 ${
        isOpen 
          ? 'border-brand-orange border-l-8 ring-4 ring-orange-50' 
          : 'border-transperent border-l-8 hover:border-brand-orange/40 hover:shadow-lg'
      }`}
      style={{ borderLeftColor: isOpen ? '#f97316' : '#fcd34d' }}
    >
      <button 
        className={`w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between focus:outline-none transition-colors ${
          isOpen ? 'bg-orange-50/30' : 'bg-white hover:bg-orange-50/10'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col items-start text-left gap-2 w-full pr-4">
          
          {/* Header Row: Avatar, Name, Date */}
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <User size={20} className="text-brand-orange" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-base sm:text-lg leading-tight">{review.author}</span>
              <span className="text-xs text-gray-500">{review.date}</span>
            </div>
          </div>

          {/* Stars & Service label */}
          <div className="flex items-center gap-3 flex-wrap ml-13 sm:ml-13 pl-[52px]">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            {review.service && (
              <span className="text-xs font-semibold text-brand-orange bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                {review.service}
              </span>
            )}
          </div>
          
          {/* Preview Text when Closed */}
          {!isOpen && (
            <p className="text-sm text-gray-500 line-clamp-1 mt-1 text-left w-full ml-13 sm:ml-13 pl-[52px]">
              {review.text}
            </p>
          )}

        </div>
        
        {/* Toggle Icon */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          isOpen ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-orange-100 group-hover:text-brand-orange'
        }`}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      
      {/* Expanded Content */}
      <div 
        className={`transition-all duration-300 ease-in-out origin-top ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-gray-50 ml-0 sm:ml-13 sm:pl-[52px]">
          <div className="relative pt-3">
            <Quote className="absolute top-0 left-0 text-brand-orange opacity-10 transform -translate-x-2 -translate-y-1" size={32} />
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base relative z-10 whitespace-pre-wrap pl-3 font-medium">
              {review.text}
            </p>
          </div>
          
          {review.reply && (
            <div className="mt-6 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 sm:p-5 border-l-4 border-brand-orange relative shadow-sm">
              <div className="absolute -left-[14px] top-4 w-6 h-6 bg-brand-orange rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-800 mb-2 block">フッ軽合同会社 オーナーからの返信</span>
              <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{review.reply}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 relative overflow-hidden w-full max-w-full overflow-x-hidden bg-gray-50/50">
      <div className="px-4 sm:px-6 relative z-10 w-full max-w-3xl mx-auto overflow-x-hidden">
        <div className="text-center mb-12">
          <a
            href="https://instagram.com/fukkaru.fuji.benriya"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white px-5 py-2 rounded-full font-bold shadow-md hover:scale-105 transition-transform mb-6 text-sm sm:text-base animate-pulse-slow"
          >
            <Instagram size={20} />
            <span>最新の実績をInstagramで限定公開中！</span>
          </a>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            お客様の声・実績
          </h2>
          <div className="w-16 h-1 bg-brand-orange mx-auto mt-4 rounded-full"></div>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
            多くのお客様から感謝のお言葉をいただいております。<br className="hidden sm:block" />
            皆様の実際の声をご覧ください。
          </p>
        </div>

        {/* 2カラムにして縦幅を節約する */}
        <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <ReviewAccordionItem key={review.id} review={review} />
          ))}
        </div>

        {/* Instagram Feed Section */}
        <div className="mt-20 pt-12 border-t border-gray-200">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <Instagram className="text-pink-500" size={32} />
              Instagramで最新の実績を公開中！
            </h3>
            <p className="text-gray-600 mt-4 leading-relaxed text-sm md:text-base max-w-2xl mx-auto">
              日々の作業風景やお客様とのやり取りを随時更新しています。<br />
              最新のサポート実績はぜひインフルエンサーでもある当社のInstagramをご覧ください。
            </p>
          </div>

          {/* Instagram Feed Widget */}
          <div className="max-w-4xl mx-auto min-h-[300px]">
            <div className="elfsight-app-afdbcbf8-1651-498d-8fc2-09f4c139443b" data-elfsight-app-lazy></div>
          </div>
          
          <div className="text-center mt-8">
            <a 
              href="https://instagram.com/fukkaru.fuji.benriya" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Instagram size={20} />
              公式Instagramでさらに見る
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
