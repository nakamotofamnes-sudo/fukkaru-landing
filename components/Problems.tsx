import React from 'react';
import { Sprout, Sofa, Droplets, PackageOpen } from 'lucide-react';

const problems = [
  {
    icon: Sprout,
    title: '庭の草むしり、物置の片づけ',
    text: '昔は自分でやっていたけれど、最近はすぐに疲れてしまって、つい後回しになる。',
  },
  {
    icon: Sofa,
    title: '家具の移動、重い荷物の運搬',
    text: '模様替えをしたいけれど、自分たちだけでは腰を痛めそうで不安。',
  },
  {
    icon: Droplets,
    title: '外壁の汚れ、側溝の掃除',
    text: '見て見ぬふりをしている。高いところや無理な体勢での作業は、けがが怖い。',
  },
  {
    icon: PackageOpen,
    title: '不用品の片づけ、粗大ごみの搬出',
    text: '力仕事を安心して任せられる、誠実な業者が身近にいない。',
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
