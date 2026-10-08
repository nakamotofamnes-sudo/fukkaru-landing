// 仕事場（room.glb）を、いまの仕事の形に並べ直す（2026-10-08）。
// 形を作り替えるものは無い。位置・向き・色と、画面に映す絵、小さな置きものだけをページの側で決める。
// 4つの画面は、ページの「ご相談内容」の4つと同じ：
//   右のモニター＝管理画面／左のモニター＝AIと書く画面／ノートパソコン＝ホームページ／丸テーブルのタブレット＝地図
// 向きの約束：scene.js が部屋を180度回して置く。部品を動かすときは「見る人から見た向き」で書き、置くときに符号を返す。
// 新しく足すものは stage（見る人から見た向きのままの入れ物）に入れる。
import * as THREE from 'three';
import { KEYBOARD } from './anim.js?v=20261008-5';

const C = { navy: '#10253a', deep: '#0b1a28', panel: '#16324a', line: '#2b4a64', cream: '#f4efe6', paper: '#f7f1e8', ink: '#1c1c1a', orange: '#f47c35', cyan: '#67dbea', yellow: '#f2b233', mute: '#8fa3b5' };
const TAU = Math.PI * 2;

function rr(ctx, x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }   // 古いブラウザでは角を丸めない
function bar(ctx, x, y, w, h, color) { ctx.fillStyle = color; rr(ctx, x, y, w, h, h / 2); ctx.fill(); }

// 管理画面：問い合わせ・投稿・数字の動きを、1つの画面で見る（数字そのものは描かない）
function drawDashboard(ctx, w, h, t) {
  ctx.fillStyle = C.navy; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = C.deep; ctx.fillRect(0, 0, 52, h);
  for (let i = 0; i < 5; i++) { ctx.fillStyle = i === 1 ? C.orange : C.line; ctx.beginPath(); ctx.arc(26, 40 + i * 44, i === 1 ? 9 : 7, 0, TAU); ctx.fill(); }
  bar(ctx, 76, 22, 150, 14, C.cream); bar(ctx, w - 110, 20, 84, 18, C.panel);
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(w - 96, 29, 4 + Math.sin(t * 3) * 1.2, 0, TAU); ctx.fill();
  for (let i = 0; i < 3; i++) {
    const x = 76 + i * 142;
    ctx.fillStyle = C.panel; rr(ctx, x, 54, 128, 70, 10); ctx.fill();
    bar(ctx, x + 14, 68, 54, 8, C.mute); bar(ctx, x + 14, 88, 40 + i * 14, 18, C.cream);
    ctx.strokeStyle = i === 2 ? C.orange : C.cyan; ctx.lineWidth = 3; ctx.beginPath();
    for (let k = 0; k < 6; k++) ctx.lineTo(x + 76 + k * 8, 108 - [3, 8, 6, 12, 10, 16][(k + i) % 6]);
    ctx.stroke();
  }
  // 折れ線：線が左から伸びていき、先に点が灯る
  const gx = 76, gy = 142, gw = 268, gh = 138, pts = [.18, .3, .26, .44, .4, .58, .55, .74, .82];
  ctx.fillStyle = C.panel; rr(ctx, gx, gy, gw, gh, 10); ctx.fill();
  ctx.strokeStyle = C.line; ctx.lineWidth = 1; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(gx + 14, gy + gh * i / 4); ctx.lineTo(gx + gw - 14, gy + gh * i / 4); ctx.stroke(); }
  const grow = Math.min(1, (t % 9) / 2.4), last = (pts.length - 1) * grow, px = i => gx + 22 + i * (gw - 44) / (pts.length - 1), py = v => gy + gh - 18 - v * (gh - 40);
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
  let ex = px(0), ey = py(pts[0]);
  for (let i = 0; i <= Math.floor(last); i++) { ex = px(i); ey = py(pts[i]); ctx.lineTo(ex, ey); }
  const f = last - Math.floor(last); if (f > 0) { const i = Math.floor(last); ex = px(i) + (px(i + 1) - px(i)) * f; ey = py(pts[i]) + (py(pts[i + 1]) - py(pts[i])) * f; ctx.lineTo(ex, ey); }
  ctx.stroke();
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(ex, ey, 6 + Math.sin(t * 4) * 1.5, 0, TAU); ctx.fill();
  // 右の一覧：済んだものに印
  ctx.fillStyle = C.panel; rr(ctx, 358, 142, w - 358 - 22, gh, 10); ctx.fill();
  for (let i = 0; i < 4; i++) {
    const y = 162 + i * 30, done = i < 2 + (Math.floor(t / 3) % 2);
    ctx.strokeStyle = done ? C.cyan : C.line; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(378, y + 6, 8, 0, TAU); ctx.stroke();
    if (done) { ctx.beginPath(); ctx.moveTo(374, y + 6); ctx.lineTo(377, y + 9); ctx.lineTo(383, y + 2); ctx.stroke(); }
    bar(ctx, 396, y + 1, [70, 54, 82, 60][i], 10, done ? C.mute : C.cream);
  }
}

// 書く画面：左にコード、右にAIとのやりとり。typed＝打ち進んだ度合い
function drawEditor(ctx, w, h, t, typed) {
  ctx.fillStyle = '#0d1b2a'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = C.deep; ctx.fillRect(0, 0, w, 26);
  for (let i = 0; i < 3; i++) { ctx.fillStyle = [C.orange, C.yellow, C.cyan][i]; ctx.beginPath(); ctx.arc(18 + i * 16, 13, 4.5, 0, TAU); ctx.fill(); }
  bar(ctx, 90, 8, 80, 10, C.line); bar(ctx, 180, 8, 60, 10, C.panel);
  const lines = [[0, 96, C.orange], [1, 150, C.cyan], [1, 84, C.cream], [2, 132, C.cyan], [2, 70, C.yellow], [1, 46, C.cream], [0, 22, C.orange], [0, 0, ''], [0, 118, C.orange], [1, 164, C.cream], [1, 92, C.cyan], [2, 108, C.cream], [0, 22, C.orange]];
  const total = lines.reduce((sum, l) => sum + l[1], 0), split = Math.round(w * .58);
  let left = total * (.42 + .58 * typed), cx = 0, cy = 0;
  lines.forEach(([indent, len, color], i) => {
    const y = 44 + i * 19; bar(ctx, 10, y + 2, 12, 7, C.line);
    const shown = Math.max(0, Math.min(len, left)); left -= len;
    if (shown > 0) { bar(ctx, 36 + indent * 20, y, shown, 10, color); cx = 36 + indent * 20 + shown + 5; cy = y - 2; }
  });
  if (Math.floor(t * 2.4) % 2 === 0) { ctx.fillStyle = C.cream; ctx.fillRect(cx, cy, 6, 14); }
  // 右：AIとのやりとり
  ctx.fillStyle = C.deep; ctx.fillRect(split, 26, w - split, h - 26);
  const bx = split + 14, bw = w - split - 28;
  ctx.fillStyle = C.panel; rr(ctx, bx + 36, 40, bw - 36, 40, 12); ctx.fill(); bar(ctx, bx + 50, 52, bw - 80, 8, C.cream); bar(ctx, bx + 50, 66, bw - 120, 8, C.mute);
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(bx + 12, 108, 10, 0, TAU); ctx.fill();
  ctx.fillStyle = '#132b40'; rr(ctx, bx + 30, 94, bw - 40, 74, 12); ctx.fill();
  [bw - 70, bw - 96, bw - 60, bw - 130].forEach((len, i) => bar(ctx, bx + 44, 106 + i * 14, len, 8, i === 3 ? C.cyan : C.mute));
  ctx.fillStyle = C.panel; rr(ctx, bx + 60, 182, bw - 60, 30, 12); ctx.fill(); bar(ctx, bx + 74, 193, bw - 110, 8, C.cream);
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(bx + 12, 240, 10, 0, TAU); ctx.fill();
  for (let i = 0; i < 3; i++) { ctx.fillStyle = C.mute; ctx.globalAlpha = .35 + .65 * Math.max(0, Math.sin(t * 5 - i * .9)); ctx.beginPath(); ctx.arc(bx + 44 + i * 16, 240, 5, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  ctx.fillStyle = C.navy; rr(ctx, bx, h - 40, bw, 26, 13); ctx.fill(); bar(ctx, bx + 14, h - 31, 90, 8, C.line);
}

// ホームページ：このページそのものを、小さく
function drawSite(ctx, w, h) {
  ctx.fillStyle = C.cream; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff'; rr(ctx, w / 2 - 70, 14, 140, 24, 12); ctx.fill(); for (let i = 0; i < 3; i++) bar(ctx, w / 2 - 52 + i * 40, 23, 24, 6, C.ink);
  ctx.fillStyle = C.ink; rr(ctx, w - 96, 14, 78, 24, 12); ctx.fill(); bar(ctx, 20, 22, 46, 8, C.ink);
  ctx.fillStyle = C.ink; rr(ctx, 30, 78, 116, 46, 6); ctx.fill(); rr(ctx, 30, 134, 116, 46, 6); ctx.fill();
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(162, 170, 9, 0, TAU); ctx.fill();
  ctx.fillStyle = C.navy; rr(ctx, 30, 198, 92, 18, 4); ctx.fill(); bar(ctx, 30, 228, 120, 8, C.ink); bar(ctx, 30, 244, 150, 8, C.ink);
  [['#f0d48a', 118], ['#f3dfb0', 92], ['#f6a561', 62]].forEach(([color, r]) => { ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(w - 120, 214, r, r * .42, 0, 0, TAU); ctx.fill(); });
  ctx.fillStyle = '#2c6f7c'; rr(ctx, w - 132, 136, 24, 44, 8); ctx.fill(); ctx.fillStyle = '#e8c3a0'; ctx.beginPath(); ctx.arc(w - 120, 124, 11, 0, TAU); ctx.fill();
  ctx.fillStyle = '#3a3a38'; rr(ctx, w - 130, 178, 20, 34, 5); ctx.fill();
}

// 地図：お店の場所に印。検索の窓と、下に案内の札
function drawMap(ctx, w, h) {
  ctx.fillStyle = '#e4ecdf'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#cfe3ee'; ctx.beginPath(); ctx.moveTo(0, h * .7); ctx.bezierCurveTo(w * .3, h * .55, w * .5, h * .95, w, h * .72); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
  ctx.fillStyle = '#d6e2cc'; [[40, 70, 110, 70], [250, 60, 120, 60], [70, 180, 90, 50], [300, 160, 100, 70]].forEach(([x, y, a, b]) => { rr(ctx, x, y, a, b, 8); ctx.fill(); });
  ctx.strokeStyle = '#fff'; ctx.lineCap = 'round';
  [[14, 0, 150, 170, 150, h], [10, 0, 110, w, 150], [10, 210, 0, 230, h], [8, 0, 230, w, 200]].forEach(([lw, ...p]) => { ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); ctx.stroke(); });
  ctx.fillStyle = '#fff'; rr(ctx, 18, 16, w - 36, 34, 17); ctx.fill(); ctx.strokeStyle = C.mute; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(40, 32, 7, 0, TAU); ctx.stroke(); bar(ctx, 58, 28, 120, 9, '#c9d2d9');
  const px = w * .56, py = h * .5;
  ctx.fillStyle = 'rgba(244,124,53,.22)'; ctx.beginPath(); ctx.arc(px, py + 34, 30, 0, TAU); ctx.fill();
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(px, py, 22, Math.PI * .85, Math.PI * .15); ctx.lineTo(px, py + 36); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px, py, 8, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff'; rr(ctx, 18, h - 74, w - 36, 58, 12); ctx.fill(); bar(ctx, 34, h - 60, 130, 11, C.ink); bar(ctx, 34, h - 40, 190, 8, '#c9d2d9');
  ctx.fillStyle = C.orange; rr(ctx, w - 96, h - 58, 62, 26, 13); ctx.fill();
}

// 壁のボード：4つを輪でつないで回す（点が、線になり、仕組みになる）。左は、毎日やることの覚え書き
function drawBoard(ctx, w, h) {
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#e3dccf'; ctx.lineWidth = 10; ctx.strokeRect(5, 5, w - 10, h - 10);
  const font = (px, weight = 700) => { ctx.font = `${weight} ${px}px "Hiragino Sans","Hiragino Kaku Gothic ProN","Noto Sans JP","Yu Gothic",sans-serif`; };
  ctx.fillStyle = C.ink; font(34); ctx.textBaseline = 'middle'; ctx.fillText('毎日、回す', 52, 66);
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(244, 70, 8, 0, TAU); ctx.fill();
  for (let i = 0; i < 4; i++) {
    const y = 132 + i * 54; ctx.strokeStyle = C.ink; ctx.lineWidth = 5; rr(ctx, 56, y, 30, 30, 6); ctx.stroke();
    if (i < 3) { ctx.strokeStyle = C.orange; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(62, y + 15); ctx.lineTo(70, y + 24); ctx.lineTo(88, y + 2); ctx.stroke(); }
    bar(ctx, 104, y + 8, [150, 118, 136, 96][i], 13, i < 3 ? '#b9b3a8' : C.ink);
  }
  // 輪：角の4か所に付せんを貼る（付せんは3Dの部品。ここには線と名前だけ描く）
  const x0 = 470, x1 = 1010, y0 = 150, y1 = 420;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.setLineDash([2, 18]); ctx.lineCap = 'round'; rr(ctx, x0, y0, x1 - x0, y1 - y0, 60); ctx.stroke(); ctx.setLineDash([]);
  const arrow = (x, y, a) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-10, -13); ctx.lineTo(-10, 13); ctx.fill(); ctx.restore(); };
  arrow((x0 + x1) / 2, y0, 0); arrow(x1, (y0 + y1) / 2, Math.PI / 2); arrow((x0 + x1) / 2, y1, Math.PI); arrow(x0, (y0 + y1) / 2, -Math.PI / 2);
  ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(x0 + 150, y0, 14, 0, TAU); ctx.fill();
  ctx.fillStyle = C.ink; font(27); ctx.textAlign = 'center';
  [['ホームページ', x0, y0 - 92], ['検索・地図', x1, y0 - 92], ['SNS・ブログ', x1, y1 + 96], ['管理画面', x0, y1 + 96]].forEach(([label, x, y]) => ctx.fillText(label, x, y));
  ctx.textAlign = 'left';
}

// 棚の上の額：資格の証書（文字は線で。中身は書かない）
function drawFrame(ctx, w, h, i) {
  ctx.fillStyle = '#fbf8f1'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.strokeRect(14, 14, w - 28, h - 28); ctx.lineWidth = 2; ctx.strokeRect(24, 24, w - 48, h - 48);
  bar(ctx, w / 2 - 44, 52, 88, 12, C.navy);
  [0, 1, 2, 3].forEach(k => bar(ctx, 44, 92 + k * 22, w - 88 - (k === 3 ? 50 : (k * 9 + i * 7) % 26), 7, '#b9b3a8'));
  ctx.fillStyle = [C.orange, '#c9483a', C.orange][i]; ctx.beginPath(); ctx.arc(w - 58, h - 62, 20, 0, TAU); ctx.fill();
  bar(ctx, 44, h - 60, 70, 8, C.navy);
}

export function setupOffice(roomModel) {
  roomModel.updateMatrixWorld(true);
  const part = name => roomModel.getObjectByName(name);
  // 名前の頭が合う部品をひとまとめにする（まとめて動かす・回すため）
  const gather = (pattern, pivot = [0, 0, 0]) => {
    const g = new THREE.Group();
    g.position.set(-pivot[0], pivot[1], -pivot[2]);
    roomModel.add(g);
    g.updateMatrixWorld(true);
    for (const o of [...roomModel.children]) if (o !== g && pattern.test(o.name)) g.attach(o);
    return g;
  };
  // 見る人から見て 右へ dx・手前へ dz・上へ dy 動かす
  const move = (g, dx, dz, dy = 0) => { g.position.x -= dx; g.position.z -= dz; g.position.y += dy; };

  // ── 並べ直し ──
  // 机：立っている人の真後ろへ。キーボードが、打つ手の位置（anim.js の KEYBOARD）に来るように寄せる
  const keyboard = part('keyboard');
  const desk = gather(/^(desk_|keyboard|mouse|laptop_|mon|code\d|lamp_|mug|notebook|pen)/);
  move(desk, keyboard.position.x, KEYBOARD.z + keyboard.position.z);
  // マウスは、机に向かったときの右手の側へ
  part('mouse').position.x = keyboard.position.x - .36;
  // 椅子：立ち上がって横へ押しやった位置に
  const chair = gather(/^chair/, [-1, 0, -.55]);
  move(chair, -.2, .5);
  chair.rotation.y = .9;
  // ボード：モニターに隠れないよう、少し上・少し左へ。付せんは輪の四隅と、覚え書きの横へ貼り直す
  const board = part('board'), bx = board.position.x, by = board.position.y;
  const wall = gather(/^(board|note\d|bar\d)/);
  [[-.1625, .2125], [.5125, .2125], [.5125, -.125], [-.1625, -.125], [-.40, -.27], [-.30, -.21]].forEach(([u, v], i) => { const n = part('note' + i); n.position.x = bx - u; n.position.y = by + v; n.rotation.z = [.05, -.04, .03, -.06, .08, -.1][i]; n.scale.x = n.scale.y = i < 4 ? .15 : .1; });
  [0, 1, 2, 3].forEach(i => { const b = part('bar' + i), tall = [.06, .1, .08, .14][i]; b.scale.set(.035, tall, .01); b.position.x = bx + .67 - i * .05; b.position.y = by - .35 + tall / 2; });
  move(wall, -.15, .12, .2);
  // 棚：大きな箱を小さくして、空いた所に「動かしっぱなしの小さな機械」を置く
  const box = part('binder_box'); box.scale.x = .2; box.position.x -= .12;

  // ── 画面に絵を映す ──
  for (const o of [...desk.children]) if (/^code\d/.test(o.name)) o.visible = false;   // 元の「線だけのコード」は、絵に置きかえる
  const screens = [];
  function screen(host, w, h, draw, face = 'front') {
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d'), tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
    // 部品の面から1.5mm浮かせる（ぴったり重ねると、遠くから見たときに ちらつく）
    if (face === 'front') { mesh.rotation.y = Math.PI; mesh.position.z = -.5 - .0015 / host.scale.z; }             // 画面は、部品の手前の面
    else { mesh.rotation.set(-Math.PI / 2, 0, Math.PI); mesh.position.y = .5 + .0015 / host.scale.y; }             // 上の面（寝かせたタブレット）
    host.add(mesh);
    const s = { ctx, tex, w, h, draw, redraw(...args) { draw(ctx, w, h, ...args); tex.needsUpdate = true; } };
    s.redraw(5, .6); screens.push(s);   // 動きを止めている人にも、描き上がった絵を見せる
    return s;
  }
  const dash = screen(part('mon_screen0'), 512, 296, drawDashboard);
  const editor = screen(part('mon_screen1'), 512, 296, drawEditor);
  screen(part('laptop_scr'), 448, 276, drawSite);
  screen(part('tablet_scr'), 384, 262, drawMap, 'top');
  { const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 640; drawBoard(canvas.getContext('2d'), 1200, 640);
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ map: tex, roughness: .9, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    face.rotation.y = Math.PI; face.position.z = -.5 - .0015 / board.scale.z; face.receiveShadow = true; board.add(face); }

  // ── 足すもの（見る人から見た向きで置く） ──
  const stage = new THREE.Group(); stage.rotation.y = Math.PI; roomModel.add(stage);
  const solid = (geometry, color, opts = {}) => { const m = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: .7, ...opts })); m.castShadow = m.receiveShadow = true; return m; };
  // 棚の中段：動かしっぱなしの小さな機械（灯りが、ゆっくり点滅する）
  const machine = new THREE.Group(); machine.position.set(1.37, .57, -.6); stage.add(machine);
  const body = solid(new THREE.BoxGeometry(.2, .2, .26), '#1b2330'); body.position.y = .1; machine.add(body);
  const slit = solid(new THREE.BoxGeometry(.15, .012, .01), '#3a4658'); slit.position.set(0, .15, .131); machine.add(slit);
  const lamps = [C.cyan, C.cyan, C.orange].map((color, i) => { const l = new THREE.Mesh(new THREE.SphereGeometry(.011, 12, 8), new THREE.MeshBasicMaterial({ color })); l.position.set(-.055 + i * .03, .05, .132); machine.add(l); return l; });
  // 棚の上：額を3つ（資格の証書）
  [[1.42, .2, .26, .1], [1.66, .17, .22, -.06], [1.88, .19, .25, .05]].forEach(([x, fw, fh, turn], i) => {
    const frame = new THREE.Group(); frame.position.set(x, 1.5, -.66); frame.rotation.set(-.2, turn, 0); stage.add(frame);
    const edge = solid(new THREE.BoxGeometry(fw, fh, .016), i === 1 ? '#3a2c22' : C.navy); edge.position.y = fh / 2; frame.add(edge);
    const canvas = document.createElement('canvas'); canvas.width = 200; canvas.height = Math.round(200 * fh / fw); drawFrame(canvas.getContext('2d'), canvas.width, canvas.height, i);
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(fw - .028, fh - .028), new THREE.MeshStandardMaterial({ map: tex, roughness: .8 })); sheet.position.set(0, fh / 2, .0085); frame.add(sheet);
  });
  // 机の左：スマホ（SNSの投稿が並ぶ）
  { const phone = new THREE.Group(); phone.position.set(-.33, .786, KEYBOARD.z + .06); phone.rotation.set(-1.0, .35, 0); stage.add(phone);
    const shell = solid(new THREE.BoxGeometry(.075, .15, .009), '#16181d'); shell.position.y = .075; phone.add(shell);
    const canvas = document.createElement('canvas'); canvas.width = 150; canvas.height = 300; const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 150, 300); ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(24, 26, 12, 0, TAU); ctx.fill(); bar(ctx, 44, 20, 70, 10, C.ink);
    [C.cyan, C.orange, C.yellow, '#2c6f7c', C.cream, C.orange, C.yellow, C.cyan, '#2c6f7c'].forEach((color, i) => { ctx.fillStyle = color; rr(ctx, 8 + (i % 3) * 46, 56 + Math.floor(i / 3) * 46, 42, 42, 5); ctx.fill(); });
    bar(ctx, 12, 210, 110, 9, C.ink); bar(ctx, 12, 228, 84, 8, '#c9d2d9'); bar(ctx, 12, 262, 126, 22, C.navy);
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(.067, .14), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); face.position.set(0, .075, .0052); phone.add(face);
    const prop = solid(new THREE.BoxGeometry(.05, .012, .06), '#b9bec4'); prop.position.set(-.33, .792, KEYBOARD.z + .03); stage.add(prop); }

  // 動く絵は、1秒に8回だけ描き直す（止めているあいだ・紺の場面では描かない）。typing＝机で打っている最中か
  let last = -1, typed = 0;
  function update(time, { typing = false, visible = true } = {}) {
    if (!visible || time - last < .125) return;
    const dt = last < 0 ? 0 : Math.min(.5, time - last); last = time;
    typed = typing ? (typed + dt * .16) % 1 : typed;
    dash.redraw(time, 0);
    editor.redraw(time, typed);
    lamps.forEach((l, i) => { l.visible = Math.sin(time * (2.2 + i * .9) + i * 2) > -.55; });
  }
  return { desk, chair, wall, stage, update };
}
