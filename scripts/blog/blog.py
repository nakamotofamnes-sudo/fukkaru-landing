#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ホームページのブログ記事を書いて、確認用のPRまで作る。

なぜ main に直接入れないのか
---------------------------
`main` に push すると GitHub Actions がそのまま本番へ出してしまう。
記事は会社の信用に直結するので、**人が読んでからマージする**という取り決めがある。
このスクリプトはブランチを切ってPRを作るところで止まる。プレビューは自動で当たるので、
中元さんはPRのプレビューURLで仕上がりを見てからマージできる。

数字について
-----------
実績の件数や金額は、AIに作らせると平気で嘘を書く。
なのでこのスクリプトは**具体的な数値を書かせない**。実績値を入れたい記事は、
人が後からPRに追記する。

使い方
------
    python3 ~/.fukkaru/blog.py            # 記事を1本書いてPRを作る
    FUKKARU_BLOG_MODE=dry python3 ~/.fukkaru/blog.py   # 保存だけ。gitには触らない
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import date, datetime
from pathlib import Path

HOME = Path.home()
# 2026-09-01：~/Downloads から移した。
# `git -C <dir>` は**そのフォルダに移動してから現在地を読む**ので、
# リポジトリが Downloads（macOSの保護対象）にある限り、launchd から走ると必ず
# 「Unable to read current working directory: Operation not permitted」で落ちる。
# 呼び出し側の居場所を変えても直らない。**置き場所そのものを外に出すしかない。**
# GitHub Actions の中では、リポジトリそのものが作業場所になる（2026-09-02）
REPO = Path(os.environ.get("FUKKARU_REPO") or (HOME / "fukkaru-landing"))
ARTICLES = REPO / "content" / "articles"
STATE_BASE = Path(os.environ.get("FUKKARU_STATE") or (HOME / "fukkaru" / "blog"))
LOGF = STATE_BASE / "_ログ.txt"

KEY = os.environ.get("GEMINI_API_KEY", "").strip()
GH_PAT = os.environ.get("GH_PAT", "").strip()
GH_OWNER, GH_REPO = "nakamotofamnes-sudo", "fukkaru-landing"
TEXT_MODELS = [os.environ.get("GEMINI_TEXT_MODEL", ""),
               "gemini-3-pro-preview", "gemini-2.5-pro", "gemini-2.5-flash"]
MODE = (os.environ.get("FUKKARU_BLOG_MODE") or "on").strip()
# 5分おきの巡回から呼ばれるので、1日1本だけ書くように自分で歯止めをかける
HOUR = int(os.environ.get("FUKKARU_BLOG_HOUR") or 10)
STATEDIR = STATE_BASE

BLOCK_TYPES = {"lead", "h2", "h3", "p", "ul", "ol", "table", "note", "faq", "cta"}

# 検索で拾いたい「サービス × 地域」の組み合わせ。
# 記事が少ないサービスから順に埋めていくので、偏らずに面を取れる。
# 2026-09-02、中元さんの実感で「水まわりの軽作業」「掃除」を外した。
# 仕事が来ていない語に記事を割くと、本命に積み上がらないため
SERVICES = [
    "家具組立", "物置組立", "草刈り", "庭まわり",
    "家具解体", "物置移設", "引越しの手伝い", "不用品の運搬",
]
AREAS = ["富士市", "富士宮市", "沼津市", "静岡市", "三島市", "御殿場市", "裾野市", "清水町"]
MIN_BODY = 1500          # これより短い記事は検索で戦えないので作り直す

FACTS = """
・会社名：フッ軽合同会社（静岡県富士市の便利屋）
・対応エリア：静岡県全域、山梨県全域、神奈川県海老名市以西
・代表がひとりで対応している
・公式LINE：https://lin.ee/qXlO1gC（登録＋成約で最大3,000円割引）
・扱う仕事：家具の組立/解体、物置の組立/移設、草刈り、掃除、庭まわり、
  水まわりの軽作業、荷物の運搬、その他の困りごと全般
・持っている許認可：**古物商許可**と**貨物軽自動車運送事業（軽貨物）の届出**のみ
・持っていない許認可：**一般廃棄物収集運搬業の許可は持っていない（取得できない）**
【運搬（軽貨物）】お見積りにご納得いただければ、内容・距離を問わずお運びできる。
【買取・引き取り（古物商）】まだ使えるものは買い取り・引き取りができる。
【引き取れないもの】生ごみを含む家庭ごみ／ビン・缶・ペットボトルなどの資源ごみ／
  古い・状態の悪い家電／解体扱いの家具（破損・腐敗・劣化）／木屑（DIY品・木箱を含む）／
  著しく経年劣化した物／すべての液体（油・ペンキ・塗料・洗剤など）／
  汚物・排泄物・血液の付いたもの・動物の死骸・悪臭のあるもの／
  土・ブロック・レンガ・石・コンクリート・生木・観葉植物など／
  ガラス・蛍光灯・破損した鏡など／産業廃棄物／注射器・針・メスなどの医療機器
  （これらは「自治体での出し方をご案内します」と書く。「相談可」を売り文句にしない）
"""

RULES = """
守ること
1. **具体的な数値を書かない。** 「〇〇件」「中央値〇円」「〇%」などの実績値・統計は
   いっさい書かない。料金は「〇円〜」のような相場観も書かない。**数字を出さずに書く。**
   （実績の数字は、人があとから追記する）
   ただし公式LINEの「最大3,000円割引」だけは会社の事実なので書いてよい。
2. 嘘を書かない。受賞・提携があるとは書かない。
   許認可は**古物商と軽貨物だけ**。それ以外を持っているとは書かない。
2-2. **ごみの処分を請け負うとは書かない。**
   一般廃棄物収集運搬業の許可が無いので、家庭から出た不用品・粗大ごみを
   有償で引き取って処分する、という書き方は法律上できない。
   書いてよいのは次の範囲だけ：
   ・**古物商として、まだ使えるものを買い取る／引き取る**
   ・**軽貨物として、お客様の荷物を指定の場所（自治体の受付施設など）へ運ぶ**
   ・自治体への出し方を**案内する**
   「処分します」「引き取って捨てます」「回収します」は書かない。
   「運搬のお手伝い」「買取」「出し方のご案内」と書く。
   **他社の「無許可」「悪質」に触れた直後に自社を並べて書かない。**
   自社が許可を持っているかのように読める書き方は、遠回しでも禁止。
   廃棄物の収集運搬・古物の買取など許認可が要る話題では、
   「許可のある業者かを確認しましょう」と読者に案内するにとどめ、
   自社がその許可を持っているとも持っていないとも書かない。
3. お客様の氏名・電話・番地は書かない。地域は市区町村まで。
4. 「です・ます」で、はじめての人が読んで分かる言葉で書く。
5. 宣伝一色にしない。読んだ人が1つ得をする実用的な知識を必ず入れる。
6. 他社の悪口を書かない。メーカー名は一般的な言及にとどめる。
"""


def log(msg: str) -> None:
    LOGF.parent.mkdir(parents=True, exist_ok=True)
    line = "[%s] %s" % (date.today().strftime("%Y-%m-%d"), msg)
    print(line)
    with LOGF.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def gen_text(prompt: str) -> str:
    """Gemini でテキストを作る。モデルが使えなければ次の候補を試す。"""
    body = {"contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.9, "maxOutputTokens": 24576}}
    last = ""
    for model in TEXT_MODELS:
        if not model:
            continue
        url = ("https://generativelanguage.googleapis.com/v1beta/models/"
               f"{model}:generateContent")
        req = urllib.request.Request(
            url, data=json.dumps(body).encode("utf-8"),
            headers={"x-goog-api-key": KEY, "Content-Type": "application/json"},
            method="POST")
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                payload = json.loads(r.read().decode("utf-8"))
            parts = payload["candidates"][0]["content"]["parts"]
            text = "".join(p.get("text", "") for p in parts).strip()
            if text:
                return text
            last = f"{model} -> 応答にテキストなし"
        except urllib.error.HTTPError as e:
            last = f"{model} -> {e.code}: {e.read().decode('utf-8', 'replace')[:200]}"
        except Exception as e:
            last = f"{model} -> {e}"
    raise RuntimeError(last or "テキストを作れませんでした")


def extract_json(s: str) -> dict:
    """```json ...``` で囲まれていても中身を取り出す。"""
    s = s.strip()
    m = re.search(r"```(?:json)?\s*(.+?)\s*```", s, re.S)
    if m:
        s = m.group(1)
    start, end = s.find("{"), s.rfind("}")
    if start < 0 or end < 0:
        raise ValueError("JSONが見つかりません：" + s[:200])
    return json.loads(s[start:end + 1])


def existing() -> list[dict]:
    out = []
    for f in sorted(ARTICLES.glob("*.json")):
        try:
            out.append(json.loads(f.read_text(encoding="utf-8")))
        except Exception:
            pass
    return out


TARGETS = Path(os.environ.get("FUKKARU_TARGETS") or (HOME / ".fukkaru" / "狙い.txt"))
CURSOR = Path(os.environ.get("FUKKARU_CURSOR") or (HOME / ".fukkaru" / "狙い_いまの位置.txt"))


def read_targets() -> list[tuple[str, str]]:
    """狙いの一覧（`~/.fukkaru/狙い.txt`）を読む。無ければ空を返す"""
    if not TARGETS.exists():
        return []
    out: list[tuple[str, str]] = []
    for line in TARGETS.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        svc, _, area = line.partition(":")
        svc, area = svc.strip(), area.strip()
        if svc and area:
            out.append((svc, area))
    return out


def advance_target() -> None:
    """記事が1本できたときだけ、狙いを次へ進める"""
    targets = read_targets()
    if not targets:
        return
    try:
        i = int(CURSOR.read_text(encoding="utf-8").strip())
    except (OSError, ValueError):
        i = 0
    try:
        CURSOR.parent.mkdir(parents=True, exist_ok=True)
        CURSOR.write_text(str((i + 1) % len(targets)) + "\n", encoding="utf-8")
    except OSError:
        pass          # 覚えられなくても、書けたこと自体は変わらない


def pick_target(done: list[dict]) -> tuple[str, str]:
    """次に書く狙いを決める。

    **1位を狙うなら、薄く広げてはいけない。**
    以前は「いちばん記事が薄いサービス×地域」を選んでいたので、
    10サービス×8地域＝80通りに1日1本ずつ配られ、どこにも積み上がらなかった
    （2026-09-02、家具組立の記事が4本あるのに検索表示がゼロだった）。

    いまは `~/.fukkaru/狙い.txt` を上から順にまわる。
    同じ行を何度も書けば、そこに記事が集まる。中元さんが自分で変えられる。
    """
    # 環境変数で1回だけ上書きできる（例：FUKKARU_BLOG_TARGET="不用品の運搬:富士市"）
    want = (os.environ.get("FUKKARU_BLOG_TARGET") or "").strip()
    if want:
        parts = want.split(":", 1)
        return parts[0].strip(), (parts[1].strip() if len(parts) > 1 else AREAS[0])

    targets = read_targets()
    if targets:
        # 既存の記事数から数えると、狙いの途中から始まってしまう。
        # どこまで進んだかは自分で覚えておく（1行の数字だけのファイル）
        try:
            i = int(CURSOR.read_text(encoding="utf-8").strip())
        except (OSError, ValueError):
            i = 0
        # **進めるのは記事が書けたあと**（advance_target）。
        # ここで進めると、失敗した日に狙いが1つ飛ぶ（2026-09-02に実際に飛んだ）
        return targets[i % len(targets)]

    # 一覧が無いときだけ、昔どおり薄いところを選ぶ
    blob = json.dumps(done, ensure_ascii=False)
    service = min(SERVICES, key=lambda w: (blob.count(w), SERVICES.index(w)))
    area = min(AREAS, key=lambda w: (blob.count(w), AREAS.index(w)))
    return service, area


def build_prompt(done: list[dict], service: str, area: str,
                 ng: list[str] | None = None) -> str:
    written = "\n".join(
        "  ・%s（slug: %s／分類: %s）" % (a.get("title", ""), a.get("slug", ""),
                                    a.get("category", ""))
        for a in done) or "  ・（まだ1本もありません）"
    return f"""あなたは静岡県富士市の便利屋「フッ軽合同会社」のホームページの記事を書く人です。
検索から来た人が読んで役に立ち、そのまま相談したくなる記事を1本書いてください。

**今回の狙い：「{service}」×「{area}」で検索する人に届く記事。**
タイトル・説明文・見出し・本文に、この2語とその言い換えを自然に入れてください。
ただし詰め込みすぎて読みにくくしないこと。読みやすさが最優先です。

会社の前提：
{FACTS}
{RULES}

すでに書いた記事（**同じテーマは避けてください**）：
{written}

記事の作り：
・検索されそうな悩みを1つ選び、その答えを最後まで書ききる
・見出し（h2）は4〜6個。h2には英数字の id を必ず付ける
・全体で2000〜3500字くらい
・表（table）・箇条書き（ul か ol）・注記（note）・よくある質問（faq）を最低1つずつ入れる
・最後に cta を1つ置く

次のJSONだけを返してください。前置きも説明も要りません。

{{
  "slug": "英小文字と数字とハイフンだけ。内容が分かるもの。地名を入れる",
  "title": "検索結果に出る見出し。30〜45字。地名を入れる",
  "metaDescription": "検索結果の説明文。80〜120字",
  "keywords": ["検索語を4〜6個。地名つきのものを必ず含める"],
  "category": "家具組立／物置／草刈り／不用品処分／掃除／庭まわり などから1つ",
  "blocks": [
    {{"type": "lead", "text": "導入。読者の困りごとを言い当てて、この記事で分かることを示す。150〜250字"}},
    {{"type": "h2", "id": "英数字のid", "text": "見出し"}},
    {{"type": "p", "text": "本文の段落"}},
    {{"type": "h3", "text": "小見出し"}},
    {{"type": "ul", "items": ["箇条書き。**強調**が使えます"]}},
    {{"type": "ol", "items": ["手順の箇条書き"]}},
    {{"type": "table", "headers": ["列1", "列2"], "rows": [["値", "値"]]}},
    {{"type": "note", "title": "注記の見出し", "text": "気をつけたいことなど。数値は書かない"}},
    {{"type": "faq", "items": [{{"q": "質問", "a": "答え"}}]}},
    {{"type": "cta", "heading": "締めの見出し", "sub": "ひと押しの一文"}}
  ]
}}""" + retry_note(ng)


def retry_note(ng: list[str] | None) -> str:
    """やり直しのとき、何で弾かれたかを伝える。

    これが無いと同じ指示を投げ直すことになり、同じ間違いを繰り返して
    その日の記事がゼロになる。実際に起きた。
    """
    if not ng:
        return ""
    items = "\n".join("  ・%s" % x for x in ng)
    return f"""

────────────────────────
**前に書いたものは、次の理由で出せませんでした。ここを直してください。**
{items}

同じ間違いを繰り返さないこと。とくに：
・数値で弾かれたなら、その数字を**文章から消して**書き直す
  （「約3割の人が」→「多くの人が」のように、量は言葉で表す）
・ごみの処分を請け負う書き方で弾かれたなら、「運搬」「買取」「出し方の案内」に言い換える
・ブロックが足りないと言われたなら、指定された種類を必ず入れる
・本文が短いと言われたなら、内容を足して長くする（同じことの繰り返しで水増ししない）
────────────────────────"""


NUM = re.compile(r"\d[\d,]*\s*(?:円|件|%|％|人|台|年連続|割)")
# 会社の事実として確定している数値だけは書いてよい（公式LINEの割引額など）
KNOWN_NUMBERS = {"3,000円", "3000円"}


def check(art: dict, done: list[dict]) -> list[str]:
    """出せる形になっているか調べる。戻り値は問題点の一覧（空なら合格）。"""
    ng = []
    for k in ("slug", "title", "metaDescription", "keywords", "category", "blocks"):
        if not art.get(k):
            ng.append("%s がありません" % k)
    slug = str(art.get("slug", ""))
    if not re.fullmatch(r"[a-z0-9-]+", slug):
        ng.append("slug に使えない文字があります：%s" % slug)
    if slug in {a.get("slug") for a in done}:
        ng.append("slug が既存記事と同じです：%s" % slug)
    if (ARTICLES / f"{slug}.json").exists():
        ng.append("同じ名前のファイルが既にあります：%s.json" % slug)

    blocks = art.get("blocks") or []
    types = {b.get("type") for b in blocks if isinstance(b, dict)}
    unknown = types - BLOCK_TYPES
    if unknown:
        ng.append("使えない種類のブロックがあります：%s" % ", ".join(sorted(map(str, unknown))))
    for need in ("lead", "h2", "p", "cta"):
        if need not in types:
            ng.append("%s ブロックがありません" % need)
    for b in blocks:
        if isinstance(b, dict) and b.get("type") == "h2" and not b.get("id"):
            ng.append("h2 に id が付いていません：%s" % b.get("text", "")[:20])

    body = "".join((b.get("text") or "") for b in blocks if isinstance(b, dict))
    if len(body) < MIN_BODY:
        ng.append("本文が短すぎます（%d字／最低%d字）" % (len(body), MIN_BODY))

    # 廃棄物の許可が無いのに「処分を請け負う」と読める書き方をさせない
    whole = json.dumps(art, ensure_ascii=False)
    for w in ("不用品回収", "粗大ごみを処分", "粗大ゴミを処分", "ごみを引き取",
              "ゴミを引き取", "処分いたします", "処分します", "回収いたします"):
        if w in whole:
            ng.append("ごみの処分を請け負う書き方です（一般廃棄物の許可が無い）：%s" % w)

    # 許認可の誤認よけ。「無許可の業者」の話のすぐ後に自社名を出させない
    for b in blocks:
        if not isinstance(b, dict):
            continue
        t = (b.get("text") or "") + (b.get("title") or "")
        if ("無許可" in t or "許可を得ず" in t) and "フッ軽" in t:
            ng.append("無許可業者の話と自社の宣伝が同じ塊にあります（許可の誤認を招く）")

    # 数字の捏造よけ。実績値を書かせない約束なので、見つけたら止める
    found = {m.group(0) for m in NUM.finditer(json.dumps(art, ensure_ascii=False))}
    hits = sorted(h for h in found if h.replace(" ", "") not in KNOWN_NUMBERS)
    if hits:
        ng.append("数値が書かれています（実績の捏造を避けるため禁止）：%s" % ", ".join(hits[:6]))
    return ng


# gitは -C でリポジトリを指しても、動き出す前に自分の居場所を一度読む。
# launchd から走ると居場所が読めない場所のことがあり、
# 「Unable to read current working directory: Operation not permitted」で落ちる。
# 居場所をリポジトリ自身に固定しておく。
def git(*args: str) -> str:
    r = subprocess.run(["git", "-C", str(REPO), *args],
                       capture_output=True, text=True, cwd=str(REPO))
    if r.returncode != 0:
        raise RuntimeError("git %s -> %s" % (" ".join(args), r.stderr.strip()[:300]))
    return r.stdout.strip()


def git_ok(*args: str) -> bool:
    """成否だけ知りたいとき（失敗しても例外にしない）"""
    return subprocess.run(["git", "-C", str(REPO), *args],
                          capture_output=True, text=True,
                          cwd=str(REPO)).returncode == 0


def gh_api(path: str, data: dict | None = None, method: str = "GET") -> dict:
    req = urllib.request.Request(
        "https://api.github.com/repos/%s/%s%s" % (GH_OWNER, GH_REPO, path),
        data=json.dumps(data).encode("utf-8") if data else None,
        method=method,
        headers={"Authorization": "Bearer " + GH_PAT,
                 "Accept": "application/vnd.github+json",
                 "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


# 中元さんの指示（2026-09-02）で、待たずに公開するようにした。
# 「あとからいつか見ればいい」ので、**PRは残したまま自動でマージする**。
# 直接 main に push はしない（記録が残らず、戻せなくなるため）。
# 止めたいときは環境変数 FUKKARU_BLOG_AUTOMERGE=0
AUTOMERGE = (os.environ.get("FUKKARU_BLOG_AUTOMERGE") or "1").strip() != "0"


def open_pr(branch: str, art: dict) -> tuple[str, bool, int]:
    """そのブランチのPRが既にあれば使い回す。無ければ作る。番号も返す"""
    found = gh_api("/pulls?state=open&head=%s:%s" % (GH_OWNER, branch))
    if isinstance(found, list) and found:
        return found[0]["html_url"], False, int(found[0]["number"])
    made = gh_api("/pulls", {
        "title": "ブログ記事（%s ぶん）" % branch.split("-")[-1],
        "head": branch, "base": "main",
        "body": ("Macが自動で書いた記事です。**自動でマージして公開します。**\n\n"
                 "- 中元さんが待つ必要はありません。あとから見返すための記録として残しています\n"
                 "- 直したいところがあれば、公開後にこのPRの中身を見て、別のPRで直せます\n"
                 "- 実績の数字は自動生成では書かない約束です\n"),
    }, method="POST")
    return made["html_url"], True, int(made["number"])


def merge_pr(num: int) -> None:
    """記事のPRをそのまま取り込む。失敗しても記事は残るので、次の日も試せる"""
    gh_api("/pulls/%d/merge" % num,
           {"merge_method": "squash",
            "commit_title": "ブログ記事を追加（自動）"},
           method="PUT")


def main() -> int:
    if not KEY:
        log("✗ GEMINI_API_KEY がありません")
        return 1
    if not REPO.exists():
        log("✗ リポジトリが見つかりません：%s" % REPO)
        return 1

    from datetime import datetime
    state_f = STATEDIR / ("state-%s.json" % date.today().isoformat())
    # 管制画面から「もう1本書く」と注文されたときだけ、1日1本の歯止めを外す。
    # 自動の巡回では外さない（勝手に何本も書かせないため）
    forced = (os.environ.get("FUKKARU_BLOG_FORCE") or "").strip() == "1"
    if MODE != "dry" and not forced:
        if state_f.exists():
            return 0                      # 今日はもう書いた。静かに終わる
        if datetime.now().hour < HOUR:
            return 0                      # まだ時間じゃない

    # **記事を書く前に main を最新にする。**
    # 記事の一覧は Mac の中のファイルから数えているので、引っ張る前に数えると
    # 「まだ書いていない」と勘違いして同じ記事をもう1本書き、そのあとの
    # git pull が「未追跡のファイルを上書きすることになる」と言って止まる
    # （2026-09-02に実際に起きた。numazu-niwamawari-teire-benriya が重複した）
    if MODE != "dry":
        try:
            git("checkout", "main")
            git("pull", "--ff-only", "origin", "main")
        except Exception as e:
            log("✗ 最新の記事を取ってこられませんでした：%s" % e)
            log("  同じ記事を二重に書くおそれがあるので、今回は書きません")
            return 1

    done = existing()
    service, area = pick_target(done)
    log("▶ 記事を1本書きます（既存 %d本／狙い：%s × %s）" % (len(done), service, area))

    art = None
    last_ng: list[str] | None = None
    for attempt in range(1, 5):
        try:
            art = extract_json(gen_text(build_prompt(done, service, area, last_ng)))
        except Exception as e:
            log("  ・%d回目：作れませんでした（%s）" % (attempt, e))
            last_ng = ["JSONの形が壊れていました。指定した形のJSONだけを返すこと（説明文や```は付けない）"]
            continue
        ng = check(art, done)
        if not ng:
            break
        log("  ・%d回目：やり直します → %s" % (attempt, " / ".join(ng[:3])))
        last_ng = ng          # 次の回に、弾かれた理由を伝える
        art = None
    if art is None:
        log("✗ 4回試しましたが、出せる形になりませんでした")
        return 1

    today = date.today().isoformat()
    if MODE != "dry":
        state_f.parent.mkdir(parents=True, exist_ok=True)
        state_f.write_text(json.dumps({"date": today, "slug": art.get("slug", "")},
                                      ensure_ascii=False), encoding="utf-8")
    art.setdefault("publishDate", today)
    art.setdefault("updatedDate", today)

    # トップ画像。SNSに貼ったときに絵が出るよう、記事ごとに1枚焼く
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "heroimg", os.environ.get("FUKKARU_HEROIMG") or str(Path.home() / ".fukkaru" / "heroimg.py"))
        hero = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(hero)

        slug = art["slug"]
        himg = REPO / "public" / "blog" / ("%s.jpg" % slug)
        bg = Path("/tmp/fukkaru-hero-bg.jpg")
        got_bg = hero.gen_background(
            "%s %s" % (art.get("category", ""), service), bg)
        hero.make_hero(himg, art["title"], art.get("category", ""),
                       bg if got_bg else None)
        # 題つきの1枚はSNS用（og:image）、題なしの1枚は記事ページの見出しの背景用。
        # 同じ絵を両方に使うと、ページ上で題が二重に見えてしまう。
        art["ogImage"] = "/blog/%s.jpg" % slug
        art["heroImage"] = "/blog/%s-bg.jpg" % slug
        log("  ・トップ画像を作りました（背景は%s）"
            % ("実写風" if got_bg else "無地"))
        bg.unlink(missing_ok=True)
    except Exception as e:
        log("  ・トップ画像は作れませんでした（記事はそのまま出します）: %s" % e)
    dest = ARTICLES / ("%s.json" % art["slug"])
    dest.write_text(json.dumps(art, ensure_ascii=False, indent=2) + "\n",
                    encoding="utf-8")
    log("  ・書きました：%s（%s）" % (dest.name, art["title"]))
    advance_target()          # 書けたので、狙いを次へ

    if MODE == "dry":
        log("✓ dryモードなので、gitには触りません")
        return 0

    # 1本ごとに新しい枝を作る（2026-09-02）。
    #
    # 以前は月ごとに1本の枝へ積んでいた。毎日マージを待つ前提だったので、
    # ひと月ぶんをまとめて見られるようにするためだった。
    # いまは書いたその場で自動マージするので、積む意味がない。
    # そして**残っている枝へ切り替えると、書いたばかりの記事とぶつかって落ちる**
    # （2026-09-02、GitHub Actions で実際に落ちた）。
    # 現在地から枝を作れば作業中のファイルはそのまま残るので、ぶつからない。
    branch = "blog/auto-%s" % datetime.now().strftime("%Y%m%d-%H%M%S")
    rel = str(dest.relative_to(REPO))
    force = False
    try:
        # main は記事を書く前に最新にしてある（上の「書く前に」を参照）
        git("checkout", "-b", branch)
        # 前に失敗して置き去りになった記事があれば、これも一緒に拾う
        git("add", "content/articles")
        git("add", "public/blog")
        # 狙いの位置がリポジトリの中にあるなら（GitHub Actions で走るとき）、
        # 記事と一緒に残す。そうしないと毎回1番目に戻ってしまう
        for extra in (CURSOR, LOGF):
            # 狙いの位置と記録。リポジトリの中にあるなら（GitHub Actions で走るとき）、
            # 記事と一緒に残す。そうしないと次回まっさらに戻り、
            # 管制画面からもブログの様子が見えなくなる
            try:
                git("add", str(extra.relative_to(REPO)))
            except (ValueError, RuntimeError, subprocess.CalledProcessError):
                pass      # Mac のときは REPO の外にあるので、そのままでよい
        # ✓ の行はここで書く。**コミットより後に書いた行は記事と一緒に残らない**ので、
        # 管制画面から見ると「途中で終わった」ように見えてしまう
        # （2026-09-02、それで ブログ が unknown のままになった）
        log("✓ 記事ができました：%s" % art["title"])
        try:
            git("add", str(LOGF.relative_to(REPO)))
        except (ValueError, RuntimeError, subprocess.CalledProcessError):
            pass
        git("commit", "-m", "ブログ記事：%s" % art["title"])
        if force:
            # 中身がmainに入りきっている枝の置き換えなので、失うものは無い
            git("push", "-u", "--force-with-lease", "origin", branch)
        else:
            git("push", "-u", "origin", branch)
        url, created, num = open_pr(branch, art)
        git("checkout", "main")          # 作業ツリーを元に戻しておく
        log("✓ %s：%s" % ("PRを作りました" if created else "既存のPRに積みました", url))
        if not AUTOMERGE:
            log("  （自動マージを止めてあります。マージするまで公開されません）")
        else:
            try:
                merge_pr(num)
                log("  ・取り込みました。数分でホームページに出ます")
                log("    https://fukkaru.creo-sumai.jp/blog/%s/" % art["slug"])
            except Exception as e:
                log("  ・取り込めませんでした：%s" % e)
                log("    記事はPRに残っています。手でマージしてください：%s" % url)
    except Exception as e:
        log("✗ gitのところで失敗しました：%s" % e)
        log("  記事のファイルは %s に残っています" % dest)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
