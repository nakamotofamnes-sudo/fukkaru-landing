import React from 'react';

const credentials = [
  '宅地建物取引士',
  'FP2級',
  '運行管理者（貨物）',
  '古物商許可',
  'フォークリフト',
  '玉掛け',
  'クレーン作業',
  '高所作業者',
  '無人航空従事者3級',
  'チェーンソー（伐木）',
  'Microsoft associate',
];

const Founder: React.FC = () => {
  return (
    <section id="founder" className="section border-t border-hairline bg-canvas">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <img
              src="https://res.cloudinary.com/dyclm0vti/image/upload/v1782467437/IMG_1176_kcxykw_jkbh6n.webp"
              alt="フッ軽合同会社 代表 中元晋平"
              className="aspect-[4/3] w-full rounded border border-hairline object-cover"
              loading="lazy"
            />
          </div>

          <div>
            <span className="eyebrow">Message</span>
            <h2 className="text-[24px] font-bold leading-[1.45] tracking-tight text-ink-900 sm:text-[28px]">
              「体力が落ちて、頼れる人がいない」
              <br />
              そのお悩みを引き受けます。
            </h2>

            <div className="mt-6 space-y-5 text-[15px] leading-[1.9] text-ink-600">
              <p>
                富士市で生まれ育ち、この街で長年いろいろなご家庭と関わってきました。そこで多く耳にしたのが、
                「昔は自分でできたのに、今は少しの作業でも体が痛くて」「重い物を動かしたいけれど、
                子どもは遠方にいて頼めない」という声です。
              </p>
              <p>
                私たちは「力仕事やお家まわりの困りごとを、安心して丸ごと任せられる存在」として、フッ軽を立ち上げました。
                荷物の移動から草むしり、不用品のお片づけまで、どんな些細なことでも礼儀正しく対応します。
              </p>
              <p className="border-l-2 border-accent pl-4 text-ink-900">
                無理をしてけがをする前に、安全で確実なプロへ。
                皆様の暮らしを守るため、資格を持つ私たちが誠意をもってお手伝いします。
              </p>
            </div>

            <div className="mt-8 rounded border border-hairline bg-surface p-5">
              <p className="text-[12px] font-semibold tracking-[0.06em] text-ink-500">保有資格・講習修了</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {credentials.map((c) => (
                  <li key={c} className="chip">{c}</li>
                ))}
              </ul>
            </div>

            <p className="mt-8 text-[15px] text-ink-500">
              代表 <span className="ml-1 font-semibold text-ink-900">中元 晋平</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Founder;
