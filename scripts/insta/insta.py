#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""インスタの最新投稿を、HPに置ける形にして取ってくる（2026-09-13）

**Elfsight（他社の埋め込み）をやめるために作りました。**制限のお知らせが届いたため。

    python3 scripts/insta/insta.py          … 取ってきて書き込む
    python3 scripts/insta/insta.py --miru   … 見るだけ（何も書かない）

**毎日 GitHub Actions が動かします**（.github/workflows/insta.yml・2026-09-13）。
Macが眠っていても更新されます。**この道具はここ1か所だけ**です（写しを置かない）。

やること
  ① 公式API（graph.instagram.com）で最新の投稿を読む … **鍵はMacの中だけ**
  ② 画像をこちらに落として、長いほうの辺を720pxにする（**切りません**）
     **インスタの画像URLは期限切れになります。**直リンクにすると、
     ある日いっせいに消えます。だから落として置きます
  ③ `content/insta.json` と `public/insta/*.jpg` に書く（HPが読む）
  ④ **文面は載せません。**過去の投稿に「処分」「回収」が入っていることがあり、
     許認可の線を越えます（CLAUDE.md 3）。載せるのは写真と日付とリンクだけ

**投稿はしません。読むだけです。**
"""
import io
import json
import os
import re
import shutil
import sys
import time
import urllib.parse
import urllib.request

HOME = os.path.expanduser("~")
ENVF = os.path.join(HOME, ".fukkaru", "env")
LANDING = os.environ.get("FUKKARU_REPO") or os.path.join(HOME, "fukkaru-landing")
GAZOU_DIR = os.path.join(LANDING, "public", "insta")
JSONF = os.path.join(LANDING, "content", "insta.json")
HONSUU = 18             # **3×3を2面。**増やすとページが重くなります（遅延読み込みあり）
HABA = 720              # 長いほうの辺（縦横の比はそのまま）
MIRU = "--miru" in sys.argv

# **許認可の線に触る語。**見つけたら報せます（HPには文面を載せないので事故にはなりません）
AYAUI = ["処分", "回収", "廃棄"]


def env():
    d = {}
    if not os.path.exists(ENVF):
        return d
    for l in io.open(ENVF, encoding="utf-8"):
        l = l.strip()
        if l.startswith("export "):
            l = l[7:]
        if "=" in l and not l.startswith("#"):
            k, v = l.split("=", 1)
            d[k.strip()] = v.strip().strip('"').strip("'")
    return d


def toru(url):
    return json.load(urllib.request.urlopen(url, timeout=30))


def toukou_wo_yomu(tok, uid):
    q = urllib.parse.urlencode({
        "fields": "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
        "limit": str(HONSUU + 6),      # 動画などを外す余地を持たせる
        "access_token": tok})
    return toru("https://graph.instagram.com/%s/media?%s" % (uid, q)).get("data", [])


def chiisaku(baito):
    """**切らずに**小さくする。縦横の比はそのまま

    2026-09-13、はじめは正方形に切っていました。**カードの見出しと下の帯が
    切れました**（実物を目で見て気づきました）。投稿カードは1080×1350（縦長）で、
    上と下に文字が乗っています。**切ったら文字が消えます。**
    """
    from PIL import Image
    im = Image.open(io.BytesIO(baito)).convert("RGB")
    w, h = im.size
    if max(w, h) > HABA:
        r = HABA / float(max(w, h))
        im = im.resize((int(w * r), int(h * r)), Image.LANCZOS)
    return im


def main():
    e = env()
    # Actions では秘密から、Mac では ~/.fukkaru/env から読みます
    tok = os.environ.get("IG_TOKEN") or e.get("IG_TOKEN", "")
    uid = os.environ.get("IG_USER_ID") or e.get("IG_USER_ID", "")
    if not tok or not uid:
        print("✗ IG_TOKEN / IG_USER_ID がありません（~/.fukkaru/env）")
        return 1

    try:
        d = toukou_wo_yomu(tok, uid)
    except Exception as ex:
        print("✗ インスタが読めません（%s）" % ex)
        print("  鍵が切れているかもしれません → /usr/local/bin/python3 ~/.fukkaru/ig_setup.py")
        return 1

    erabu = d[:HONSUU]
    print("インスタから %d件 読みました（使うのは %d件）" % (len(d), len(erabu)))

    # 文面の見張り（HPには載せませんが、中元さんの書き方の参考に報せます）
    kizukai = []
    for m in erabu:
        c = m.get("caption") or ""
        for w in AYAUI:
            if w in c:
                kizukai.append("%s に「%s」" % (m["timestamp"][:10], w))
    if kizukai:
        print("  ※ 投稿の文に許認可の線に触る語があります（HPには載せません）：")
        for k in kizukai[:5]:
            print("     ・" + k)

    toukou = []
    for m in erabu:
        gazou_url = m.get("media_url") if m.get("media_type") == "IMAGE" \
            else (m.get("thumbnail_url") or m.get("media_url"))
        if not gazou_url:
            continue
        hi = m["timestamp"][:10]
        namae = "%s.jpg" % re.sub(r"[^0-9A-Za-z]", "", m["id"])[:24]
        saki = os.path.join(GAZOU_DIR, namae)
        if MIRU:
            print("  見るだけ：%s %s → %s" % (hi, m.get("media_type"), namae))
        else:
            if not os.path.exists(saki):
                baito = urllib.request.urlopen(gazou_url, timeout=60).read()
                if not os.path.isdir(GAZOU_DIR):
                    os.makedirs(GAZOU_DIR)
                chiisaku(baito).save(saki, "JPEG", quality=80, optimize=True)
                print("  落としました：%s（%s・%dKB）"
                      % (namae, hi, os.path.getsize(saki) // 1024))
            else:
                print("  もうあります：%s（%s）" % (namae, hi))
        haba, takasa = 0, 0
        if os.path.exists(saki):
            from PIL import Image
            haba, takasa = Image.open(saki).size
        toukou.append({
            "id": m["id"],
            "hi": hi,
            "kata": m.get("media_type", "IMAGE"),
            "ga": "/insta/" + namae,
            "haba": haba,
            "takasa": takasa,
            "url": m.get("permalink", ""),
        })

    if MIRU:
        print("\n見るだけで終わります。何も書いていません。")
        return 0

    # 使わなくなった画像を片付ける（**残すとページが重くなります**）
    ikiteru = set(os.path.basename(t["ga"]) for t in toukou)
    if os.path.isdir(GAZOU_DIR):
        for f in os.listdir(GAZOU_DIR):
            if f.endswith(".jpg") and f not in ikiteru:
                os.remove(os.path.join(GAZOU_DIR, f))
                print("  片付けました：%s" % f)

    data = {
        "torikomi": time.strftime("%Y-%m-%dT%H:%M:%S+09:00"),
        "username": "fukkaru.fuji.benriya",
        "toukou": toukou,
    }
    furui = ""
    if os.path.exists(JSONF):
        furui = io.open(JSONF, encoding="utf-8").read()
    atarashii = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    # 取り込んだ時刻だけの違いでは書き換えない（**毎日ムダなPRが立ちます**）
    def naka(s):
        try:
            x = json.loads(s)
            x.pop("torikomi", None)
            return json.dumps(x, ensure_ascii=False, sort_keys=True)
        except Exception:
            return s
    if furui and naka(furui) == naka(atarashii):
        print("\n○ 前と同じでした（書き換えていません）")
        return 0
    io.open(JSONF, "w", encoding="utf-8").write(atarashii)
    print("\n○ %s に %d件 書きました" % (os.path.relpath(JSONF, HOME), len(toukou)))
    print("  **PRを出すまで本番は変わりません。**")
    return 0


if __name__ == "__main__":
    sys.exit(main())
