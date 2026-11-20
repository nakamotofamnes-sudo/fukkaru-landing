/**
 * 見積もりの予約（/yoyaku/。2026-11-19 中元さんと決めた形）
 *
 *   いちばん上：今日・急ぎの方は電話と LINE（当日は予約で選べない）
 *   手順1 何をしてほしいか → 2 いつ見に来てほしいか → 3 場所と様子 → 4 お名前と連絡の受け方 → 済み
 *   送った時点は「仮予約」。中元が確かめて、LINE か電話で確定を伝える（機械からは送らない）
 *
 * 作業の名前は、トップの料金表（components/Services.tsx の groups）から読む。写しを作らない。
 * 入力の字は16px以上（iPhone の Safari は、それより小さい欄を押すと画面を勝手に拡大する）。
 * 番地は聞かない（確定の連絡で伺う）。
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, MessageCircle, Phone } from 'lucide-react';
import { groups } from '../../components/Services';
import Kugiri from '../../components/Kugiri';
import {
  akiWoYomu, okuru, CHUSHA, DENWA, ITSUMADE, LINE_SOUDAN, SHASHIN, SHI, TACHIAI,
  type Aki, type Kekka, type Okuru,
} from './api';

const LOGO =
  'https://res.cloudinary.com/dyclm0vti/image/upload/f_auto,q_auto:good,w_128,c_limit/v1772689454/%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3_%E3%83%AD%E3%82%B3%E3%82%99%E3%83%95%E3%83%83%E8%BB%BD_le0bo3.png';

const SONOTA = 'そのほか・まとめて相談';
const SAGYOU_GROUPS = groups
  .filter((g) => !g.hidden)
  .map((g) => ({ title: g.title, names: g.services.map((s) => s.title) }));

const YOUBI = ['日', '月', '火', '水', '木', '金', '土'];
const hiNoJi = (hi: string) => {
  const d = new Date(`${hi}T00:00:00Z`);
  return { m: d.getUTCMonth() + 1, d: d.getUTCDate(), w: d.getUTCDay() };
};
const hiLabel = (hi: string) => {
  const { m, d, w } = hiNoJi(hi);
  return `${m}月${d}日(${YOUBI[w]})`;
};
const owari = (ji: string) => `${String(Number(ji.slice(0, 2)) + 1).padStart(2, '0')}:00`;

const TEJUN = ['何をしてほしいか', 'いつ見に来てほしいか', '場所と様子', 'お名前と連絡の受け方'];

type Form = Omit<Okuru, 'hp'>;
const KARA: Form = {
  sagyou: [], hi: '', ji: '', shi: '', chou: '', shashin: '', tachiai: '', itsumade: '', chusha: '',
  hitokoto: '', namae: '', renraku: 'line', denwa: '',
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/* ── 小さな部品 ─────────────────────────── */

/** 押すと選ばれる札（いくつでも／1つだけ、どちらにも使う）。naka＝時間のボタン（✓なし・1行・真ん中） */
const Fuda = ({ on, onClick, children, disabled, naka }: {
  on: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean; naka?: boolean;
}) => (
  <button
    type="button"
    aria-pressed={on}
    disabled={disabled}
    onClick={onClick}
    className={`min-h-[44px] rounded border px-3.5 py-2 text-[15px] leading-snug transition-colors ${
      naka ? 'whitespace-nowrap px-2 text-center' : 'text-left'
    } ${
      on
        ? 'border-ink-900 bg-ink-900 text-white'
        : 'border-hairline bg-surface text-ink-800 hover:border-ink-400'
    } disabled:cursor-not-allowed disabled:opacity-40`}
  >
    {on && !naka && <Check size={15} className="-mt-0.5 mr-1.5 inline" aria-hidden="true" />}
    {children}
  </button>
);

/** 1つだけ選ぶ欄 */
const Erabu = ({ label, list, value, onChange }: {
  label: string; list: readonly string[]; value: string; onChange: (v: string) => void;
}) => (
  <fieldset className="mt-6">
    <legend className="text-[15px] font-bold text-ink-900">{label}</legend>
    <div className="mt-2.5 flex flex-wrap gap-2">
      {list.map((v) => (
        <Fuda key={v} on={value === v} onClick={() => onChange(v)}>
          {v}
        </Fuda>
      ))}
    </div>
  </fieldset>
);

const ranStyle =
  'mt-2 block w-full rounded border border-hairline bg-surface px-3.5 py-3 text-[16px] text-ink-900 placeholder:text-ink-400 focus:border-ink-900 focus:outline-none';

/* ── 本体 ─────────────────────────────── */

const Yoyaku: React.FC = () => {
  const [tejun, setTejun] = useState(0); // 0〜3、4＝済み
  const [f, setF] = useState<Form>(KARA);
  const [hp, setHp] = useState('');
  const [aki, setAki] = useState<Aki | null>(null);
  const [akiDame, setAkiDame] = useState('');
  const [sending, setSending] = useState(false);
  const [dame, setDame] = useState('');
  const [kekka, setKekka] = useState<Extract<Kekka, { ok: true }> | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  const yomu = () => {
    setAkiDame('');
    setAki(null);
    akiWoYomu()
      .then(setAki)
      .catch((e: Error) => setAkiDame(e.message));
  };
  useEffect(yomu, []);

  // 手順が変わったら、手順の頭まで戻す（下のほうで押しても、次の手順の頭から読めるように）
  const susumu = (n: number) => {
    setDame('');
    setTejun(n);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  };

  const toggleSagyou = (name: string) =>
    set('sagyou', f.sagyou.includes(name) ? f.sagyou.filter((s) => s !== name) : [...f.sagyou, name]);

  // カレンダー（月曜はじまり）。前の空きマスを足して7列にそろえる
  const masu = useMemo(() => {
    if (!aki) return [];
    const lead = (hiNoJi(aki.hi[0]).w + 6) % 7;
    return [...Array<string | null>(lead).fill(null), ...aki.hi];
  }, [aki]);

  const tejun3Tarinai =
    !f.shi ? '市' : !f.shashin ? '写真' : !f.tachiai ? '立ち会い' : !f.itsumade ? 'いつまでに' : !f.chusha ? '車を停める場所' : '';
  const denwaKazu = f.denwa.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/[^0-9]/g, '');
  const tejun4Tarinai = !f.namae.trim()
    ? 'お名前'
    : f.renraku === 'denwa' && !/^0\d{9,10}$/.test(denwaKazu)
      ? '電話番号（市外局番から）'
      : '';

  const okuruBotan = async () => {
    if (tejun4Tarinai) {
      setDame(`${tejun4Tarinai}を書いてください。`);
      return;
    }
    setSending(true);
    setDame('');
    const r = await okuru({ ...f, denwa: f.renraku === 'denwa' ? f.denwa : '', hp });
    setSending(false);
    if (r.ok) {
      setKekka(r);
      window.gtag?.('event', 'yoyaku_kari', { renraku: r.renraku });
      susumu(4);
      return;
    }
    if (r.kind === 'ume') {
      // 先に埋まった：日時の手順に戻して、空きを読み直す
      set('ji', '');
      yomu();
      susumu(1);
      setDame(r.error);
      return;
    }
    setDame(r.error);
  };

  const akiNoHi = f.hi && aki ? aki.aki[f.hi] ?? [] : [];

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-hairline bg-surface">
        <div className="shell-narrow flex h-14 items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-[15px] font-bold text-ink-900">
            <img src={LOGO} alt="" width={28} height={28} className="h-7 w-7" />
            フッ軽
          </a>
          <a href="/" className="text-[13px] text-ink-500 underline-offset-2 hover:underline">
            ホームへ戻る
          </a>
        </div>
      </header>

      <main className="shell-narrow pb-24 pt-8 sm:pt-12">
        <span className="eyebrow">見積もりの予約</span>
        <h1 className="text-[24px] leading-[1.4] sm:text-[30px]">
          まずは無料の
          <wbr />
          見積もりから
        </h1>
        <p className="mt-3 text-[15px] leading-[1.9] text-ink-600">
          <Kugiri text="作業と、見に来てほしい日時を選ぶだけ。中元が確かめて、LINEかお電話で確定のご連絡をします。" ato="、。" />
        </p>

        {/* 今日・急ぎの方 */}
        <section className="mt-6 rounded border border-accent-line bg-accent-soft p-4 sm:p-5">
          <h2 className="text-[16px] text-ink-900">今日・急ぎの方は、こちらから</h2>
          <p className="mt-1 text-[14px] leading-[1.8] text-ink-700">当日の予約は、この画面では選べません。</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <a href={`tel:${DENWA.replace(/-/g, '')}`} className="btn btn-primary w-full">
              <Phone size={17} aria-hidden="true" />
              電話する（{DENWA}）
            </a>
            <a href={LINE_SOUDAN} target="_blank" rel="noopener noreferrer" className="btn btn-line w-full">
              <MessageCircle size={17} aria-hidden="true" />
              LINEで相談する
            </a>
          </div>
        </section>

        <div ref={topRef} className="scroll-mt-4" />

        {tejun < 4 && (
          <div className="card mt-8 p-5 sm:p-7">
            {/* どこまで進んだか（正直に4つ） */}
            <p className="text-[13px] font-semibold tabular-nums text-ink-500">
              {tejun + 1} / 4　{TEJUN[tejun]}
            </p>
            <div className="mt-2 grid grid-cols-4 gap-1" aria-hidden="true">
              {TEJUN.map((t, i) => (
                <span key={t} className={`h-1 rounded-full ${i <= tejun ? 'bg-ink-900' : 'bg-hairline'}`} />
              ))}
            </div>

            {/* 手順1 何をしてほしいか */}
            {tejun === 0 && (
              <div className="mt-5">
                <h2 className="text-[19px]">何をしてほしいですか？</h2>
                <p className="mt-1 text-[14px] text-ink-500">いくつでも選べます。</p>
                {SAGYOU_GROUPS.map((g) => (
                  <fieldset key={g.title} className="mt-5">
                    <legend className="text-[14px] font-semibold text-ink-600">{g.title}</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {g.names.map((n) => (
                        <Fuda key={n} on={f.sagyou.includes(n)} onClick={() => toggleSagyou(n)}>
                          {n}
                        </Fuda>
                      ))}
                    </div>
                  </fieldset>
                ))}
                <div className="mt-5 flex flex-wrap gap-2">
                  <Fuda on={f.sagyou.includes(SONOTA)} onClick={() => toggleSagyou(SONOTA)}>
                    {SONOTA}
                  </Fuda>
                </div>
                <div className="mt-7">
                  <button type="button" className="btn btn-primary btn-lg w-full" disabled={f.sagyou.length === 0} onClick={() => susumu(1)}>
                    {f.sagyou.length === 0 ? '作業を1つ以上選んでください' : `次へ（${f.sagyou.length}つ選択中）`}
                    {f.sagyou.length > 0 && <ArrowRight size={17} aria-hidden="true" />}
                  </button>
                </div>
              </div>
            )}

            {/* 手順2 いつ見に来てほしいか */}
            {tejun === 1 && (
              <div className="mt-5">
                <h2 className="text-[19px]">いつ見に来てほしいですか？</h2>
                <p className="mt-1 text-[14px] leading-[1.8] text-ink-500">
                  <Kugiri text="明日から4週間先まで。見積もりは1時間ほどです。" ato="。" />
                </p>
                {dame && <p className="mt-3 rounded border border-accent-line bg-accent-soft px-3.5 py-2.5 text-[14px] text-ink-800">{dame}</p>}

                {!aki && !akiDame && <p className="mt-6 animate-pulse text-[15px] text-ink-500">空いている日時を読んでいます…</p>}
                {akiDame && (
                  <div className="mt-6">
                    <p className="text-[15px] leading-[1.8] text-ink-800">{akiDame}</p>
                    <button type="button" className="btn btn-outline mt-3" onClick={yomu}>
                      もう一度読む
                    </button>
                  </div>
                )}

                {aki && (
                  <>
                    <div className="mt-5 grid grid-cols-7 gap-1 text-center" role="group" aria-label="日付を選ぶ">
                      {['月', '火', '水', '木', '金', '土', '日'].map((w) => (
                        <span key={w} className={`pb-1 text-[12px] font-semibold ${w === '日' ? 'text-accent' : 'text-ink-500'}`}>
                          {w}
                        </span>
                      ))}
                      {masu.map((hi, i) => {
                        if (!hi) return <span key={`kara${i}`} />;
                        const { m, d } = hiNoJi(hi);
                        const n = aki.aki[hi]?.length ?? 0;
                        const on = f.hi === hi;
                        const tsukiHajime = d === 1 || hi === aki.hi[0];
                        return (
                          <button
                            key={hi}
                            type="button"
                            disabled={n === 0}
                            aria-pressed={on}
                            aria-label={`${hiLabel(hi)} ${n === 0 ? '埋まっています' : `空き${n}枠`}`}
                            onClick={() => {
                              set('hi', hi);
                              set('ji', '');
                            }}
                            className={`flex min-h-[52px] flex-col items-center justify-center rounded border tabular-nums transition-colors ${
                              on
                                ? 'border-ink-900 bg-ink-900 text-white'
                                : n === 0
                                  ? 'cursor-not-allowed border-transparent bg-transparent text-ink-300'
                                  : 'border-hairline bg-surface text-ink-900 hover:border-ink-400'
                            }`}
                          >
                            {tsukiHajime && <span className={`text-[10px] leading-none ${on ? 'text-white/80' : 'text-ink-500'}`}>{m}月</span>}
                            <span className="text-[16px] font-semibold leading-tight">{d}</span>
                            <span className={`text-[10px] leading-none ${on ? 'text-white/80' : n === 0 ? 'text-ink-300' : 'text-ink-500'}`}>
                              {n === 0 ? '−' : '空き'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[13px] text-ink-500">「−」の日は埋まっています。</p>

                    {f.hi && (
                      <div className="mt-6">
                        <h3 className="text-[16px]">{hiLabel(f.hi)} の空いている時間</h3>
                        <div className="mt-2.5 grid grid-cols-3 gap-2">
                          {akiNoHi.map((ji) => (
                            <Fuda key={ji} naka on={f.ji === ji} onClick={() => set('ji', ji)}>
                              <span className="tabular-nums">{ji}〜</span>
                            </Fuda>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="mt-7 grid gap-2">
                  <button type="button" className="btn btn-primary btn-lg w-full" disabled={!f.hi || !f.ji} onClick={() => susumu(2)}>
                    {!f.hi ? '日付を選んでください' : !f.ji ? '時間を選んでください' : `次へ（${hiLabel(f.hi)} ${f.ji}〜）`}
                    {f.hi && f.ji && <ArrowRight size={17} aria-hidden="true" />}
                  </button>
                  <button type="button" className="btn btn-quiet mx-auto" onClick={() => susumu(0)}>
                    <ArrowLeft size={16} aria-hidden="true" />
                    作業を選び直す
                  </button>
                </div>
              </div>
            )}

            {/* 手順3 場所と様子 */}
            {tejun === 2 && (
              <div className="mt-5">
                <h2 className="text-[19px]">場所と、いまの様子を教えてください</h2>
                <Erabu label="市" list={SHI} value={f.shi} onChange={(v) => set('shi', v)} />
                <label className="mt-6 block">
                  <span className="text-[15px] font-bold text-ink-900">町名</span>
                  <span className="mt-0.5 block text-[13px] leading-[1.7] text-ink-500">
                    <Kugiri text="書かなくても大丈夫です。番地は、確定のご連絡のときに伺います。" ato="、。" />
                  </span>
                  <input
                    className={ranStyle}
                    value={f.chou}
                    maxLength={30}
                    placeholder="例：今泉"
                    onChange={(e) => set('chou', e.target.value)}
                  />
                </label>
                <Erabu label="作業する場所の写真はありますか" list={SHASHIN} value={f.shashin} onChange={(v) => set('shashin', v)} />
                {f.shashin === 'ある' && (
                  <p className="mt-2 text-[13px] leading-[1.8] text-ink-500">写真は、予約のあとに LINE で送っていただけます。</p>
                )}
                <Erabu label="見積もりに、立ち会いはできますか" list={TACHIAI} value={f.tachiai} onChange={(v) => set('tachiai', v)} />
                <Erabu label="いつまでに終えたいですか" list={ITSUMADE} value={f.itsumade} onChange={(v) => set('itsumade', v)} />
                <Erabu label="車（軽トラック）を停める場所はありますか" list={CHUSHA} value={f.chusha} onChange={(v) => set('chusha', v)} />
                <label className="mt-6 block">
                  <span className="text-[15px] font-bold text-ink-900">ひとこと</span>
                  <span className="ml-2 text-[13px] text-ink-500">あれば（広さ・数・気になること など）</span>
                  <textarea
                    className={`${ranStyle} min-h-[112px] leading-[1.7]`}
                    value={f.hitokoto}
                    maxLength={500}
                    onChange={(e) => set('hitokoto', e.target.value)}
                  />
                </label>
                <div className="mt-7 grid gap-2">
                  <button type="button" className="btn btn-primary btn-lg w-full" disabled={!!tejun3Tarinai} onClick={() => susumu(3)}>
                    {tejun3Tarinai ? `「${tejun3Tarinai}」を選んでください` : '次へ'}
                    {!tejun3Tarinai && <ArrowRight size={17} aria-hidden="true" />}
                  </button>
                  <button type="button" className="btn btn-quiet mx-auto" onClick={() => susumu(1)}>
                    <ArrowLeft size={16} aria-hidden="true" />
                    日時を選び直す
                  </button>
                </div>
              </div>
            )}

            {/* 手順4 お名前と連絡の受け方 */}
            {tejun === 3 && (
              <div className="mt-5">
                <h2 className="text-[19px]">最後に、お名前と連絡の受け方</h2>
                <label className="mt-5 block">
                  <span className="text-[15px] font-bold text-ink-900">お名前</span>
                  <span className="ml-2 text-[13px] text-ink-500">名字だけでも大丈夫です</span>
                  <input className={ranStyle} value={f.namae} maxLength={40} autoComplete="name" onChange={(e) => set('namae', e.target.value)} />
                </label>

                <fieldset className="mt-6">
                  <legend className="text-[15px] font-bold text-ink-900">確定のご連絡は、どちらで受けますか</legend>
                  <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                    <Fuda on={f.renraku === 'line'} onClick={() => set('renraku', 'line')}>
                      LINE で受ける
                      <span className={`mt-0.5 block text-[13px] ${f.renraku === 'line' ? 'text-white/80' : 'text-ink-500'}`}>
                        送ったあとに、内容の入った LINE が開きます
                      </span>
                    </Fuda>
                    <Fuda on={f.renraku === 'denwa'} onClick={() => set('renraku', 'denwa')}>
                      電話で受ける
                      <span className={`mt-0.5 block text-[13px] ${f.renraku === 'denwa' ? 'text-white/80' : 'text-ink-500'}`}>
                        中元からお電話します
                      </span>
                    </Fuda>
                  </div>
                </fieldset>

                {f.renraku === 'denwa' && (
                  <label className="mt-5 block">
                    <span className="text-[15px] font-bold text-ink-900">電話番号</span>
                    <input
                      className={ranStyle}
                      value={f.denwa}
                      inputMode="tel"
                      type="tel"
                      autoComplete="tel"
                      maxLength={20}
                      placeholder="例：090-1234-5678"
                      onChange={(e) => set('denwa', e.target.value)}
                    />
                  </label>
                )}

                {/* 人には見えない欄（機械よけ）。画面の外に置き、読み上げにも出さない */}
                <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
                  <label>
                    この欄は空のままにしてください
                    <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
                  </label>
                </div>

                {/* 送る前の見直し */}
                <dl className="mt-7 rounded border border-hairline bg-canvas p-4 text-[14px] leading-[1.8]">
                  <div className="flex gap-3"><dt className="w-16 shrink-0 text-ink-500">日時</dt><dd className="text-ink-900">{hiLabel(f.hi)} {f.ji}〜{owari(f.ji)}</dd></div>
                  <div className="flex gap-3"><dt className="w-16 shrink-0 text-ink-500">作業</dt><dd className="text-ink-900"><Kugiri text={f.sagyou.join('、')} /></dd></div>
                  <div className="flex gap-3"><dt className="w-16 shrink-0 text-ink-500">場所</dt><dd className="text-ink-900">{f.chou ? `${f.shi} ${f.chou}` : f.shi}</dd></div>
                  <div className="flex gap-3"><dt className="w-16 shrink-0 text-ink-500">様子</dt><dd className="text-ink-900"><Kugiri text={`写真 ${f.shashin}・立ち会い ${f.tachiai}・${f.itsumade}・車 ${f.chusha}`} /></dd></div>
                </dl>

                {dame && <p className="mt-4 text-[14px] leading-[1.8] text-accent">{dame}</p>}
                <div className="mt-5 grid gap-2">
                  <button type="button" className="btn btn-accent btn-lg w-full" disabled={sending} onClick={okuruBotan}>
                    {sending ? '送っています…' : 'この内容で仮予約する'}
                  </button>
                  <p className="text-center text-[13px] leading-[1.8] text-ink-500">
                    <Kugiri text="送っただけでは確定しません。中元が確かめて、ご連絡します。" ato="、。" />
                  </p>
                  <button type="button" className="btn btn-quiet mx-auto" onClick={() => susumu(2)}>
                    <ArrowLeft size={16} aria-hidden="true" />
                    場所と様子を直す
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 済み */}
        {tejun === 4 && kekka && (
          <div className="card mt-8 p-5 sm:p-7">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-white">
              <Check size={20} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-[21px]">仮予約を受け付けました</h2>
            <p className="mt-2 text-[15px] leading-[1.9] text-ink-700">
              <span className="tabular-nums">番号 {kekka.bangou}</span>・{kekka.hiJi}
              <br />
              <Kugiri text={`まだ確定ではありません。中元が予定を確かめて、${kekka.renraku === 'line' ? 'LINE' : 'お電話'}で確定のご連絡をします。`} ato="、。" />
            </p>

            {kekka.renraku === 'line' ? (
              <div className="mt-6">
                <a href={kekka.lineUrl} className="btn btn-line btn-lg w-full">
                  <MessageCircle size={18} aria-hidden="true" />
                  LINE で送る（番号と内容が入ります）
                </a>
                <p className="mt-3 text-[14px] leading-[1.8] text-ink-600">
                  <Kugiri
                    text={`開いた LINE で、そのまま送信してください。確定のご連絡は、この LINE に届きます。${f.shashin === 'ある' ? '写真も、続けてこの LINE で送ってください。' : ''}`}
                    ato="、。"
                  />
                </p>
                <p className="mt-2 text-[13px] leading-[1.8] text-ink-500">
                  LINE が開かないときは、
                  <a href={LINE_SOUDAN} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    友だち追加
                  </a>
                  のあとに、<span className="whitespace-nowrap tabular-nums">番号 {kekka.bangou}</span> を送ってください。
                </p>
              </div>
            ) : (
              <p className="mt-6 text-[14px] leading-[1.8] text-ink-600">
                急ぎの方は {DENWA} へどうぞ。
              </p>
            )}

            <a href="/" className="btn btn-outline mt-6 w-full">
              ホームへ戻る
            </a>
          </div>
        )}
      </main>
    </div>
  );
};

export default Yoyaku;
