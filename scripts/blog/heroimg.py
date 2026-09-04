#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ブログ記事のトップ画像を作る（2026-09-01）

なぜ要るのか
------------
記事に画像が1枚も無く、`og:image` も出していなかった。
そのため **LINEやXに貼っても絵が出ない**。読まれる前に負けている。

なぜMac内で焼くのか
-------------------
Canva は対話セッションからしか操作できないので、毎日ひとりでに動く仕組みに組み込めない。
見た目は投稿カード（cardgen.py）と同じ言葉づかい——紺と橙、ヒラギノ——に揃えてある。

大きさは 1200×630。SNSに貼ったときの標準の形。
背景の写真が無ければ、紺の濃淡だけで作る（それでも文字は読める）。
"""
from __future__ import annotations

import base64
import json
import os
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

KEY = os.environ.get("GEMINI_API_KEY", "").strip()
IMG_MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-3.1-flash-image")

W, H = 1200, 630
# Macではヒラギノ。GitHub Actions（Ubuntu）にはヒラギノが無いので差し替える（2026-09-02）
#
# ⚠ **太字の指定に注意。** ヒラギノは1つの .ttc の中に細字と太字が入っていて
#   番号で選ぶ（W3=0 / W6=2）。ところが Ubuntu の NotoSansCJK-Regular.ttc は
#   **番号が言語の違い**で、index=2 は「簡体字中国語」だった。
#   そのまま使うと、太字にならないうえ漢字が中国式の字形で出る（実際にそうなっていた）。
#   Noto は太字が別ファイル（NotoSansCJK-Bold.ttc）なので、そちらを指す。
FONT = os.environ.get("FUKKARU_FONT") or "/System/Library/Fonts/Hiragino Sans GB.ttc"
FONT_BOLD = os.environ.get("FUKKARU_FONT_BOLD") or FONT
# 同じファイルの中で太字を選ぶときだけ番号が要る。別ファイルなら先頭（日本語）でよい
W3 = int(os.environ.get("FUKKARU_FONT_INDEX") or 0)
W6 = int(os.environ.get("FUKKARU_FONT_BOLD_INDEX")
         or (2 if FONT_BOLD == FONT else 0))

NAVY   = (11, 45, 74)
NAVY_D = (6, 28, 47)
ORANGE = (255, 122, 0)
WHITE  = (255, 255, 255)
PALE   = (176, 196, 214)

PAD = 64
NAME = "便利屋フッ軽　富士市・富士宮市"


# ── フォントに無い字を、見た目の同じ字に置き換える（2026-09-04）──
# 「〜」(U+301C WAVE DASH) は Hiragino Sans GB が持っておらず、**□ で出ます。**
# 記事の題はほとんど「8,000円〜」なので、og画像の11本が豆腐になっていました。
# 記事の本文は触りません。**絵に描くときだけ**差し替えます。
SAFE = {"\u301c": "\uff5e"}   # 〜 → ～


def font_safe(t: str) -> str:
    for a, b in SAFE.items():
        t = t.replace(a, b)
    return t

def font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT, size,
                             index=W6 if bold else W3)


def cover(img: Image.Image) -> Image.Image:
    """縦横比を保ったまま 1200x630 を覆い、はみ出しは中央で切る。"""
    src, dst = img.width / img.height, W / H
    if src > dst:
        w = int(img.height * dst)
        box = ((img.width - w) // 2, 0, (img.width + w) // 2, img.height)
    else:
        h = int(img.width / dst)
        box = (0, (img.height - h) // 2, img.width, (img.height + h) // 2)
    return img.crop(box).resize((W, H), Image.LANCZOS)


def gradient() -> Image.Image:
    """写真が無いときの下地。紺の濃淡だけ。"""
    g = Image.new("RGB", (W, H), NAVY)
    d = ImageDraw.Draw(g)
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)],
               fill=tuple(int(a + (b - a) * t) for a, b in zip(NAVY, NAVY_D)))
    return g


def wrap(text: str, f: ImageFont.FreeTypeFont, width: int) -> list[str]:
    """日本語なので単語で折らず、入るところまで詰めて折り返す。"""
    lines, cur = [], ""
    d = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    for ch in text:
        if ch == "\n":
            lines.append(cur)
            cur = ""
            continue
        trial = cur + ch
        if d.textlength(trial, font=f) <= width:
            cur = trial
        else:
            lines.append(cur)
            cur = ch
    if cur:
        lines.append(cur)
    return lines


def make_hero(out_path: Path, title: str, category: str = "",
              bg_path: Path | None = None) -> Path:
    """記事のトップ画像を1枚作って、置いた場所を返す。"""
    title = font_safe(title)
    category = font_safe(category)
    # 記事ページの見出しに敷く絵。ページ側でも暗い幕をかけるので、ここでは薄くしか暗くしない。
    # 文字は載せない（ページに題があるので、二重に見えてしまう）。
    out_path.parent.mkdir(parents=True, exist_ok=True)
    bg_only = out_path.with_name(out_path.stem + "-bg" + out_path.suffix)

    if bg_path and Path(bg_path).exists():
        photo = cover(Image.open(bg_path).convert("RGB"))
        light = Image.alpha_composite(
            photo.convert("RGBA"),
            Image.new("RGBA", (W, H), (*NAVY_D, 70))).convert("RGB")
        light.save(bg_only, "JPEG", quality=88, optimize=True)

        # SNS用は文字を載せるので、ぼかして強めに暗くする
        base = photo.filter(ImageFilter.GaussianBlur(2))
        veil = Image.new("RGBA", (W, H), (*NAVY_D, 190))
        base = Image.alpha_composite(base.convert("RGBA"), veil).convert("RGB")
    else:
        base = gradient()
        base.save(bg_only, "JPEG", quality=88, optimize=True)

    d = ImageDraw.Draw(base)

    # 左端の橙の縦線。カードと同じ目印
    d.rectangle([0, 0, 10, H], fill=ORANGE)

    # 題。長ければ字を小さくして、4行に収める
    for size in (58, 52, 46, 40, 36):
        f = font(size, bold=True)
        lines = wrap(title, f, W - PAD * 2)
        if len(lines) <= 4:
            break
    lines = lines[:4]

    # 中身のかたまりを縦の真ん中に置く（下が空いて間延びしないように）
    line_h = int(size * 1.42)
    cat_h = 68 if category else 0
    block_h = cat_h + line_h * len(lines) + 26      # 26 は下の橙の線のぶん
    y = max(PAD, (H - 60 - block_h) // 2)

    if category:
        fc = font(24, bold=True)
        tw = d.textlength(category, font=fc)
        d.rounded_rectangle([PAD, y, PAD + tw + 34, y + 44], radius=22,
                            outline=PALE, width=2)
        d.text((PAD + 17, y + 8), category, font=fc, fill=PALE)
        y += cat_h

    for line in lines:
        d.text((PAD, y), line, font=f, fill=WHITE)
        y += line_h

    # 題の下に橙の短い線。カードと同じ目印
    d.rectangle([PAD, y + 10, PAD + 120, y + 16], fill=ORANGE)

    # 下に社名
    f = font(26, bold=False)
    d.text((PAD, H - PAD - 20), NAME, font=f, fill=PALE)

    base.save(out_path, "JPEG", quality=88, optimize=True)
    return out_path, bg_only


def gen_background(topic: str, dest: Path) -> bool:
    """記事に合う実写風の背景を1枚つくる。失敗しても止めない。

    人物の顔や文字が入ると使えないので、そこは強く止めてある。
    上に題を載せるので、画面の左側は静かな絵にしてもらう。
    """
    if not KEY:
        return False
    prompt = (
        f"Professional editorial photograph for a Japanese local handyman company blog. "
        f"Subject: {topic}. Realistic documentary photo, natural daylight, "
        f"suburban Japanese residential setting, calm composition with open quiet space "
        f"on the left third of the frame, shallow depth of field, muted natural colours."
    )
    guard = (" IMPORTANT: absolutely no text, no letters, no numbers, no watermarks,"
             " no logos, no brand names, no recognisable faces, no license plates."
             " Single continuous scene, no panels, no split screen.")
    base = {"model": IMG_MODEL, "input": [{"type": "text", "text": prompt + guard}]}
    shapes = [dict(base, generation_config={"image_config": {"aspect_ratio": "16:9",
                                                             "image_size": "2K"}}),
              dict(base, image_config={"aspect_ratio": "16:9", "image_size": "2K"}),
              base]

    def find(node):
        if isinstance(node, dict):
            for k in ("output_image", "outputImage", "inline_data", "inlineData"):
                if k in node:
                    got = find(node[k])
                    if got:
                        return got
            d = node.get("data") or node.get("bytes_base64") or node.get("b64_json")
            if isinstance(d, str) and len(d) > 512:
                return d
            for v in node.values():
                got = find(v)
                if got:
                    return got
        elif isinstance(node, list):
            for v in node:
                got = find(v)
                if got:
                    return got
        return None

    for body in shapes:
        req = urllib.request.Request(
            "https://generativelanguage.googleapis.com/v1beta/interactions",
            data=json.dumps(body).encode("utf-8"),
            headers={"x-goog-api-key": KEY, "Content-Type": "application/json"},
            method="POST")
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                got = find(json.loads(r.read().decode("utf-8")))
            if got:
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(base64.b64decode(got))
                return True
        except Exception:
            continue
    return False


if __name__ == "__main__":
    import sys
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "hero.jpg")
    title = sys.argv[2] if len(sys.argv) > 2 else "富士市で物置の組み立て・移設にお困りですか？"
    cat = sys.argv[3] if len(sys.argv) > 3 else "物置"
    bg = Path(sys.argv[4]) if len(sys.argv) > 4 else None
    print(make_hero(out, title, cat, bg))