# -*- coding: utf-8 -*-
"""古い道具と新しい道具を、いまの全記事で比べる（鍵もgitも使わない）。

使い方（倉庫の scripts/blog で。古い道具は、直す前の blog.py を別の場所に書き出したもの）：
    git show origin/main:scripts/blog/blog.py > /tmp/blog_furui.py
    /usr/bin/python3 tameshi/kuraberu.py /tmp/blog_furui.py

見るもの：整形（seikei）の結果がちがう記事（ねらった直しだけか、全部読む）／新しい道具だけが出す check() の指摘（0でないと、毎日の記事が落ちる）
"""
import importlib.util, json, glob, sys, os, copy
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..'))
import blog as new
if len(sys.argv) < 2:
    print('古い道具（直す前の blog.py）の場所を渡してください'); sys.exit(1)
spec = importlib.util.spec_from_file_location('blog_furui', sys.argv[1])
old = importlib.util.module_from_spec(spec); spec.loader.exec_module(old)
done = [json.load(open(f, encoding='utf-8')) for f in sorted(glob.glob(os.path.join(HERE, '..', '..', '..', 'content', 'articles', '*.json')))]
def texts(a):
    out = []
    for b in a.get('blocks', []):
        if not isinstance(b, dict): continue
        if isinstance(b.get('text'), str): out.append(b['text'])
        for x in b.get('items') or []:
            out.append(x if isinstance(x, str) else json.dumps(x, ensure_ascii=False))
    return out
chigau = fueta = 0
for d in done:
    o = copy.deepcopy(d); old.seikei(o); n = copy.deepcopy(d); new.seikei(n)
    if json.dumps(o, ensure_ascii=False, sort_keys=True) != json.dumps(n, ensure_ascii=False, sort_keys=True):
        chigau += 1; to, tn = texts(o), texts(n); print('  ★整形がちがう', d['slug'])
        for x in to:
            if x not in tn: print('     消/前:', x[:150])
        for x in tn:
            if x not in to: print('     新/後:', x[:150])
    a2 = copy.deepcopy(d); a2['slug'] += '-tameshi'; rest = [x for x in done if x['slug'] != d['slug']]
    sa = set(new.check(copy.deepcopy(a2), rest)) - set(old.check(copy.deepcopy(a2), rest))
    if sa: fueta += 1; print('  ★指摘がふえた', d['slug'], sa)
    for w in new.kyoka_miru(d):
        if w.startswith('処分への答え') or w.startswith('受けていない作業'): print('  ・要確認に出るもの', d['slug'], w)
print('記事', len(done), '本／整形がちがう', chigau, '本／新しい指摘が出た', fueta, '本')
