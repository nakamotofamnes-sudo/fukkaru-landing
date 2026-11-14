#!/usr/bin/env python3
"""HP制作の記事（/web/ の下）を1本書く道具（2026-11-15〜）。

中元さんの決定（2026-11-14）：冬の仕事のホームページ制作を増やすため、HP制作の記事を自動で書く。
  ・毎日1本（11時）。文章だけ（絵は作らない。トップ画像は /web/share.jpg を使い回す）
  ・読む人は、便利屋に限らず、小さなお店・職人・個人事業主まで。全国から相談を受けてよい
  ・フッ軽本体のブログ（content/articles・blog.yml）は触らない

流れ：
  1. scripts/web/狙い.txt の上から、まだ書いていない言葉を1つ選ぶ（書き終わり＝content/web/*.json の nerai、
     または開いているPRの題の「（狙い：…）」）。**尽きたら書かずに止まる**（似た記事を量産しない）
  2. Gemini で書く（blog.py の gen_text をそのまま使う）。渡す事実は、1本目の記事（public/web/benriya-homepage.html）にある範囲だけ
  3. **AIが書いてはいけない文は、こちらで文ごと消す**（CLAUDE.md 17「言って聞かせるより直す」）：
     料金・納期・実績の数字・成果の約束・許認可（フッ軽がごみを回収/処分すると読める文）・作り話のお客様・連絡先
     消した文は、PRの説明に全部書き出す（人が読んで確かめられるように）。消しすぎて短くなったら書き直す
  4. content/web/<slug>.json に書いて、枝を切ってPRを作る。**はじめの2週間は自動でマージしない**（FUKKARU_WEB_AUTOMERGE）
     ページ・一覧（/web/）・サイトマップは、scripts/build-web.mjs がビルドのたびに作る

試し：FUKKARU_WEB_MODE=dry で、記事のファイルを書くだけ（git にも GitHub にも触らない）。
"""
from __future__ import annotations

import difflib
import json
import os
import re
import subprocess
import sys
from datetime import date, datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = Path(os.environ.get("FUKKARU_REPO") or HERE.parent.parent)
WEB_DIR = REPO / "content" / "web"
PUBLIC_WEB = REPO / "public" / "web"
NERAI = Path(os.environ.get("FUKKARU_WEB_NERAI") or (HERE / "狙い.txt"))
MODE = (os.environ.get("FUKKARU_WEB_MODE") or "on").strip()
# **はじめの2週間（2026-11-28 まで）は自動でマージしない。**読んでから人がマージする。
# よければ web-kiji.yml で '1' にすると、書いたその場で公開する
AUTOMERGE = (os.environ.get("FUKKARU_WEB_AUTOMERGE") or "0").strip() == "1"
EDA = "web/kiji-"
MIN_HONBUN = 2500        # 消したあとの本文がこれより短ければ書き直す
ATTEMPTS = 3
SITE = "https://fukkaru.creo-sumai.jp"

# 書き方・Gemini の呼び出し・PRの作り方は、ブログの道具をそのまま使う（直すのは1か所だけにする）
sys.path.insert(0, str(REPO / "scripts" / "blog"))
os.environ.setdefault("FUKKARU_STATE", str(REPO / "scripts" / "web" / "_state"))
import blog  # noqa: E402

LOG_LINES: list[str] = []


def log(msg: str) -> None:
    line = "[%s] %s" % (datetime.now().strftime("%Y-%m-%d %H:%M"), msg)
    print(line, flush=True)
    LOG_LINES.append(msg)


# ── 1本目の記事にある事実だけ（これより外のことは書かせない）──
FACTS = """
- 書く人：中元晋平。フッ軽合同会社の代表。静岡県富士市で便利屋を営んでいる
- 自社のホームページとブログは、自分で作り、更新を続けている。問い合わせの内容や検索のされ方を見ながら、今も直し続けている
- 便利屋として受けている作業の例：草刈り、家具の組み立て、不用品の運び出し、物置の組み立て
- 検索で見つけた方から、草刈りのお電話をいただいたことがある（回数・件数は書かない）
- お問い合わせの入口：電話も受けているが、写真を送ってお見積りができるLINEを入口の中心にしている
- ホームページづくりのお手伝いをしている。全国どこからでも、メールで相談を受けている
- お手伝いの進め方：普段お客様に説明していることを伺い、載せることの整理から一緒に進める。費用は、必要なページを決めてからお見積もりする
- 便利屋は許可や資格が要る仕事と隣り合わせ。たとえば、ごみの回収や処分には自治体の許可が要る場合がある（一般論として書く。フッ軽が何の許可を持っているかは書かない）
- 別の記事「便利屋のホームページの作り方」がすでにある（載せるべき7つ・作り方の選び方・よくあるつまずきを書いた）。
  **この記事では、その中身を並べ直さない。**一覧で振り返らず、狙う言葉の悩みだけを深く書く
  （2026-11-15、7つの中身まで渡していたら、Actions で3回続けて7つを並べ直して1本も書けなかった）
"""

RULES = """
- 日本語で、です・ます調。中元さん本人が、同じ小さな商売をしている人に話す口調（「私」）。制作会社の宣伝の口調にしない
- 数字を書かない：料金・相場・費用の金額、納期・日数・期間、件数・人数・割合・順位・年数、アクセス数は、どれも書かない（めやすも書かない）
- 約束を書かない：「必ず」「確実に」「保証」「上位表示」「集客できます」「問い合わせが増えます」のような成果の約束は書かない
- 作り話を書かない：お手伝いしたお客様の例・お客様の声・実績は書かない（まだ書ける事実がありません）。上の「事実」に無い経歴・資格・受賞も書かない
- フッ軽がごみを回収する・処分する・引き取る、と読める文は書かない。許可の話は一般論（自治体の許可が要る場合がある）までにする
- 電話番号・メールアドレス・URL・会社名（他社）・サービス名（特定の作成ツールの名前）を書かない
- 1つの段落は1〜2文、100字くらいまで。段落の中に箇条書きを書かない（箇条書きは ul を使う）
- 見出しは、検索した人の疑問にそのまま答える言い方にする
- 題には空白を入れない。狙う言葉は空白のまま並べず、自然な日本語にして入れる
- 「前回」「前の記事」と書かない。読む人は、検索からこの記事だけを読む
- フッ軽の作業は、名前（草刈り・家具の組み立て・不用品の運び出し・物置の組み立て）までにする。何をどこまでするか（例文の形でも）は書かない
"""

SCHEMA = """
次の形の JSON だけを返してください（前後に説明を書かない）：
{
  "title": "記事の題（30〜40字。「｜」で前半と後半に分ける。前半に狙う言葉を自然に入れる。金額・数字を入れない）",
  "slug": "英小文字とハイフンだけの住所（例 hitorioyakata-homepage）",
  "description": "検索結果に出る説明（80〜120字）",
  "lead": ["導入の段落", "…（3〜5段落。読む人の悩み→書いている私が誰か→この記事で何が分かるか）"],
  "sections": [
    {"h2": "見出し", "blocks": [
      {"type": "p", "text": "段落"},
      {"type": "h3", "text": "小見出し"},
      {"type": "ul", "items": ["**太字にしたい頭。**続きの文", "…"]},
      {"type": "note", "text": "囲みにしたい一言（記事の中で1回まで）"}
    ]}
  ]
}
- sections は4〜6個。本文の合計は3,500〜5,500字
- 最後の「相談の案内」は、こちらで決まった文を付けるので書かない
"""


def nerai_list() -> list[dict]:
    out = []
    for raw in NERAI.read_text(encoding="utf-8").splitlines():
        s = raw.strip()
        if not s or s.startswith("#"):
            continue
        parts = [p.strip() for p in re.split(r"[｜|]", s)]
        out.append({"go": parts[0], "hito": parts[1] if len(parts) > 1 else "小さな商売をしている方",
                    "memo": parts[2] if len(parts) > 2 else ""})
    return out


def kakiowari() -> list[dict]:
    """書き終わった記事（main にあるもの）"""
    arts = []
    for f in sorted(WEB_DIR.glob("*.json")):
        try:
            arts.append(json.loads(f.read_text(encoding="utf-8")))
        except Exception:
            pass
    return arts


_PR_NERAI = re.compile(r"（狙い：(.+?)）\s*$")


def pr_no_nerai() -> set[str]:
    """開いているPRで書いた言葉（はじめの2週間はPRで止まるので、main だけ見ると同じ言葉を毎日書いてしまう）"""
    if not blog.GH_PAT:
        log("… GitHub の鍵が無いので、開いているPRは見ません（試しのときだけ）")
        return set()
    got = set()
    for page in (1, 2, 3):
        res = blog.gh_api("/pulls?state=open&per_page=100&page=%d" % page)
        if not res:
            break
        for pr in res:
            if not str(pr.get("head", {}).get("ref", "")).startswith(EDA):
                continue
            m = _PR_NERAI.search(pr.get("title", ""))
            if m:
                got.add(m.group(1).strip())
    return got


def erabu(arts: list[dict], pr_go: set[str]) -> dict | None:
    sumi = {a.get("nerai", "").strip() for a in arts} | pr_go
    for n in nerai_list():
        if n["go"] not in sumi:
            return n
    return None


def honbun_text() -> str:
    """1本目の記事の本文（口調の見本として渡す）"""
    f = PUBLIC_WEB / "benriya-homepage.html"
    if not f.exists():
        return ""
    html = f.read_text(encoding="utf-8")
    m = re.search(r"<article>(.*?)</article>", html, re.S)
    t = re.sub(r"<[^>]+>", "", m.group(1) if m else "")
    return re.sub(r"\n\s*\n+", "\n", t).strip()[:3500]


def prompt(n: dict, arts: list[dict], ng: list[str] | None) -> str:
    sumi = "\n".join("- %s" % a.get("title", "") for a in arts) or "（まだありません）"
    yarinaoshi = ""
    if ng:
        yarinaoshi = "\n# 前の回でだめだったところ（今回は直してください）\n" + "\n".join("- " + x for x in ng) + "\n"
    return f"""あなたは、静岡県富士市で便利屋を営みながら、自社のホームページとブログを自分で作っている中元晋平です。
ホームページづくりのお手伝いもしています。同じように小さな商売をしている人に向けて、ホームページの記事を1本書きます。

# 狙う言葉（この言葉で検索した人が読みます）
{n['go']}

# 読む人
{n['hito']}（全国の方。静岡の話に寄せすぎない）

# 切り口のメモ
{n['memo'] or '（なし）'}

# 書いてよい事実（これより外のことは書かない）
{FACTS}

# 守ること
{RULES}

# すでにある記事（中身が重ならないように。同じ話をくり返さない）
{sumi}

# 口調の見本（1本目の記事。言い回しを写さず、口調だけ合わせる）
{honbun_text()}
{yarinaoshi}
{SCHEMA}
"""


# ── 書いてはいけない文を、文ごと消す（判定はここ1か所）──
_KANSUJI = "0-9０-９一二三四五六七八九十百千万数"
KESU = [
    ("金額", re.compile(r"[%s][%s,，.]*\s*(?:万|千)?円" % (_KANSUJI, _KANSUJI))),
    ("料金の言葉", re.compile(r"格安|激安|最安|相場は|相場が|費用相場|料金相場")),
    ("無料の約束", re.compile(r"(?:相談|見積|お手伝い|制作|作成|修正|更新)[^。]{0,10}(?:無料|0円|タダ)|(?:無料|0円)[^。]{0,8}(?:相談|お見積|見積|お手伝い|で作)")),
    ("納期・期間", re.compile(r"[%s]+\s*(?:日|週間|週|か月|ヶ月|カ月|ケ月|ヵ月)(?!本)|即日|最短|スピード納品|短納期" % _KANSUJI)),
    ("実績・数の数字", re.compile(r"[0-9０-９]+\s*(?:件|社|名|人|%|％|倍|位|割|年以上|年間|年目|年連続|回以上|PV|アクセス)")),
    ("成果の約束", re.compile(r"保証|上位表示|上位に表示|1位|一位|集客できます|集客できる|売上が(?:上が|伸び|増え)|問い合わせが(?:増え|来)(?:ます|る)|"
                         r"(?:必ず|確実に|絶対に?)[^。]{0,15}(?:上が|増え|来ます|集客|成果|売れ|上位|表示され|結果)|倍増|劇的|爆発的")),
    ("作り話の実績", re.compile(r"(?:お手伝い|制作|作成)した(?:お客様|お店|会社|方|事業者)|これまでに[^。]{0,20}(?:お手伝い|制作)|喜びの声|ご好評|"
                          r"と喜ばれ|豊富な実績|多数の実績|数多くの(?:実績|事業者|お店)|実績が(?:あり|ござい)|"
                          # 2026-11-15 の試しで「そんなご相談をよく受けます」と書いた（事実に無い）
                          r"(?:ご相談|お声|お問い合わせ|ご質問|ご依頼)[^。]{0,10}(?:よく|多く|たくさん|しばしば|何度も)|"
                          r"(?:よく|多く|たくさん|しばしば|何度も)[^。]{0,6}(?:ご相談|お声|お問い合わせ|ご質問)|"
                          r"(?:方|皆さん|皆様|同業)[^。]{0,4}から[^。]{0,15}(?:ご相談|お声|ご質問|ご依頼)[^。]{0,8}(?:いただ|受け|頂)")),
    ("許認可", re.compile(r"古物商|軽貨物|貨物軽自動車|一般廃棄物|産業廃棄物")),
    ("連絡先", re.compile(r"https?://|www\.|@|[0-9０-９]{2,4}[-－ー][0-9０-９]{2,4}[-－ー][0-9０-９]{3,4}")),
    ("ほかの商売", re.compile(r"subsc|manetaim|サブスクスペース", re.I)),
    # 作り話の事例（2026-11-15 の試しで「【事例】一人暮らしの女性が、家具の組み立てを依頼した理由」を例の題に書いた）
    ("作り話の事例", re.compile(r"【\s*(?:事例|実例|お客様の声|体験談)\s*】|(?:事例|実例|体験談)\s*[:：]|お客様の事例|実際にあった(?:事例|話|ご依頼)")),
    # 約束めいた言い方（「私たちの〇〇がお役に立てます」）。フッ軽の約束にも、読む人への例文にも読めるので消す
    ("約束めいた言い方", re.compile(r"(?:私たち|私ども|当社|弊社|フッ軽|うち)[^。「」]{0,20}(?:お役に立て|解決いたし|解決します|お任せ|お約束)|"
                              r"お役に立てます|お約束します|ご安心ください")),
    # 読む人は検索からこの記事だけを読む。言っても書くので消す（2026-11-15 の試しで2回続けて書いた）
    ("「前回」", re.compile(r"前回|前の記事|以前の記事|先日の記事")),
]
# ごみの回収・処分の話は、一般論（許可が要る）なら残す。それ以外は消す
_GOMI = re.compile(r"回収|処分|廃棄|引き取")
_GOMI_OK = re.compile(r"許可|資格|自治体|(?:回収|処分|廃棄)(?:の)?(?:方法|仕方|しかた)")
_GOMI_JISHA = re.compile(r"フッ軽|当社|弊社|私の会社|私たち|私が|私も|うちでは|お任せ|承り|承ります|対応します|いたします")


# フッ軽の作業について、名前より先の約束（何をどこまでするか）は事実に無い。例文の形でも、フッ軽の約束に読める
# （2026-11-15 の試しで「基礎作りから丁寧に進めます」「庭木の手入れも承ります」と書いた。基礎工事は受けていない）
_SAGYO = re.compile(r"草刈|組み立て|組立|運び出し|物置|家具|庭|不用品|引越|引っ越|冷蔵庫|片付|搬出|粗大")
_SAGYO_YAKUSOKU = re.compile(r"承ります|承り|お任せ|進めます|運びます|いたします|お手伝いします|対応します|できます|お声がけください")


_NERAI_RE = None


def kesu_riyuu(bun: str) -> str | None:
    if _NERAI_RE is not None and _NERAI_RE.search(bun):
        return "狙う言葉を空白のまま書いた"
    for name, rx in KESU:
        if rx.search(bun):
            return name
    # 作業の名前の「あと」25字以内に約束の言い方があるときだけ（「何でもお任せください、だけのページでは…」のような悪い例の話は残す）
    # お客様の質問（「〜できますか？」）は約束ではないので残す
    # 「『草刈りを承ります』と書くのではなく…」のような、悪い書き方の例の話も残す
    if re.search(r"(?:%s)[^。「」]{0,25}(?:%s)(?!か)" % (_SAGYO.pattern, _SAGYO_YAKUSOKU.pattern), bun) \
            and not re.search(r"と書く(?:の)?ではなく|と書くだけ|だけでは|ではなく", bun):
        return "フッ軽の作業の約束（事実に無い）"
    # 消すのは「フッ軽（私）が回収・処分する」と読める文だけ。お客様の言葉（どう処分したらいいか）や
    # 検索の言葉（不用品 処分）まで消すと、記事が痩せる（2026-11-15 の試しで2文を消しすぎた）
    if _GOMI.search(bun):
        if _GOMI_JISHA.search(bun):
            return "許認可（ごみの回収・処分）"
        if not _GOMI_OK.search(bun) and re.search(
                r"(?:回収|処分|廃棄|引き取)[^。「」]{0,15}(?:します|いたします|承ります|承り|お任せ|できます|対応|お引き受け)(?!か)", bun):
            return "許認可（ごみの回収・処分）"
    return None


def _bun(text: str) -> list[str]:
    # 「。」で区切る。かっこの中の「。」では切らない
    out, buf, fukasa = [], "", 0
    for ch in text:
        buf += ch
        if ch in "「（(『":
            fukasa += 1
        elif ch in "」）)』" and fukasa:
            fukasa -= 1
        elif ch in "。！？" and not fukasa:
            out.append(buf)
            buf = ""
    if buf.strip():
        out.append(buf)
    return out


def naosu_text(text: str, keshita: list[tuple[str, str]]) -> str:
    nokoru = []
    for b in _bun(str(text)):
        r = kesu_riyuu(b)
        if r:
            keshita.append((r, b.strip()))
        else:
            nokoru.append(b)
    return "".join(nokoru).strip()


def bunkatsu(text: str, n: int = 2) -> list[str]:
    """1つの段落は2文まで（ブログの記事と同じ決まり。AIは何度言っても長く書くので、こちらで分ける）"""
    bun = [b for b in _bun(text) if b.strip()]
    return ["".join(bun[i:i + n]).strip() for i in range(0, len(bun), n)] or [text]


def kijun(t: str) -> str:
    t = re.sub(r"<[^>]+>", "", str(t))
    # AIが自分あての注意を本文に書くことがある（2026-11-15「（※作り話ではなく、一般的な事例として）」）。かっこごと外す
    # 「（※表札や顔が映らないよう配慮）」のような本文の注意は残す
    t = re.sub(r"[（(]\s*※[^）)]*(?:作り話|守るべき|事実に沿|書かない|書くことは避|指示|プロンプト)[^）)]*[）)]", "", t)
    return t.replace("　", " ").strip()


def seikei(art: dict, nerai: str = "") -> tuple[dict, list[tuple[str, str]]]:
    """形をそろえて、書いてはいけない文を消す"""
    keshita: list[tuple[str, str]] = []
    # 狙う言葉を空白のまま「」に入れた文（「便利屋 ホームページ 集客」でお悩みですか？）は、機械が書いたように読めるので消す
    global _NERAI_RE
    _NERAI_RE = re.compile(re.escape(nerai)) if nerai and re.search(r"\s", nerai) else None
    # 「1本目の記事」は、読む人には分からない（2026-11-15 の試しで4回書いた）。記事の名前に置き換える
    for k in ("lead", "sections", "description"):
        if k in art:
            art[k] = json.loads(json.dumps(art[k], ensure_ascii=False)
                                .replace("1本目の記事", "「便利屋のホームページの作り方」の記事")
                                .replace("１本目の記事", "「便利屋のホームページの作り方」の記事"))
    out = {
        # 題の空白は外す（AIは狙う言葉を「便利屋 ホームページ 集客」と空白のまま並べる。言っても直らなかった）
        "title": re.sub(r"[ \u3000]+", "", kijun(art.get("title", ""))),
        "description": naosu_text(kijun(art.get("description", "")), keshita),
        "lead": [],
        "sections": [],
    }
    # 題と説明は、消すと意味が変わるので、引っかかったら書き直しにする（下の ng）
    for p in art.get("lead", []) or []:
        t = naosu_text(kijun(p), keshita)
        if t:
            out["lead"].extend(bunkatsu(t))
    for i, sec in enumerate(art.get("sections", []) or []):
        blocks = []
        notes = 0
        for b in sec.get("blocks", []) or []:
            typ = b.get("type")
            if typ in ("p", "note"):
                t = naosu_text(kijun(b.get("text", "")), keshita)
                if not t:
                    continue
                if typ == "note":
                    notes += 1
                    if notes > 1:
                        typ = "p"
                if typ == "p":
                    blocks.extend({"type": "p", "text": x} for x in bunkatsu(t))
                else:
                    blocks.append({"type": typ, "text": t})
            elif typ == "h3":
                t = kijun(b.get("text", ""))
                r = kesu_riyuu(t)
                if r:
                    keshita.append((r, t))
                    continue
                blocks.append({"type": "h3", "text": t})
            elif typ in ("ul", "ol"):
                items = []
                for it in b.get("items", []) or []:
                    t = naosu_text(kijun(it), keshita)
                    if t and t.strip("*").strip():
                        items.append(t)
                if items:
                    blocks.append({"type": typ, "items": items})
        # 小見出しだけ残って中身が消えたところは、小見出しも外す
        while blocks and blocks[-1]["type"] == "h3":
            blocks.pop()
        blocks = [b for j, b in enumerate(blocks)
                  if not (b["type"] == "h3" and j + 1 < len(blocks) and blocks[j + 1]["type"] == "h3")]
        h2 = kijun(sec.get("h2", ""))
        if blocks and h2:
            out["sections"].append({"id": "s%d" % (len(out["sections"]) + 1), "h2": h2, "blocks": blocks})
    return out, keshita


def honbun_nagasa(art: dict) -> int:
    n = sum(len(p) for p in art["lead"])
    for s in art["sections"]:
        n += len(s["h2"])
        for b in s["blocks"]:
            n += len(b.get("text", "")) + sum(len(x) for x in b.get("items", []))
    return n


def slug_kimeru(raw: str, arts: list[dict]) -> str:
    s = re.sub(r"[^a-z0-9-]+", "-", str(raw).lower()).strip("-")
    s = re.sub(r"-{2,}", "-", s)[:60].strip("-")
    if len(s) < 4:
        s = "homepage-%s" % date.today().strftime("%Y%m%d")
    tsukatta = {a.get("slug") for a in arts} | {p.stem for p in PUBLIC_WEB.glob("*")} | {"index"}
    base, i = s, 2
    while s in tsukatta:
        s = "%s-%d" % (base, i)
        i += 1
    return s


def ng_list(art: dict, arts: list[dict], keshita: list) -> list[str]:
    ng = []
    if len(art["description"]) < 40:
        ng.append("説明（description）が短すぎます。80〜120字で、狙う言葉を空白のまま書かずに")
    for k in ("title",):
        r = kesu_riyuu(art[k])
        if r:
            ng.append("%sに書いてはいけないこと（%s）があります：%s" % ("題" if k == "title" else "説明", r, art[k]))
    if not art["title"] or "｜" not in art["title"] and "|" not in art["title"]:
        ng.append("題は「｜」で前半と後半に分けてください")
    if len(art["sections"]) < 3:
        ng.append("見出し（sections）が少なすぎます。4〜6個にしてください")
    n = honbun_nagasa(art)
    if n < MIN_HONBUN:
        ng.append("本文が短すぎます（%d字）。3,500字以上にしてください" % n)
    if len(keshita) > 12:
        ng.append("書いてはいけない文が多すぎました（%d文）。数字・約束・作り話を書かないでください" % len(keshita))
    # 1本目の記事の「載せるべき7つ」「作り方は3つ」をくり返していないか（2026-11-15 の試しで、ほぼ写し直した）
    midashi = " ".join([s["h2"] for s in art["sections"]] +
                       [b["text"] for s in art["sections"] for b in s["blocks"] if b["type"] == "h3"])
    nanatsu = sum(1 for k in ("何を頼めるか", "料金のめやす", "対応エリア", "誰が来る", "作業の写真", "できないこと", "相談のしかた")
                  if k in midashi)
    mittsu = sum(1 for k in ("作成サービス", "制作会社に", "知っている人") if k in midashi)
    if nanatsu >= 3 or mittsu >= 2:
        ng.append("1本目の記事（載せるべき7つ・作り方は3つ）を見出しごとくり返しています。くり返さず、狙う言葉の悩みだけを深く書いてください")
    for a in arts:
        hm = " ".join(s.get("h2", "") for s in a.get("sections", []))
        if hm and difflib.SequenceMatcher(None, " ".join(s["h2"] for s in art["sections"]), hm).ratio() >= 0.5:
            ng.append("見出しの並びが、すでにある記事と似すぎています：%s" % a.get("title", ""))
            break
    for a in arts:
        r = difflib.SequenceMatcher(None, art["title"], a.get("title", "")).ratio()
        if r >= 0.6:
            ng.append("題がすでにある記事と似すぎています：%s" % a.get("title", ""))
            break
    return ng


def kaku(n: dict, arts: list[dict]) -> tuple[dict, list, int] | None:
    ng = None
    for kai in range(1, ATTEMPTS + 1):
        try:
            raw = blog.extract_json(blog.gen_text(prompt(n, arts, ng)))
        except Exception as e:
            log("✗ %d回目：AIの答えを読めませんでした（%s）" % (kai, str(e)[:200]))
            ng = ["JSON だけを返してください"]
            continue
        art, keshita = seikei(raw, n["go"])
        ng = ng_list(art, arts, keshita)
        if ng and kai < ATTEMPTS:
            log("… %d回目はやり直します：%s" % (kai, " ／ ".join(ng)))
            continue
        if ng:
            log("✗ %d回書いても直りませんでした：%s" % (kai, " ／ ".join(ng)))
            return None
        art["slug"] = slug_kimeru(raw.get("slug", ""), arts)
        return art, keshita, kai
    return None


def setsumei(art: dict, n: dict, keshita: list, kai: int) -> str:
    rows = "\n".join("- （%s）%s" % (r, b) for r, b in keshita) or "- なし"
    return f"""HP制作の記事を自動で書きました（`scripts/web/web_kiji.py`）。

- 狙う言葉：**{n['go']}**（読む人：{n['hito']}）
- 住所：{SITE}/web/{art['slug']}.html （マージすると数分で出ます）
- 本文：{honbun_nagasa(art)}字・見出し{len(art['sections'])}個・{kai}回目で書けました

**はじめの2週間（2026-11-28 まで）は自動でマージしません。**読んで、よければマージしてください。
直したいところがあれば、この枝の `content/web/{art['slug']}.json` を直します。

## 道具が消した文（AIが書いてはいけないことを書いたので、文ごと外しました）
{rows}

消したあとで、前後の文がつながっているかを読んでください。

🤖 Generated with [Claude Code](https://claude.com/claude-code)
"""


def git(*args: str) -> str:
    r = subprocess.run(["git", "-C", str(REPO), *args], capture_output=True, text=True, cwd=str(REPO))
    if r.returncode != 0:
        raise RuntimeError("git %s -> %s" % (" ".join(args), r.stderr.strip()[:300]))
    return r.stdout.strip()


def main() -> int:
    dry = MODE == "dry"
    if not blog.KEY:
        log("✗ GEMINI_API_KEY がありません")
        return 1
    arts = kakiowari()
    pr_go = set() if dry and not blog.GH_PAT else pr_no_nerai()
    n = erabu(arts, pr_go)
    if not n:
        log("✓ 狙う言葉を全部書き終わりました。新しい記事は書きません（狙い.txt に行を足すと、また書きます）")
        return 0
    log("狙う言葉：%s（読む人：%s）" % (n["go"], n["hito"]))
    got = kaku(n, arts)
    if not got:
        return 1
    art, keshita, kai = got
    kyou = date.today().isoformat()
    # 読む人への呼びかけは、狙い.txt の「読む人」から機械で作る（AIに書かせたら「便利屋のはじめた方へ」になった）
    eyebrow = re.split(r"[・、，,]", n["hito"])[0].strip()
    eyebrow = (eyebrow if eyebrow.endswith("へ") else eyebrow + "へ") if eyebrow else "小さな商売をしている方へ"
    art = {"slug": art["slug"], "title": art["title"], "eyebrow": eyebrow,
           "description": art["description"], "publishDate": kyou, "updatedDate": kyou,
           "nerai": n["go"], "hito": n["hito"], "lead": art["lead"], "sections": art["sections"]}
    WEB_DIR.mkdir(parents=True, exist_ok=True)
    dest = WEB_DIR / ("%s.json" % art["slug"])
    dest.write_text(json.dumps(art, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    body = setsumei(art, n, keshita, kai)
    log("✓ 書きました：%s（%s・本文%d字・消した文%d）" % (art["title"], dest.name, honbun_nagasa(art), len(keshita)))
    for r, b in keshita:
        log("   消した（%s）：%s" % (r, b))
    if dry:
        (dest.with_suffix(".pr.md")).write_text(body, encoding="utf-8")
        log("✓ 試しなので、git には触りません")
        return 0

    branch = "%s%s-%s" % (EDA, datetime.now().strftime("%Y%m%d-%H%M"), art["slug"])
    title = "HP制作の記事：%s（狙い：%s）" % (art["title"], n["go"])
    try:
        git("checkout", "-b", branch)
        git("add", str(dest.relative_to(REPO)))
        git("commit", "-m", "HP制作の記事：%s" % art["title"])
        git("push", "-u", "origin", branch)
        url, _, num = blog.open_pr(branch, art, title=title, body=body)
        git("checkout", "main")
        log("✓ PRを作りました：%s" % url)
        if AUTOMERGE:
            try:
                blog.merge_pr(num, "HP制作の記事を追加（自動）")
                log("  ・取り込みました。数分で出ます：%s/web/%s.html" % (SITE, art["slug"]))
            except Exception as e:
                log("  ・取り込めませんでした：%s（PRに残っています）" % e)
        else:
            log("  （はじめの2週間は自動でマージしません。読んでからマージしてください）")
    except Exception as e:
        log("✗ git のところで失敗しました：%s" % e)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
