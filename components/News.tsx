import React from 'react';

type Item = {
  date: string;
  label: string;
  text: string;
  /** 目立たせるのは本当に1件だけ。全部を強調すると、どれも目に入りません。 */
  highlight?: boolean;
};

const items: Item[] = [
  {
    date: '2026.07.30',
    label: 'キャンペーン',
    text: '公式LINEのご登録と、お見積り後のご成約で、合計最大3,000円引きを実施中です。',
    highlight: true,
  },
  {
    date: '2026.07.01',
    label: 'お知らせ',
    text: '春のキャンペーンは終了いたしました。たくさんのお問い合わせをありがとうございました。',
  },
  {
    date: '2026.05.13',
    label: 'お休み',
    text: '2026年5月13日は、急な事情によりお休みをいただきます。',
  },
  {
    date: '2026.03.25',
    label: 'サービス追加',
    text: '新サービス「汚水枡の洗浄」を追加しました。見えないところの汚れもきれいにします。',
  },
  {
    date: '2026.03.10',
    label: 'お知らせ',
    text: '暖かくなり、お庭の手入れのご依頼が増えています。予約が埋まりやすいため、お早めにご相談ください。',
  },
];

const News: React.FC = () => {
  return (
    <section className="section-tight border-b border-hairline bg-surface">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
          <div>
            <h2 className="text-[20px] font-bold tracking-tight text-ink-900">お知らせ</h2>
            <p className="mt-1 text-[13px] text-ink-500">最新の5件</p>
          </div>

          <dl className="rule-list border-t border-hairline">
            {items.map((item) => (
              <div key={`${item.date}-${item.label}`} className="flex flex-col gap-1.5 py-4 sm:flex-row sm:gap-6">
                <dt className="flex shrink-0 items-center gap-3 sm:w-[190px]">
                  <time className="text-[13px] tabular-nums text-ink-500">{item.date}</time>
                  <span className={item.highlight ? 'chip chip-accent' : 'chip'}>{item.label}</span>
                </dt>
                <dd className={`text-[14px] leading-[1.8] ${item.highlight ? 'font-medium text-ink-900' : 'text-ink-600'}`}>
                  {item.text}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default News;
