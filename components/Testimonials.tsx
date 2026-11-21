import React, { useState } from 'react';
import InstagramFeed from './InstagramFeed';
import { ChevronDown, Instagram, Star } from 'lucide-react';

interface Review {
  id: number;
  author: string;
  date: string;
  service?: string;
  text: string;
  reply?: string;
}

// お客様からいただいた口コミ。**本文は一字一句変えないこと。**
// 2026-09-02、中元さんの判断で3件（id 2 / 4 / 11）を載せないことにしました。
// 「ゴミの回収」「ゴミの処理」という記述があり、一般廃棄物の許可があるように
// 読まれかねないためです。文が悪いのではなく、載せる側の線引きの問題です。
// 戻すときは git の履歴（0e95120 以前）から取り出せます。
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
    id: 10,
    author: "ゲストユーザー",
    date: "2026年4月30日",
    text: "過去に物置の設置をお願いしたことがあり、とても早く対応してくださり助かりました。 解体や移動するときがあればまた頼もうと思います！"
  }
];

// 2026-11-21 作り直し（中元さん「口コミを、よりお客様が見やすく」）。
// 前の形は、どの口コミも1行で「…」と切れていて、9件読むのに9回押す必要があった。
// いまの形：本文を主役にして、名前と日付はカードの下にそろえる。本文はそのまま全部見せる。
// 長い口コミだけ、はじめは6行まで見せて「続きを読む」で開く。
// 長いかどうかは文字数で決める（画面の幅を測らない）。トップの前もって組み立てたHTMLと、画面の形がずれないように。
// 行の頭に「。」「、」「ー」が来ないように line-break: strict。text-wrap: pretty は使わない（Safari では段落全体の行をそろえて細く見える。
// 4〜5行の段落の最後が「す。」になるのは日本語ではふつう。/nihongo-kumihan）
const NAGAI = 120;

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const nagai = review.text.length > NAGAI;
  const [isOpen, setIsOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  // ボタンと、開く中身を結びつけるための名前。
  const bodyId = `review-${review.id}`;
  const replyId = `review-${review.id}-reply`;

  return (
    <article className="card flex flex-col p-5 [line-break:strict] sm:p-6">
      <div className="flex-1">
        {/* 依頼内容の札が無い口コミも、本文の書き出しの高さを横の口コミとそろえる（札の高さぶん取っておく） */}
        <div className="flex min-h-[31px] flex-wrap items-center justify-between gap-2">
          <span className="flex gap-0.5 text-accent" role="img" aria-label="5段階評価のうち5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} size={15} fill="currentColor" strokeWidth={0} />
            ))}
          </span>
          {review.service && <span className="chip">{review.service}</span>}
        </div>

        <p
          id={bodyId}
          className={`mt-4 whitespace-pre-wrap text-[15px] leading-[1.9] text-ink-700 ${nagai && !isOpen ? 'line-clamp-6' : ''}`}
        >
          {review.text}
        </p>

        {nagai && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls={bodyId}
            className="mt-1 inline-flex items-center gap-1 py-2 text-[13px] font-medium text-ink-900 underline underline-offset-2"
          >
            {isOpen ? '閉じる' : '続きを読む'}
            <ChevronDown size={15} aria-hidden="true" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}

        {review.reply && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setReplyOpen(!replyOpen)}
              aria-expanded={replyOpen}
              aria-controls={replyId}
              className="inline-flex items-center gap-1 py-2 text-[13px] font-medium text-ink-600 underline underline-offset-2"
            >
              フッ軽合同会社からの返信
              <ChevronDown size={15} aria-hidden="true" className={`transition-transform duration-200 ${replyOpen ? 'rotate-180' : ''}`} />
            </button>
            {/* 閉じていても中身は置いておく（AIや検索が読めるように）。画面では隠す */}
            <div id={replyId} hidden={!replyOpen} className="mt-2 border-l-2 border-accent pl-4">
              <p className="whitespace-pre-wrap text-[13.5px] leading-[1.9] text-ink-600">{review.reply}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-hairline pt-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas text-[12px] font-semibold text-ink-500" aria-hidden="true">
          {review.author.slice(0, 1)}
        </span>
        <span className="min-w-0 flex-1 text-[14px] font-semibold text-ink-900">{review.author}</span>
        <span className="shrink-0 text-[12px] text-ink-500">{review.date}</span>
      </div>
    </article>
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
            実際にご依頼いただいた方から届いた口コミです。長い口コミは「続きを読む」で全文が開きます。
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
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
                作業前と作業後、現場でのやり取りを随時更新しています。最新の実績は当社のInstagramをご覧ください。
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

          <div className="mt-8">
            <InstagramFeed />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
