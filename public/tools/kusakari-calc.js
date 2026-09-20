/*
 * 草刈りの料金めやす（2026-09-19 中元さんの指定どおり）
 *   20㎡まで 8,000円／20㎡をこえたら 1㎡ごとに 400円〜
 *   出張費：富士市・富士宮市・沼津市・裾野市・御殿場市は無料、ほかは 3,000円〜
 *   出し方は「○○円から」（下の金額だけ）
 * 刈った草の運び出しは入れていない（廃棄物の運搬は許可が要るため。袋詰めして置き場にまとめるまで）。
 * <div data-kusakari-calc></div> を置けば、どのページでも出る。
 */
(function () {
  var LINE = 'https://lin.ee/qXlO1gC';
  var FREE = ['富士市', '富士宮市', '沼津市', '裾野市', '御殿場市'];
  var CSS = '.kc{border:1px solid #E2E8F0;border-radius:8px;background:#fff;padding:20px;margin:24px 0;font-size:15px;color:#0f172a;line-height:1.7}' +
    '.kc h3{margin:0 0 4px;font-size:18px}.kc .kc-sub{margin:0 0 16px;font-size:13px;color:#475569}' +
    '.kc label{display:block;font-size:13px;font-weight:700;margin:12px 0 6px;color:#334155}' +
    '.kc .kc-row{display:flex;gap:8px;align-items:center}' +
    '.kc input,.kc select{font:inherit;font-size:16px;border:1px solid #CBD5E1;border-radius:8px;padding:10px 12px;background:#fff;color:#0f172a;width:100%;box-sizing:border-box}' +
    '.kc .kc-row input{max-width:160px}.kc .kc-unit{display:flex;gap:6px}' +
    '.kc .kc-unit button{font:inherit;font-size:14px;border:1px solid #CBD5E1;border-radius:8px;padding:9px 14px;background:#fff;color:#334155;cursor:pointer}' +
    '.kc .kc-unit button[aria-pressed="true"]{border-color:#B45309;background:#FEF3C7;color:#78350F;font-weight:700}' +
    '.kc .kc-out{margin-top:18px;padding:16px;border-radius:8px;background:#F8FAFC;border:1px solid #E2E8F0}' +
    '.kc .kc-price{font-size:30px;font-weight:800;letter-spacing:-.01em;color:#0f172a}.kc .kc-price small{font-size:15px;font-weight:700;margin-left:2px}' +
    '.kc .kc-lines{margin:8px 0 0;padding:0;list-style:none;font-size:13px;color:#475569}.kc .kc-lines li{margin:2px 0}' +
    '.kc .kc-note{margin:12px 0 0;font-size:12px;color:#64748b}' +
    '.kc .kc-line{display:inline-flex;align-items:center;justify-content:center;margin-top:14px;padding:12px 18px;border-radius:8px;background:#0A8138;color:#fff;font-weight:700;text-decoration:none}' +
    '.kc .kc-line:hover{background:#08682D}';

  function yen(n) { return n.toLocaleString('ja-JP'); }

  function mount(el) {
    if (el.getAttribute('data-kc-ready')) return;
    el.setAttribute('data-kc-ready', '1');
    el.innerHTML =
      '<div class="kc" role="group" aria-labelledby="kc-t">' +
      '<h3 id="kc-t">草刈りの料金、めやすを出す</h3>' +
      '<p class="kc-sub">広さと場所を入れると、いくらからかが出ます。</p>' +
      '<label for="kc-area">お庭の広さ</label>' +
      '<div class="kc-row"><input id="kc-area" type="number" inputmode="decimal" min="1" step="1" value="20" aria-describedby="kc-hint">' +
      '<div class="kc-unit" role="group" aria-label="広さの単位"><button type="button" data-u="m2" aria-pressed="true">㎡</button><button type="button" data-u="tsubo" aria-pressed="false">坪</button></div></div>' +
      '<p class="kc-note" id="kc-hint">1坪は約3.3㎡です。だいたいで大丈夫です。</p>' +
      '<label for="kc-city">場所</label>' +
      '<select id="kc-city">' + FREE.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '<option value="other">そのほかの地域</option></select>' +
      '<div class="kc-out" aria-live="polite"><div class="kc-price" id="kc-price"></div><ul class="kc-lines" id="kc-lines"></ul></div>' +
      '<p class="kc-note">草の高さ・量、木の伐採、高い場所、防草シートは、現地で確かめてからお見積りします。刈った草は袋に詰めて、置き場にまとめるところまで入っています。作業で出た草の持ち込みをご希望の場合は、お見積りに含めます（重さに応じて有料）。ご自分で富士市のクリーンセンターへ出せば無料です。</p>' +
      '<a class="kc-line" href="' + LINE + '" target="_blank" rel="noopener">写真を送って、金額を聞いてみる</a>' +
      '</div>';
    if (!document.getElementById('kc-style')) {
      var st = document.createElement('style'); st.id = 'kc-style'; st.textContent = CSS; document.head.appendChild(st);
    }
    var unit = 'm2';
    var area = el.querySelector('#kc-area'), city = el.querySelector('#kc-city');
    var price = el.querySelector('#kc-price'), lines = el.querySelector('#kc-lines');
    function calc() {
      var v = parseFloat(area.value);
      if (!(v > 0)) { price.textContent = '広さを入れてください'; lines.innerHTML = ''; return; }
      var m2 = unit === 'tsubo' ? v * 3.3058 : v;
      m2 = Math.ceil(m2);
      var work = 8000 + Math.max(0, m2 - 20) * 400;
      var free = city.value !== 'other';
      var trip = free ? 0 : 3000;
      price.innerHTML = yen(work + trip) + '<small>円から</small>';
      lines.innerHTML =
        '<li>草刈り（' + yen(m2) + '㎡）：' + yen(work) + '円から</li>' +
        '<li>出張費：' + (free ? '無料' : '3,000円から') + '</li>';
    }
    area.addEventListener('input', calc);
    city.addEventListener('change', calc);
    el.querySelectorAll('.kc-unit button').forEach(function (b) {
      b.addEventListener('click', function () {
        unit = b.getAttribute('data-u');
        el.querySelectorAll('.kc-unit button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        calc();
      });
    });
    calc();
  }

  function run() { document.querySelectorAll('[data-kusakari-calc]').forEach(mount); }
  window.fukkaruKusakariCalc = run;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
