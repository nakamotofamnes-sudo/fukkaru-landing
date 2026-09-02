import React from 'react';
import { ArrowLeft, Send, Check } from 'lucide-react';

interface ConsultationPageProps {
  onBack: () => void;
}

// 注意：この入力欄は、いまどこにも送信されません（送信先が未設定です）。
// トップページからの導線も外れているため、現状は表示されません。
// 実際に使う前に、必ず送信先をつないでください。
const ConsultationPage: React.FC<ConsultationPageProps> = ({ onBack }) => {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo(0, 0);
  };

  const field =
    'w-full rounded border border-hairline bg-surface px-4 py-3 text-[15px] text-ink-900 outline-none transition-colors placeholder:text-ink-500 focus:border-ink-900';
  const label = 'block text-[13px] font-semibold text-ink-700';

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 py-24">
        <div className="card w-full max-w-md p-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-canvas text-accent">
            <Check size={22} />
          </span>
          <h1 className="mt-6 text-[22px] font-bold tracking-tight text-ink-900">送信しました</h1>
          <p className="mt-3 text-[14px] leading-[1.9] text-ink-500">
            お問い合わせありがとうございます。
            <br />
            内容を確認のうえ、24時間以内にご連絡いたします。
          </p>
          <button onClick={onBack} className="btn btn-primary mt-8 w-full">
            トップページへ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24">
      <div className="shell-narrow">
        <button onClick={onBack} className="mb-8 inline-flex items-center gap-2 text-[14px] text-ink-500 transition-colors hover:text-ink-900">
          <ArrowLeft size={16} />
          トップページへ戻る
        </button>

        <div className="card overflow-hidden">
          <div className="border-b border-hairline px-7 py-8 sm:px-10">
            <span className="eyebrow">Contact form</span>
            <h1 className="text-[24px] font-bold tracking-tight text-ink-900 sm:text-[28px]">無料相談・お見積り</h1>
            <p className="mt-3 text-[14px] leading-[1.9] text-ink-500">
              些細なことでもお気軽にご相談ください。内容を確認後、担当より折り返しご連絡します。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-7 py-8 sm:px-10">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="consult-name" className={label}>お名前 <span className="text-accent">必須</span></label>
                <input id="consult-name" type="text" required className={field} placeholder="例：富士 太郎" />
              </div>
              <div className="space-y-2">
                <label htmlFor="consult-tel" className={label}>電話番号 <span className="text-accent">必須</span></label>
                <input id="consult-tel" type="tel" required className={field} placeholder="例：090-1234-5678" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="consult-address" className={label}>ご住所（エリア確認のため）</label>
              <input id="consult-address" type="text" className={field} placeholder="例：富士市永田町" />
            </div>

            <div className="space-y-2">
              <label htmlFor="consult-category" className={label}>ご相談カテゴリ <span className="text-accent">必須</span></label>
              <select id="consult-category" required className={`${field} cursor-pointer appearance-none`}>
                <option value="">選択してください</option>
                <option>物置の設置・解体</option>
                <option>お庭の手入れ（草むしりなど）</option>
                <option>不用品の運搬・買取・片づけ</option>
                <option>家具の組み立て・移動</option>
                <option>清掃・洗浄</option>
                <option>その他</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="consult-visit" className={label}>訪問希望日時（任意）</label>
              <input id="consult-visit" type="text" className={field} placeholder="例：平日の午前中、土曜日など" />
            </div>

            <div className="space-y-2">
              <label htmlFor="consult-message" className={label}>ご相談内容 <span className="text-accent">必須</span></label>
              <textarea id="consult-message" required rows={5} className={field} placeholder="具体的なお困りごとや、現状の様子をご記入ください。" />
            </div>

            <div className="pt-2">
              <button type="submit" className="btn btn-primary btn-lg w-full">
                <Send size={17} />
                この内容で相談する
              </button>
              <p className="mt-4 text-center text-[12px] leading-[1.8] text-ink-500">
                個人情報は厳重に管理し、本業務以外には使用いたしません。
                <br />
                24時間以内に担当より折り返しご連絡いたします。
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConsultationPage;
