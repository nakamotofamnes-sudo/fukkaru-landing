#!/usr/bin/env python3
"""content/douga.json の空いている YouTube の id を、チャンネルの公開一覧（RSS）から埋める（2026-10-20）。

鍵は要らない（RSS は公開の動画だけが載る。非公開・予約中は載らないので、出ていない動画を貼る心配がない）。
毎晩の動画の題名は「〈ひとこと〉｜〈topic〉（くらしの豆知識）#Shorts」。topic で探す。
同じ topic が2本あれば、古いほう（先に出たほう）を使う。
blog.py が記事を書く前に呼ぶ。失敗しても記事は止めない（いま埋まっている id のまま）。

手で試すとき：  python3 scripts/blog/douga_ids.py
"""
import json
import sys
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

DOUGA = Path(__file__).resolve().parents[2] / "content" / "douga.json"
NS = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}


def koukai_ichiran(channel_id: str) -> list[dict]:
    url = "https://www.youtube.com/feeds/videos.xml?channel_id=" + channel_id
    with urllib.request.urlopen(url, timeout=20) as r:
        root = ET.fromstring(r.read())
    out = []
    for e in root.findall("a:entry", NS):
        out.append({
            "id": e.findtext("yt:videoId", "", NS),
            "title": e.findtext("a:title", "", NS),
            "published": e.findtext("a:published", "", NS),
        })
    return out


def umeru(path: Path = DOUGA) -> int:
    d = json.loads(path.read_text(encoding="utf-8"))
    aki = [x for x in d.get("douga", []) if not x.get("youtube")]
    if not aki:
        return 0
    ichiran = sorted(koukai_ichiran(d["channel_id"]), key=lambda v: v["published"])
    n = 0
    for x in aki:
        hit = next((v for v in ichiran if ("｜%s（" % x["topic"]) in v["title"] and v["id"]), None)
        if hit:
            x["youtube"] = hit["id"]
            x["title"] = hit["title"]
            x["uploadDate"] = hit["published"]
            n += 1
    if n:
        path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return n


if __name__ == "__main__":
    print("埋めた id：%d 本" % umeru())
    sys.exit(0)
