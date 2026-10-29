import React from 'react';
import Kyara from './Kyara';

const problems = [
  {
    kyara: 'kusakari',
    title: '庭の草むしり、草刈り',
    text: '昔は自分でやっていたけれど、最近はすぐに疲れてしまって、つい後回しになる。',
  },
  {
    kyara: 'kougu',
    title: '物置の設置・解体・移動',
    text: '説明書どおりに組めるか不安。古い物置を片づけたいが、自分では動かせない。',
  },
  {
    kyara: 'repair',
    title: '家具の組み立て・解体・移動',
    text: '箱から出したものの、途中で手が止まった。重い家具を運ぶのは腰を痛めそうで怖い。',
  },
  {
    kyara: 'senjo',
    title: '家の外回りの汚れ、側溝の掃除',
    text: '見て見ぬふりをしている。高いところや無理な体勢での作業は、けがが怖い。',
  },
];


const Problems: React.FC = () => {
  return (
    <section id="problems" className="section">
      <div className="shell">
        <div className="max-w-2xl">
          <span className="eyebrow">Problems</span>
          <h2 className="h-section">こんなお悩み、ありませんか</h2>
          <p className="lede">
            一軒家にお住まいの方、ご高齢のご家族がいる方から、いちばん多くいただくご相談です。
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded border border-hairline bg-hairline sm:grid-cols-2">
          {problems.map((item) => (
            // 2026-10-29：線のアイコンを、その仕事をしている中元さんのキャラに。足を枠の下の線にそろえる
            <div key={item.title} className="flex items-end gap-4 bg-surface px-6 pt-6 sm:px-7 sm:pt-7">
              <div className="min-w-0 flex-1 pb-6 sm:pb-7">
                <h3 className="text-[16px] font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.85] text-ink-500">{item.text}</p>
              </div>
              <Kyara name={item.kyara} className="shrink-0 [--k:.25] sm:[--k:.3]" />
            </div>
          ))}
        </div>

        <div className="mt-6 rounded border border-hairline bg-surface p-6 sm:p-8">
          <p className="text-[17px] font-semibold tracking-tight text-ink-900 sm:text-[19px]">
            無理をしてけがをする前に、プロにお任せください。
          </p>
          <p className="mt-3 max-w-3xl text-[14px] leading-[1.9] text-ink-500">
            ご自身で重い物を動かして、腰や膝を痛める方は少なくありません。
            体力的に負担の大きい作業や、面倒なお家まわりの手入れは、丸ごとフッ軽にお預けください。
          </p>
        </div>
      </div>
    </section>
  );
};

export default Problems;
