# 見積もり予約（フッ軽版） Implementation Plan

> **For agentic workers:** この回では CLAUDE.md の「書き直す作業そのものは分担しない」に従い、同じ回で順に進める（superpowers:executing-plans 相当）。Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** HP に `/yoyaku/`（見積もりの仮予約）を作り、管制で確定・お断りできるようにする。

**Architecture:** 管制アプリの Cloud Functions（codebase admin）に新しく2本（公開の `yoyaku`、管制だけの `yoyakuKotae`）。空き枠は Google カレンダーから計算し、仮予約はカレンダー・Firestore・中元さんの LINE に入れる。確定時のシートの行は、今ある `appendSheetJob` を管制の画面から呼ぶ。

**Tech Stack:** firebase-functions v1（Node 22・TypeScript）、googleapis calendar v3、Firestore、React 19＋Vite 5＋Tailwind（HP）、React＋Firebase JS SDK（管制）。

**Spec:** `docs/superpowers/specs/2026-11-19-mitsumori-yoyaku-design.md`

## Global Constraints

- 枠：明日〜28日後（日本時間）・毎日・始まり 8:00〜16:00 の毎時・長さ60分・予定の前後30分にかかる枠は出さない・終日の予定の日は丸ごと出さない
- 市の選択肢：富士市／富士宮市／静岡市／沼津市／そのほか
- 写真：ある／ない。立ち会い：できる／立ち会いなしで見てよい。いつまで：急ぎ（今週中）／今月中／決まっていない。駐車：ある／ない／分からない
- 連絡：line／denwa。denwa のときだけ電話番号が要る
- 上限：同じ送り元から1日3件・全体で1日10件
- カレンダーの題名に「フッ軽」「予約カレンダー」を入れない
- 確定でシートに入れる行のメモに「カレンダーから自動」を必ず含める
- LINE の ID：`@200rcmxs`（`%40200rcmxs`）。相談の LINE：`https://lin.ee/Bh5gFU6`。電話：`0545-78-3704`
- 関数は1本ずつ出す（`--only functions:admin:<名前>`）。出す前に中元さんに一言
- main に直接 push しない（HP）。共有の checkout の枝を替えない（worktree）
- 日本語で書く（コードの説明も）

---

### Task 1: 空き枠と入力の確かめ（純粋な関数）

**Files:**
- Create: `fukkaru-admin/functions/src/yoyaku/waku.ts`
- Test: `fukkaru-admin/tameshi/yoyaku-waku.cjs`

**Interfaces（Produces）:**
- `type Yotei = {start?: {date?: string|null; dateTime?: string|null}|null; end?: {...}|null; transparency?: string|null; status?: string|null}`
- `wakuNoHi(now: Date): string[]` … 明日〜28日後の `YYYY-MM-DD`（日本時間）
- `akiWaku(hi: string[], yotei: Yotei[], jou: string[]): Record<string, string[]>` … 日付→空いている始まり `"HH:MM"`。`jou` は錠の `"YYYY-MM-DDTHH:MM"`
- `yoyakuInput(body: unknown): {ok: true; v: YoyakuInput} | {ok: false; error: string}`
- `type YoyakuInput = {sagyou: string[]; hi: string; ji: string; shi: string; chou: string; shashin: string; tachiai: string; itsumade: string; chusha: string; hitokoto: string; namae: string; renraku: "line"|"denwa"; denwa: string}`
- `lineBun(v: YoyakuInput, bangou: string): string` … お客様が LINE で送る文
- `hiJi(hi: string, ji: string): string` … `11月22日(土) 10:00〜11:00`
- `wakuKey(hi, ji)` … `"2026-11-22T10:00"`、`wakuHani(hi, ji): {start: string; end: string}`（RFC3339 +09:00）

- [ ] tameshi に失敗する試しを書く（終日・前後30分・予定なし・キャンセル・日付またぎ・錠・入力の弾き）
- [ ] `npm --prefix functions run build` → `node --test tameshi/yoyaku-waku.cjs` が落ちるのを見る
- [ ] waku.ts を書く → 試しが全部通る
- [ ] コミット

### Task 2: 関数 `yoyaku`（公開）と `yoyakuKotae`（管制）

**Files:**
- Create: `fukkaru-admin/functions/src/yoyaku/index.ts`（`makeYoyaku(deps)` が `{yoyaku, yoyakuKotae}` を返す）
- Modify: `fukkaru-admin/functions/src/index.ts`（末尾で `makeYoyaku` を呼んで export）
- Modify: `fukkaru-admin/firestore.rules`（yoyaku は管制だけ読める・書けない、yoyakuWaku／yoyakuKazu は誰も触れない）
- Test: `fukkaru-admin/tameshi/yoyaku-kansuu.cjs`（偽のカレンダー・偽の db で GET／POST／確定／お断りを通す）

**Interfaces:**
- Consumes: Task 1 の全部。index.ts の `db`・`requireAdmin`・`CALENDAR_ID`・`enqueueAdminLineNotification`・`sendOpsPush`・`allPushTokens`
- Produces（HTTP）:
  - `GET /yoyaku` → `{hi: string[], aki: Record<string,string[]>}`
  - `POST /yoyaku`（JSON の YoyakuInput＋隠し欄 `hp`）→ `{ok: true, bangou, hiJi, lineUrl}` か `{ok: false, error, kind}`（kind: input／ume／ooi／shippai）
- Produces（callable `yoyakuKotae`）: `{id, kotae: "kakutei"|"kotowari"}` → kakutei は `{ok, hi, ji, row: {date, workDate, time, name, phone, address, content, memo, type, status}}`

- [ ] 偽の部品で試しを書く → 落ちるのを見る → 書く → 通る
- [ ] lineWebhook など既存の関数の行を1行も変えていないことを `git diff` で見る
- [ ] コミット

### Task 3: 管制の札

**Files:**
- Create: `fukkaru-admin/src/components/YoyakuFuda.tsx`
- Modify: `fukkaru-admin/src/components/ControlRoom.tsx`（yoyaku の kari を読む・banKazu に足す・札を並べる）
- Modify: `fukkaru-admin/src/lib/guide.ts`（手引きに1行）

- [ ] 札：日時・市・作業・様子・お名前・連絡（電話は tel: のリンク）・ひとこと。ボタン「確定にする」「お断り」。確定は yoyakuKotae → appendSheetJob の順。結果を札の中に出す（alert は使わない）
- [ ] `npm run build`（tsc）が通る
- [ ] コミット

### Task 4: HP の `/yoyaku/` とトップの欄

**Files:**
- Create: `fukkaru-landing/yoyaku/index.html`、`src/yoyaku/main.tsx`、`src/yoyaku/Yoyaku.tsx`、`src/yoyaku/api.ts`
- Modify: `vite.config.ts`（SSR でないときだけ入口を2つ）、`components/Services.tsx`（`export const groups` だけ）、`components/Reservation.tsx`（文とボタンの行き先）

- [ ] 画面を書く。`npm run build` が通り、`dist/yoyaku/index.html` ができ、トップの組み立て（prerender）が今までどおり
- [ ] 本番のトップと文字を比べ、予約の欄以外が変わっていないこと
- [ ] コミット

### Task 5: 出して確かめる

- [ ] 中元さんに一言 → `firebase deploy --only functions:admin:yoyaku` → `functions:admin:yoyakuKotae` → firestore.rules
- [ ] lineWebhook が401のまま（壊れていない）
- [ ] HP の PR → 仮ページで WebKit 375・428 を撮る（`/web-naoshi` の `toru.cjs --kurabe`）
- [ ] 試しの予約1件 → 中元さんの LINE・カレンダー・札 → お断り／確定（シートの行は書く前に戻す）→ 後片付け
- [ ] 管制の画面を出す（`firebase deploy --only hosting:fukkaru-admin`）前に一言
- [ ] 中元さんに iPhone で見ていただく → OK でマージ → `honban.py`・`/yoyaku/` の中身を数える
