/*
 * 空き家のセルフチェック（2026-11-19 中元さん「最初の三つから作っていく」）
 *   国土交通省の「空き家管理チェックリスト」の考え方をもとに、10問に絞った。
 *   当てはまるものを押すと、空き家調査で見る所が出る。結果はこの画面の中だけで使い、どこにも送らない。
 *   不安をあおる言い方（税・罰・倒壊）はしない。料金は書かない（料金は柱のページの本文に書く）。
 * <div data-akiya-check></div> を置けば、どのページでも出る。
 */
(function () {
  var LINE = 'https://lin.ee/Bh5gFU6';
  var Q = [
    ['最後に見に行ってから、3か月以上たっている', '外まわり全体と、郵便受け・戸締まり'],
    ['郵便受けに、チラシや郵便物がたまっていそう', '郵便受けの様子'],
    ['庭の草木が伸びて、道路やお隣にかかっていそう', '庭木・雑草の伸び具合と、道路・お隣へのはみ出し'],
    ['屋根・雨どい・外壁の傷みが気になる', '地上から見える屋根・雨どい・外壁'],
    ['台風や大雨のあと、見に行けていない', '風雨のあとの破損や、飛んできた物'],
    ['窓や戸締まりを、しばらく確かめていない', '窓・扉の戸締まり'],
    ['室内の換気や水道の通水を、半年以上していない', '室内の換気・通水と、におい・カビ（入れる場合）'],
    ['雨漏りのしみやカビが心配', '見える範囲の雨漏り跡・カビ（入れる場合）'],
    ['ご近所から、連絡や心配の声をもらったことがある', 'ご近所にかかわる所（草木・ごみ・はみ出し）'],
    ['これからどうするか（住む・貸す・売る・残す）まだ決めていない', '今の状態をまとめた写真の記録（決めるときの材料に）']
  ];
  var CSS = '.akc{border:1px solid #E2E8F0;border-radius:8px;background:#fff;padding:20px;margin:24px 0;font-size:15px;color:#0f172a;line-height:1.7}' +
    '.akc ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}' +
    '.akc .akc-q{width:100%;min-height:48px;display:flex;align-items:center;gap:12px;text-align:left;padding:10px 14px;border:1px solid #CBD5E1;border-radius:8px;background:#fff;color:#0f172a;font:inherit;font-size:15px;line-height:1.6;cursor:pointer;touch-action:manipulation}' +
    '.akc .akc-q[aria-pressed="true"]{border-color:#B45309;background:#FEF3C7}' +
    '.akc .akc-box{flex-shrink:0;width:22px;height:22px;border-radius:6px;border:1.5px solid #94A3B8;display:grid;place-items:center;color:#fff;font-size:14px;font-weight:800;line-height:1}' +
    '.akc .akc-q[aria-pressed="true"] .akc-box{background:#B45309;border-color:#B45309}' +
    '.akc .akc-out{margin-top:18px;padding:16px;border-radius:8px;background:#F8FAFC;border:1px solid #E2E8F0}' +
    '.akc .akc-n{font-size:30px;font-weight:800;font-variant-numeric:tabular-nums}.akc .akc-n small{font-size:14px;font-weight:600;color:#475569;margin-left:6px}' +
    '.akc .akc-msg{margin:4px 0 0;font-weight:700}' +
    '.akc .akc-look{margin:10px 0 0;padding:0 0 0 1.2em;list-style:disc;display:block;font-size:14px;color:#334155}.akc .akc-look li{margin:2px 0}' +
    '.akc .akc-btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}' +
    '.akc .akc-copy{font:inherit;font-size:14px;font-weight:700;min-height:48px;padding:10px 16px;border:1px solid #0A8138;border-radius:8px;background:#fff;color:#0A8138;cursor:pointer}' +
    '.akc .akc-line{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:10px 18px;border-radius:8px;background:#0A8138;color:#fff;font-weight:700;text-decoration:none}' +
    '.akc .akc-line:hover{background:#08682D}' +
    '.akc .akc-note{margin:10px 0 0;font-size:12px;color:#64748b}';

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function mount(root) {
    if (root.getAttribute('data-ready')) return;
    root.setAttribute('data-ready', '1');
    var on = Q.map(function () { return false; });
    var box = el('div', 'akc');
    var ul = el('ul');
    var buttons = Q.map(function (item, i) {
      var li = el('li'); var b = el('button', 'akc-q'); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      var mark = el('span', 'akc-box'); mark.setAttribute('aria-hidden', 'true');
      b.appendChild(mark); b.appendChild(el('span', null, item[0]));
      b.addEventListener('click', function () { on[i] = !on[i]; render(); });
      li.appendChild(b); ul.appendChild(li); return b;
    });
    var out = el('div', 'akc-out'); out.setAttribute('aria-live', 'polite');
    box.appendChild(ul); box.appendChild(out);
    root.appendChild(box);
    var status = '';

    function picked() { return Q.filter(function (_, i) { return on[i]; }); }
    function text() {
      var p = picked();
      return '【空き家調査の相談】\n物件のある市町村：\nセルフチェックで当てはまったこと：\n' +
        (p.length ? p.map(function (x) { return '・' + x[0]; }).join('\n') : '・（なし）') +
        '\n鍵のお預かり：できる／できない／未定\n希望の時期：';
    }
    function render() {
      buttons.forEach(function (b, i) { b.setAttribute('aria-pressed', on[i] ? 'true' : 'false'); b.firstChild.textContent = on[i] ? '✓' : ''; });
      var p = picked(), n = p.length;
      var msg = n === 0 ? '当てはまるものを押すと、調査で見る所が出ます。'
        : n <= 3 ? '気になる所があります。調査では、次の所を見てご報告します。'
        : '見ておきたい所がいくつかあります。早めに一度、様子を見ておくと安心です。';
      out.textContent = '';
      var num = el('div', 'akc-n', String(n)); num.appendChild(el('small', null, '/ 10 当てはまる'));
      out.appendChild(num); out.appendChild(el('p', 'akc-msg', msg));
      if (n) {
        var looks = []; p.forEach(function (x) { if (looks.indexOf(x[1]) < 0) looks.push(x[1]); });
        var lu = el('ul', 'akc-look'); looks.forEach(function (t) { lu.appendChild(el('li', null, t)); }); out.appendChild(lu);
      }
      var btns = el('div', 'akc-btns');
      var copy = el('button', 'akc-copy', status === 'ok' ? '相談文をコピーしました' : 'この結果で相談文をコピー'); copy.type = 'button';
      copy.addEventListener('click', function () {
        var t = text();
        var done = function () { status = 'ok'; render(); };
        var fail = function () { status = 'ng'; render(); };
        try { navigator.clipboard.writeText(t).then(done, fail); } catch (e) { fail(); }
      });
      var line = el('a', 'akc-line', 'LINEで空き家調査を相談'); line.href = LINE; line.target = '_blank'; line.rel = 'noopener noreferrer';
      btns.appendChild(copy); btns.appendChild(line); out.appendChild(btns);
      out.appendChild(el('p', 'akc-note', status === 'ng' ? 'コピーできない場合は、当てはまった項目をそのままLINEでお送りください。'
        : status === 'ok' ? 'LINEを開いて貼り付けてください。' : '結果はこの画面の中だけで使い、どこにも送りません。'));
    }
    render();
  }

  function start() {
    if (!document.getElementById('akc-css')) { var s = document.createElement('style'); s.id = 'akc-css'; s.textContent = CSS; document.head.appendChild(s); }
    var list = document.querySelectorAll('[data-akiya-check]');
    for (var i = 0; i < list.length; i++) mount(list[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.akiyaCheckMount = start;
})();
