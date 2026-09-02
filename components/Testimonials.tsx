import React, { useState } from 'react';
import { ChevronDown, Instagram, Star } from 'lucide-react';

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

const ReviewItem: React.FC<{ review: Review }> = ({ review }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-canvas"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas text-[13px] font-semibold text-ink-500">
          {review.author.slice(0, 1)}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[15px] font-semibold text-ink-900">{review.author}</span>
            <span className="flex gap-0.5 text-accent" aria-label="5段階評価のうち5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
              ))}
            </span>
            <span className="text-[12px] text-ink-500">{review.date}</span>
          </span>

          {review.service && (
            <span className="mt-2 flex">
              <span className="chip">{review.service}</span>
            </span>
          )}

          {!isOpen && (
            <span className="mt-2 block truncate text-[13px] text-ink-500">{review.text}</span>
          )}
        </span>

        <ChevronDown
          size={17}
          className={`mt-1 shrink-0 text-ink-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-hairline px-5 py-5">
          <p className="whitespace-pre-wrap text-[14px] leading-[1.9] text-ink-600">{review.text}</p>

          {review.reply && (
            <div className="mt-5 border-l-2 border-accent pl-4">
              <p className="text-[12px] font-semibold tracking-[0.04em] text-ink-500">
                フッ軽合同会社からの返信
              </p>
              <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-[1.9] text-ink-500">{review.reply}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="section border-t border-hairline">
      <div className="shell">
        <div className="max-w-2xl">
          <span className="eyebrow">Reviews</span>
          <h2 className="h-section">お客様の声</h2>
          <p className="lede">
            実際にご依頼いただいた方から届いた口コミです。見出しを押すと全文が開きます。
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>

        {/* Instagram の最新実績 */}
        <div className="mt-16 border-t border-hairline pt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <span className="eyebrow">Instagram</span>
              <h3 className="text-[22px] font-bold tracking-tight text-ink-900">
                日々の作業の様子を載せています
              </h3>
              <p className="mt-2 text-[14px] leading-[1.85] text-ink-500">
                作業前と作業後、現場でのやり取りを随時更新しています。
              </p>
            </div>
            <a
              href="https://instagram.com/fukkaru.fuji.benriya"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline shrink-0"
            >
              <Instagram size={17} />
              @fukkaru.fuji.benriya
            </a>
          </div>

          <div className="mt-8 min-h-[300px]">
            <div className="elfsight-app-afdbcbf8-1651-498d-8fc2-09f4c139443b" data-elfsight-app-lazy></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
