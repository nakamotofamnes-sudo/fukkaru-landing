import React from 'react';
import { Sprout, Warehouse, Hammer, Droplets } from 'lucide-react';

const problems = [
  {
    icon: Sprout,
    title: '庭の草むしり、草刈り',
    text: '昔は自分でやっていたけれど、最近はすぐに疲れてしまって、つい後回しになる。',
  },
  {
    icon: Warehouse,
    title: '物置の設置・解体・移動',
    text: '説明書どおりに組めるか不安。古い物置を片づけたいが、自分では動かせない。',
  },
  {
    icon: Hammer,
    title: '家具の組み立て・解体・移動',
    text: '箱から出したものの、途中で手が止まった。重い家具を運ぶのは腰を痛めそうで怖い。',
  },
  {
    icon: Droplets,
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
            <div key={item.title} className="bg-surface p-6 sm:p-7">
              <item.icon size={22} className="text-ink-500" />
              <h3 className="mt-4 text-[16px] font-semibold text-ink-900">{item.title}</h3>
              <p className="mt-2 text-[14px] leading-[1.85] text-ink-500">{item.text}</p>
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
