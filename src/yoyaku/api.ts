// 見積もり予約の受け口（管制アプリの Cloud Functions「yoyaku」。2026-11-19）
// 中身は ~/Downloads/fukkaru-admin/functions/src/yoyaku/ 。決まり（枠・選択肢）もそちらが本物で、
// ここの選択肢の言葉は、そちらの waku.ts と一字一句そろえる（違うと受け付けられない）。

export const YOYAKU_URL = 'https://asia-northeast1-fukkaru-app.cloudfunctions.net/yoyaku';

export const DENWA = '0545-78-3704';
export const LINE_SOUDAN = 'https://lin.ee/Bh5gFU6';

export const SHI = ['富士市', '富士宮市', '静岡市', '沼津市', 'そのほか'] as const;
export const SHASHIN = ['ある', 'ない'] as const;
export const TACHIAI = ['できる', '立ち会いなしで見てよい'] as const;
export const ITSUMADE = ['急ぎ（今週中）', '今月中', '決まっていない'] as const;
export const CHUSHA = ['ある', 'ない', '分からない'] as const;

export type Aki = { hi: string[]; aki: Record<string, string[]> };

export type Okuru = {
  sagyou: string[];
  hi: string;
  ji: string;
  shi: string;
  chou: string;
  shashin: string;
  tachiai: string;
  itsumade: string;
  chusha: string;
  hitokoto: string;
  namae: string;
  renraku: 'line' | 'denwa';
  denwa: string;
  hp: string; // 人には見えない欄（機械よけ）
};

export type Kekka =
  | { ok: true; bangou: string; hiJi: string; renraku: 'line' | 'denwa'; lineUrl: string }
  | { ok: false; kind: 'input' | 'ume' | 'ooi' | 'shippai'; error: string };

const TSUUSHIN_DAME = 'つながりませんでした。電波のよいところで、もう一度お試しください。急ぎの方はお電話かLINEで。';

// 手元で画面だけ確かめるとき（npm run dev で ?mock を付ける）。本番のファイルには入らない
const mock = import.meta.env.DEV && typeof location !== 'undefined' && location.search.includes('mock');
const mockAki = (): Aki => {
  const hi: string[] = [];
  const aki: Record<string, string[]> = {};
  const base = Date.now() + 9 * 3600 * 1000;
  for (let i = 1; i <= 28; i++) {
    const d = new Date(base + i * 86400000).toISOString().slice(0, 10);
    hi.push(d);
    const all = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
    aki[d] = i % 7 === 3 ? [] : all.filter((_, j) => (i + j) % 4 !== 0);
  }
  return { hi, aki };
};

export const akiWoYomu = async (): Promise<Aki> => {
  if (mock) return mockAki();
  const res = await fetch(YOYAKU_URL, { method: 'GET', cache: 'no-store' });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.ok) throw new Error(body?.error || TSUUSHIN_DAME);
  return { hi: body.hi, aki: body.aki };
};

export const okuru = async (o: Okuru): Promise<Kekka> => {
  if (mock) {
    return { ok: true, bangou: '4831', hiJi: `${o.hi} ${o.ji}〜`, renraku: o.renraku, lineUrl: 'https://line.me/R/oaMessage/%40200rcmxs/?mock' };
  }
  try {
    const res = await fetch(YOYAKU_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(o),
    });
    const body = await res.json().catch(() => null);
    if (body && typeof body.ok === 'boolean') return body as Kekka;
    return { ok: false, kind: 'shippai', error: TSUUSHIN_DAME };
  } catch {
    return { ok: false, kind: 'shippai', error: TSUUSHIN_DAME };
  }
};
