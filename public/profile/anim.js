// 人物の動きを、ページの側で組み立てる（2026-10-08）。
// avatar.glb に入っている Idle / Nod / Wave は使わず、ここで作った動きに差し替える。
// 確かめ方：~/.fukkaru/satsuei/3d/seq.py（時刻を指定してコマに並べ、手足の速さを数える）
//
// 書き方の約束
// ・姿勢は「休みの姿勢から、体の向き（x=本人の左・y=上・z=正面）で何度回すか」で書く。親が回れば、子の軸も一緒に回る。
// ・位置はメートル。原点は足もとの真ん中（scene.js の avatar の中）。
// ・腕は、読み込んだ直後に fixArms で作り直してから動かす（そのままでは、二の腕を20度あまり上げると袖の付け根が裂ける）。
// ・足は床に置いた位置から逆算して脚を曲げる（体を揺らしても、足がすべらない）。
import * as THREE from 'three';

const DEG = Math.PI / 180;
const AXIS = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };
const ID = new THREE.Quaternion();
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const Q = () => new THREE.Quaternion();
const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = n => { n = clamp(n); return n * n * (3 - 2 * n); };                                   // ゆっくり出て、ゆっくり止まる
const io = n => { n = clamp(n); return n < .5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2; }; // 出入りをもう少し強く
const bump = (t, a, b) => Math.sin(Math.PI * seg(t, a, b));                                      // 0 → 1 → 0
const axisQ = (v, deg) => Q().setFromAxisAngle(v, deg * DEG);

// R('x', -40, 'z', 10)＝体の向きの x 軸で -40度 回し、そのあと z 軸で 10度 回す
export function R(...parts) {
  const q = Q();
  for (let i = 0; i < parts.length; i += 2) q.premultiply(Q().setFromAxisAngle(AXIS[parts[i]], parts[i + 1] * DEG));
  return q;
}

// ─────────── 腕の作り直し（読み込んだ直後に1回だけ） ───────────
// この3Dは、腕の骨がまっすぐ体の横（前後のまん中）に置いてあるのに、腕そのものは6〜8cm後ろにある。
// そのため、ひじも肩も「腕の外」を軸に曲がっていた。関節を腕のまん中へ置き直す。
// 肩は、袖がそっくり二の腕について動く作りで、しかも袖と胴が、わきの前と後ろで縫い合わされていなかった
// （20度あまり上げると付け根が裂け、口が開いて中が見える）。縫い合わせて、胴から腕へなだらかに移るように付け直し、
// あいだに補助の骨（armfix）を1本はさむ。
// 付け直しの計算は重い（このMacで0.7秒）。結果を armfix.bin に控えてあり、ページはそれを読むだけ。
// avatar.glb を作り替えたら、控えも作り直す（/fukkaru-3d の手順）。控えが合わないときは、その場で計算する。
const JOINT = { C: [.195, 1.335, -.062], E: [.248, 1.080, -.081], W: [.252, .792, .027] };   // 肩・ひじ・手首（左。右は x を返す）
const ARM_BONES = ['upperarm', 'elbowfix', 'forearm', 'hand'];
// 混ざる幅（メートル）。SLEEVE_FROM＝肩のまん中から腕に沿ってこの先は、袖がそっくり腕につく（筒のまま上がる）。
// TORSO_FROM＝わきの下で、肩のまん中からこの先は胴のまま。広く混ぜると、腕を上げたとき胴の脇まで外へ張り出して体が三角に見える
const SLEEVE_FROM = .08, TORSO_FROM = .215;
export function fixArms(root, patchData, { knots = [.22, .58] } = {}) {
  root.updateWorldMatrix(true, true);
  const av = root.parent.matrixWorld, toAv = av.clone().invert(), bone = {}, meshes = [];
  root.traverse(o => { if (o.isBone) bone[o.name] = o; if (o.isSkinnedMesh) meshes.push(o); });
  if (bone.armfixR) return null;
  const before = new Map(Object.values(bone).map(b => [b, b.matrixWorld.clone()]));
  const place = (b, p) => { b.position.copy(b.parent.worldToLocal(p.clone().applyMatrix4(av))); b.updateWorldMatrix(false, true); };
  const J = {};
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    const j = J[s] = Object.fromEntries(Object.entries(JOINT).map(([k, p]) => [k, V(p[0] * sx, p[1], p[2])]));
    place(bone['upperarm' + s], j.C); place(bone['forearm' + s], j.E); place(bone['elbowfix' + s], j.E); place(bone['hand' + s], j.W);
    const up = bone['upperarm' + s], fix = new THREE.Bone();
    fix.name = 'armfix' + s; fix.position.copy(up.position); fix.quaternion.copy(up.quaternion);
    up.parent.add(fix); fix.updateWorldMatrix(false, false); bone[fix.name] = fix;
  }
  // 骨を動かしても、休みの姿勢の形は変えない（逆行列を、動かしたぶんだけ直す）
  const done = new Set();
  for (const mesh of meshes) {
    const sk = mesh.skeleton; if (done.has(sk)) continue; done.add(sk);
    sk.bones.forEach((b, i) => { sk.boneInverses[i] = b.matrixWorld.clone().invert().multiply(before.get(b)).multiply(sk.boneInverses[i]); });
    for (const s of ['L', 'R']) { sk.bones.push(bone['armfix' + s]); sk.boneInverses.push(sk.boneInverses[sk.bones.indexOf(bone['upperarm' + s])].clone()); }
    sk.boneMatrices = new Float32Array(sk.bones.length * 16);
    if (sk.boneTexture) sk.boneTexture.dispose();
    sk.boneTexture = null;
  }
  // 内張り（torso_fill）は、わきの穴を隠すための当て布だった。縫い合わせたので外す
  let result = null;
  for (const mesh of meshes) {
    if (mesh.name === 'torso_fill') { mesh.removeFromParent(); continue; }
    const m = readMesh(mesh, toAv);
    let patch = patchData && decodePatch(patchData, m.n);
    const computed = !patch;
    if (!patch) patch = computePatch(m, J, knots);
    applyPatch(mesh, m, patch, J);
    result = { patch, computed };
  }
  return result;
}

// 頂点ごとの「どの骨について動くか」と、休みの姿勢での位置（足もとの真ん中から・メートル）を読む
function readMesh(mesh, toAv) {
  const g = mesh.geometry, sk = mesh.skeleton, n = g.attributes.position.count, names = sk.bones.map(b => b.name);
  const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4), P = new Float32Array(n * 3), raw = new Float32Array(n * 3), v = V();
  const M = toAv.clone().multiply(sk.bones[0].matrixWorld).multiply(sk.boneInverses[0]);
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < 4; k++) { si[i * 4 + k] = g.attributes.skinIndex.getComponent(i, k); sw[i * 4 + k] = g.attributes.skinWeight.getComponent(i, k); }
    v.fromBufferAttribute(g.attributes.position, i).toArray(raw, i * 3);   // raw＝頂点の入れ物の中の位置（整数に詰めたものを戻した値）
    v.applyMatrix4(M); P[i * 3] = v.x; P[i * 3 + 1] = v.y; P[i * 3 + 2] = v.z;
  }
  return { g, n, names, si, sw, P, raw, M };
}

// 肩の作り直しを計算する（重い）。返すのは「変わる頂点の重み」「取りのぞく面」「足す面（わきの下）」
// ① わきの下を張り直す。この3Dは、袖と胴が前後2本の切れ目で分かれていて、下の端（袖口の高さ）だけ橋のようにつながっている。
//    袖の内側の面も、胴の脇の面も無い（腕を下ろした姿では、すき間に隠れて見えない）。
//    橋を切り、袖の内側（半分の筒）と胴の脇（壁）を張る。2枚は、肩のまん中の高さの折り目でつながり、本のように開く。
//    （2026-10-08 中元さんの見本：袖は腕に沿った筒のまま上がり、胴とのあいだに膜が張らない）
// ② 胴＝0・腕＝1 と決まっている所を固定し、あいだ（肩の上と、折り目のまわり）を面づたいに、なだらかに埋める
function computePatch(m, J, knots) {
  const { n: n0, names, P } = m, index = m.g.index.array, cap = n0 + 8000;
  const si = new Uint16Array(cap * 4), sw = new Float32Array(cap * 4); si.set(m.si); sw.set(m.sw);
  const added = { pos: [], normal: [], uvSrc: [], tris: [] }, removed = [], back = m.M.clone().invert(), report = {};
  let n = n0;
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    const C = J[s].C, axis = J[s].E.clone().sub(C).normalize(), R = .31;
    const armBones = ARM_BONES.map(b => names.indexOf(b + s));
    const iUp = names.indexOf('upperarm' + s), iFix = names.indexOf('armfix' + s), iClav = names.indexOf('shoulder' + s), iChest = names.indexOf('chest');
    // 肩のまわりの頂点を集め、同じ位置の頂点（絵の継ぎ目で分かれているもの）を1つにまとめる
    const id = new Int32Array(n0).fill(-1), key = new Map(), members = [], rel = [];
    let plain = -1, plainD = 9;   // 胸の前の、無地のところ（足した面に塗る色を借りる）
    for (let i = 0; i < n0; i++) {
      const x = P[i * 3] - C.x, y = P[i * 3 + 1] - C.y, z = P[i * 3 + 2] - C.z;
      if (x * x + y * y + z * z > R * R) continue;
      const k = Math.round(P[i * 3] * 4000) + ',' + Math.round(P[i * 3 + 1] * 4000) + ',' + Math.round(P[i * 3 + 2] * 4000);
      let w = key.get(k); if (w === undefined) { w = members.length; key.set(k, w); members.push([]); rel.push([x, y, z]); }
      id[i] = w; members[w].push(i);
      const dp = Math.hypot(P[i * 3] - sx * .105, P[i * 3 + 1] - 1.2, P[i * 3 + 2] - .2);
      if (dp < plainD && si[i * 4] === iChest && sw[i * 4] > .9) { plainD = dp; plain = i; }
    }
    const armShare = w => { const i = members[w][0]; let x = 0; for (let k = 0; k < 4; k++) if (armBones.includes(si[i * 4 + k])) x += sw[i * 4 + k]; return x; };
    const at = w => V(...rel[w]), dist = w => Math.hypot(...rel[w]);
    const faces = [];
    for (let t = 0; t < index.length; t += 3) { const a = id[index[t]], b = id[index[t + 1]], c = id[index[t + 2]]; if (a >= 0 && b >= 0 && c >= 0) faces.push([t, a, b, c]); }
    // ふち（三角形が片側にしか無い辺）をたどる道具
    const rimOf = skip => {
      const nb = Array.from({ length: members.length }, () => new Set()), edges = new Map(), rim = new Map();
      for (const [t, a, b, c] of faces) { if (skip.has(t)) continue;
        for (const [p, q] of [[a, b], [b, c], [c, a]]) { if (p === q) continue; nb[p].add(q); nb[q].add(p); const e = p < q ? p * 1e5 + q : q * 1e5 + p; edges.set(e, (edges.get(e) || 0) + 1); } }
      for (const [e, c] of edges) { if (c !== 1) continue; const a = Math.floor(e / 1e5), b = e % 1e5; if (dist(a) > .27 || dist(b) > .27) continue;
        (rim.get(a) || rim.set(a, []).get(a)).push(b); (rim.get(b) || rim.set(b, []).get(b)).push(a); }
      return { nb, rim };
    };
    // ① 切れ目は前と後ろに1本ずつ（どちらも、肩の高さから袖口の高さまでの細長い輪）
    const whole = rimOf(new Set()), seen = new Set(), slits = [];
    for (const start of whole.rim.keys()) {
      if (seen.has(start)) continue;
      const walk = [start]; seen.add(start);
      for (let cur = start; ;) { const next = whole.rim.get(cur).find(o => !seen.has(o)); if (next === undefined) break; walk.push(next); seen.add(next); cur = next; }
      const ys = walk.map(w => rel[w][1]);
      if (walk.length >= 40 && Math.max(...ys) - Math.min(...ys) > .1 && whole.rim.get(walk[walk.length - 1]).includes(start)) slits.push(walk);
    }
    if (slits.length !== 2) { report[s] = { fail: '切れ目が2本見つからない', found: slits.map(l => l.length) }; continue; }
    const meanZ = l => l.reduce((sum, w) => sum + rel[w][2], 0) / l.length;
    slits.sort((p, q) => meanZ(q) - meanZ(p));   // 前、後ろ
    // 1本の切れ目を、腕の側の縁と胴の側の縁に分ける（どちらも上から下へ）
    const sides = l => {
      const ys = l.map(w => rel[w][1]), top = ys.indexOf(Math.max(...ys)), bottom = ys.indexOf(Math.min(...ys));
      const walk = step => { const out = []; for (let i = top; ; i = (i + step + l.length) % l.length) { out.push(l[i]); if (i === bottom) break; } return out; };
      let a = walk(1), b = walk(-1); const mean = chain => chain.reduce((sum, w) => sum + armShare(w), 0) / chain.length;
      if (mean(a) < mean(b)) [a, b] = [b, a];
      while (a.length > 3 && armShare(a[a.length - 1]) < .5) a.pop();
      while (b.length > 3 && armShare(b[b.length - 1]) >= .5) b.pop();
      return { a, b };
    };
    const front = sides(slits[0]), rear = sides(slits[1]);
    // 橋を切る：腕の面と胴の面をつないでいる三角形のうち、肩より10cm以上 下にあるもの（袖口の高さで、前後の切れ目をつないでいる）
    const cut = new Set();
    for (const [t, a, b, c] of faces) { const cls = [a, b, c].map(w => armShare(w) >= .5); if (cls.some(x => x) && cls.some(x => !x) && (rel[a][1] + rel[b][1] + rel[c][1]) / 3 < -.10) cut.add(t); }
    for (const t of cut) removed.push(t / 3);
    const { nb, rim } = rimOf(cut);
    // 切った跡のふちを伝って、前の切れ目の下の端から、後ろの切れ目の下の端へ（腕の側・胴の側それぞれ）
    const across = (from, to, ok) => {
      const prev = new Map([[from, -1]]), queue = [from];
      for (let q = 0; q < queue.length && !prev.has(to); q++) for (const o of rim.get(queue[q]) || []) if (!prev.has(o) && (o === to || ok(o))) { prev.set(o, queue[q]); queue.push(o); }
      if (!prev.has(to)) return null;
      const out = []; for (let w = to; w !== -1; w = prev.get(w)) out.push(w); return out.reverse();
    };
    const join = (f, r, ok) => { const mid = across(f[f.length - 1], r[r.length - 1], ok); return { chain: [...f, ...(mid ? mid.slice(1, -1) : []), ...r.slice().reverse()], bridged: mid ? mid.length : -1 }; };
    const armJoin = join(front.a, rear.a, w => armShare(w) >= .5), torsoJoin = join(front.b, rear.b, w => armShare(w) < .5);
    const armRim = armJoin.chain, torsoRim = torsoJoin.chain;
    report[s] = { slits: slits.map(l => l.length), cut: cut.size, armRim: armRim.length, torsoRim: torsoRim.length, armBridge: armJoin.bridged, torsoBridge: torsoJoin.bridged };
    // 面を足す道具。足した頂点は kinds に種類を控える（1＝袖の内側、2＝胴の脇、3＝折り目）
    const kinds = new Map(), ROWS = 14, COLS = 8;
    const push = (p, normal, from, w) => {   // p＝肩のまん中からの位置
      for (let k = 0; k < 4; k++) { si[n * 4 + k] = si[from * 4 + k]; sw[n * 4 + k] = sw[from * 4 + k]; }
      const raw = p.clone().add(C).applyMatrix4(back);
      added.pos.push(raw.x, raw.y, raw.z); added.normal.push(normal.x, normal.y, normal.z); added.uvSrc.push(plain);
      members[w].push(n); return { v: n++ - n0, w, p };
    };
    const fresh = (p, normal, from, kind) => { const w = members.length; members.push([]); rel.push([p.x, p.y, p.z]); nb.push(new Set()); kinds.set(w, kind); return push(p, normal, from, w); };
    const copyOf = (w, normal) => push(at(w), normal, members[w][0], w);
    const face = (a, b, c, outward) => {
      if (a.w === b.w || b.w === c.w || a.w === c.w) return;
      const normal = b.p.clone().sub(a.p).cross(c.p.clone().sub(a.p)), mid = a.p.clone().add(b.p).add(c.p).divideScalar(3);
      added.tris.push(...(normal.dot(outward(mid)) < 0 ? [a.v, c.v, b.v] : [a.v, b.v, c.v]));
      nb[a.w].add(b.w); nb[b.w].add(a.w); nb[b.w].add(c.w); nb[c.w].add(b.w); nb[a.w].add(c.w); nb[c.w].add(a.w);
    };
    // 2本の折れ線のあいだを、長さの割合をそろえながら三角形で埋める
    const zip = (a, b, outward) => {
      const along = line => { const d = [0]; for (let i = 1; i < line.length; i++) d.push(d[i - 1] + line[i].p.distanceTo(line[i - 1].p)); const total = d[d.length - 1] || 1; return d.map(x => x / total); };
      const da = along(a), db = along(b);
      for (let i = 0, j = 0; i < a.length - 1 || j < b.length - 1;) {
        const stepA = j >= b.length - 1 || i < a.length - 1 && da[i + 1] <= db[j + 1];
        if (stepA) { face(a[i], b[j], a[i + 1], outward); i++; } else { face(a[i], b[j], b[j + 1], outward); j++; }
      }
    };
    // 折り目：前の上の端から後ろの上の端へ、まっすぐ。肩の回る軸のすぐ近くを通るので、腕を上げてもほとんど伸びない
    const foldFrom = at(armRim[0]).lerp(at(torsoRim[0]), .5), foldTo = at(armRim[armRim.length - 1]).lerp(at(torsoRim[torsoRim.length - 1]), .5);
    const fold = []; for (let j = 1; j < COLS; j++) fold.push(fresh(foldFrom.clone().lerp(foldTo, j / COLS), V(0, -1, 0), members[torsoRim[0]][0], 3).w);
    // 袖の筒の向き（腕の軸のまわり）。inward＝胴のほう
    const inward = V(-sx, 0, 0).addScaledVector(axis, sx * axis.x).normalize(), around = axis.clone().cross(inward);
    const sleevePoint = (pf, pb, t, u) => {
      const cyl = p => { const al = p.dot(axis), radial = p.clone().addScaledVector(axis, -al); return { al, rho: radial.length(), th: Math.atan2(radial.dot(around), radial.dot(inward)) }; };
      const f = cyl(pf), b = cyl(pb), th = lerp(f.th, b.th, t), rho = Math.max(lerp(f.rho, b.rho, t), .045), dir = inward.clone().multiplyScalar(Math.cos(th)).addScaledVector(around, Math.sin(th));
      const round = axis.clone().multiplyScalar(lerp(f.al, b.al, t)).addScaledVector(dir, rho), k = ss(seg(u, 0, .3));
      return { p: pf.clone().lerp(pb, t).lerp(round, k), normal: inward.clone().lerp(dir, k).normalize() };
    };
    const side = V(sx, 0, 0);
    // 胴の脇は、前の縁と後ろの縁のあいだを、内へくぼませて張る（わきのくぼみ。平らに張ると、板が横へ突き出て見える）
    const torsoPoint = (pf, pb, t, u) => {
      const hollow = .04 * Math.sin(Math.PI * t) * ss(seg(u, 0, .25)), lean = Math.cos(Math.PI * t) * .6;
      return { p: pf.clone().lerp(pb, t).addScaledVector(side, -hollow), normal: V(side.x, 0, lean).normalize() };
    };
    function patch(chain, kind, point, outward, edgeNormal) {
      const d = [0]; for (let i = 1; i < chain.length; i++) d.push(d[i - 1] + at(chain[i]).distanceTo(at(chain[i - 1])));
      const total = d[d.length - 1], near = x => { let best = 0; for (let i = 1; i < d.length; i++) if (Math.abs(d[i] - x) < Math.abs(d[best] - x)) best = i; return best; };
      const copies = new Map(), edge = i => copies.get(i) || copies.set(i, copyOf(chain[i], edgeNormal(at(chain[i])))).get(i);
      const run = (from, to) => { const out = []; for (let i = from; from <= to ? i <= to : i >= to; i += from <= to ? 1 : -1) out.push(edge(i)); return out; };
      const fi = [], bi = [], rows = [];
      for (let k = 0; k < ROWS; k++) { fi.push(Math.max(near(total * k / ROWS / 2), k ? fi[k - 1] : 0)); bi.push(Math.min(near(total * (1 - k / ROWS / 2)), k ? bi[k - 1] : chain.length - 1)); }
      for (let k = 0; k < ROWS; k++) {
        const pf = at(chain[fi[k]]), pb = at(chain[bi[k]]), row = [];
        for (let j = 1; j < COLS; j++) { if (!k) row.push(copyOf(fold[j - 1], edgeNormal(at(fold[j - 1])))); else { const q = point(pf, pb, j / COLS, k / ROWS); row.push(fresh(q.p, q.normal, members[chain[fi[k]]][0], kind)); } }
        rows.push(row);
      }
      for (let k = 0; k < ROWS - 1; k++) {
        zip(run(fi[k], fi[k + 1]), [rows[k][0], rows[k + 1][0]], outward);
        for (let j = 0; j < COLS - 2; j++) { face(rows[k][j], rows[k][j + 1], rows[k + 1][j + 1], outward); face(rows[k][j], rows[k + 1][j + 1], rows[k + 1][j], outward); }
        zip([rows[k][COLS - 2], rows[k + 1][COLS - 2]], run(bi[k], bi[k + 1]), outward);
      }
      zip(run(fi[ROWS - 1], bi[ROWS - 1]), rows[ROWS - 1], outward);
      return { first: edge(0), last: edge(chain.length - 1), top: rows[0] };
    }
    const fromAxis = p => p.clone().addScaledVector(axis, -p.dot(axis)).normalize();
    const sleeve = patch(armRim, 1, sleevePoint, fromAxis, p => fromAxis(p).lerp(inward, .5).normalize());
    const wall = patch(torsoRim, 2, torsoPoint, () => side, () => side.clone());
    // 折り目の両端の、小さなすき間をふさぐ
    face(sleeve.first, wall.first, sleeve.top[0], () => V(0, 0, 1)); face(sleeve.last, wall.last, sleeve.top[COLS - 2], () => V(0, 0, -1));
    // ② 元の「腕につく割合」と、固定する所
    const count = members.length, h = new Float32Array(count), fixed = new Uint8Array(count);
    for (let w = 0; w < count; w++) {
      const a = h[w] = armShare(w), [x, y, z] = rel[w], d = Math.hypot(x, y, z), al = x * axis.x + y * axis.y + z * axis.z, kind = kinds.get(w) | 0;
      if (d > R - .012 && !kind) fixed[w] = 1;                                                    // いちばん外は、元のまま
      else if (kind === 1 ? al >= .05 : a >= .9 && al >= SLEEVE_FROM) { h[w] = 1; fixed[w] = 1; }  // 腕（袖は、筒のまま腕につく）
      else if (kind === 2 ? y < -.05 : a <= .02 && d >= (y < -.12 ? TORSO_FROM : .17)) { h[w] = 0; fixed[w] = 1; }   // 胴
    }
    const adj = nb.map(set => Int32Array.from(set));
    for (let it = 0; it < 260; it++) for (let w = 0; w < count; w++) {
      if (fixed[w] || !adj[w].length) continue;
      let sum = 0; for (const o of adj[w]) sum += h[o];
      h[w] += 1.86 * (sum / adj[w].length - h[w]);
    }
    // 胴 → 鎖骨 → 補助の骨 → 二の腕 の順に、なだらかに受け渡す
    const [kc, kf] = knots, hat = (x, a, b, c) => x <= a || x >= c ? 0 : x < b ? (x - a) / (b - a) : (c - x) / (c - b);
    for (let w = 0; w < count; w++) {
      if (dist(w) > R - .012 && !kinds.has(w)) continue;
      const t = clamp(h[w]), wT = t < kc ? 1 - t / kc : 0, wC = hat(t, 0, kc, kf), wF = hat(t, kc, kf, 1), wA = t > kf ? (t - kf) / (1 - kf) : 0;
      for (const i of members[w]) {
        const mix = new Map(); let torso = 0, arm = 0;
        for (let k = 0; k < 4; k++) { const b = si[i * 4 + k], x = sw[i * 4 + k]; if (!x) continue; if (armBones.includes(b)) arm += x; else torso += x; }
        for (let k = 0; k < 4; k++) { const b = si[i * 4 + k], x = sw[i * 4 + k]; if (!x) continue;
          if (armBones.includes(b)) { if (wA) mix.set(b, (mix.get(b) || 0) + wA * x / arm); } else if (wT) mix.set(b, (mix.get(b) || 0) + wT * x / torso); }
        if (wT && !torso) mix.set(iChest, (mix.get(iChest) || 0) + wT);
        if (wA && !arm) mix.set(iUp, (mix.get(iUp) || 0) + wA);
        if (wC) mix.set(iClav, (mix.get(iClav) || 0) + wC);
        if (wF) mix.set(iFix, (mix.get(iFix) || 0) + wF);
        const best = [...mix].sort((p, q) => q[1] - p[1]).slice(0, 4), total = best.reduce((sum, e) => sum + e[1], 0);
        for (let k = 0; k < 4; k++) { si[i * 4 + k] = best[k] ? best[k][0] : 0; sw[i * 4 + k] = best[k] ? best[k][1] / total : 0; }
      }
    }
  }
  // 控えに入れる形（重みは 0〜255 の整数）にまとめる。変わった頂点だけ
  const pack = i => { const q = [0, 0, 0, 0]; let left = 255, big = 0; for (let k = 0; k < 4; k++) { q[k] = Math.round(sw[i * 4 + k] * 255); left -= q[k]; if (q[k] > q[big]) big = k; } q[big] += left; return q; };
  const changed = [];
  for (let i = 0; i < n0; i++) { let same = true; for (let k = 0; k < 4; k++) if (si[i * 4 + k] !== m.si[i * 4 + k] || Math.abs(sw[i * 4 + k] - m.sw[i * 4 + k]) > .003) { same = false; break; } if (!same) changed.push(i); }
  const ns = n - n0, all = [...changed, ...Array.from({ length: ns }, (_, k) => n0 + k)], joints = new Uint8Array(all.length * 4), weights = new Uint8Array(all.length * 4);
  all.forEach((i, r) => { const q = pack(i); for (let k = 0; k < 4; k++) { joints[r * 4 + k] = q[k] ? si[i * 4 + k] : 0; weights[r * 4 + k] = q[k]; } });
  return { n0, report, changed: Uint32Array.from(changed), removed: Uint32Array.from(removed.sort((a, b) => a - b)), pos: Float32Array.from(added.pos), uvSrc: Uint32Array.from(added.uvSrc),
    normal: Int8Array.from(added.normal.map(x => Math.round(clamp(x, -1, 1) * 127))), tris: Uint16Array.from(added.tris), joints, weights };
}

// 控えの形：[印, 頂点の数, 変わる頂点の数, 足す頂点の数, 足す三角形の数, 取りのぞく三角形の数] のあとに、各配列が並ぶ
const MAGIC = 0x33584641;   // 'AFX3'
export function encodePatch(p) {
  const head = Uint32Array.of(MAGIC, p.n0, p.changed.length, p.uvSrc.length, p.tris.length / 3, p.removed.length);
  const parts = [head, p.changed, p.removed, p.uvSrc, p.pos, p.tris, p.normal, p.joints, p.weights].map(a => new Uint8Array(a.buffer, a.byteOffset, a.byteLength));
  const out = new Uint8Array(parts.reduce((sum, a) => sum + a.length + (4 - a.length % 4) % 4, 0)); let o = 0;
  for (const a of parts) { out.set(a, o); o += a.length + (4 - a.length % 4) % 4; }
  return out.buffer;
}
function decodePatch(buffer, n) {
  try {
    const head = new Uint32Array(buffer, 0, 6);
    if (head[0] !== MAGIC || head[1] !== n) return null;
    const nc = head[2], ns = head[3], nt = head[4], nr = head[5]; let o = 24;
    const take = (Type, len) => { const a = new Type(buffer, o, len); o += a.byteLength + (4 - a.byteLength % 4) % 4; return a; };
    return { n0: n, changed: take(Uint32Array, nc), removed: take(Uint32Array, nr), uvSrc: take(Uint32Array, ns), pos: take(Float32Array, ns * 3),
      tris: take(Uint16Array, nt * 3), normal: take(Int8Array, ns * 3), joints: take(Uint8Array, (nc + ns) * 4), weights: take(Uint8Array, (nc + ns) * 4) };
  } catch { return null; }
}

// 計算した（または控えから読んだ）結果を、3Dに当てる
function applyPatch(mesh, m, patch, J) {
  const { g, n, names, P } = m, si = m.si.slice(), sw = m.sw.slice(), nc = patch.changed.length, ns = patch.uvSrc.length;
  // 色の直しをかける範囲（x＝どれだけ直すか、y＝そのうち肌の割合）。元の重みで決める。
  // 腕の内側・手のひら・わきの下は、3Dを作るときに体の陰になっていて、絵が焦げ茶〜黒で塗られている
  const tone = new Float32Array(n * 2), smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    const C = J[s].C, axis = J[s].E.clone().sub(C).normalize(), arm = new Set(ARM_BONES.map(b => names.indexOf(b + s)));
    for (let i = 0; i < n; i++) {
      if (P[i * 3] * sx < .04) continue;
      const x = P[i * 3] - C.x, y = P[i * 3 + 1] - C.y, z = P[i * 3 + 2] - C.z, d = Math.hypot(x, y, z), al = x * axis.x + y * axis.y + z * axis.z;
      let a = 0; for (let k = 0; k < 4; k++) if (arm.has(m.si[i * 4 + k])) a += m.sw[i * 4 + k];
      const near = 1 - smooth(.17, .25, d), skin = a * smooth(.155, .19, al), shirt = y < .06 ? near : 0;
      // x が1を超えるぶん＝わきに近い肌（二の腕の内側）。ここは筋のような黒ずみが残りやすいので、いちばん強く均す
      tone[i * 2] = Math.max(skin, shirt) + skin * near; tone[i * 2 + 1] = skin;
    }
  }
  for (let r = 0; r < nc; r++) { const i = patch.changed[r]; for (let k = 0; k < 4; k++) { si[i * 4 + k] = patch.joints[r * 4 + k]; sw[i * 4 + k] = patch.weights[r * 4 + k] / 255; } }
  g.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4));
  g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
  g.setAttribute('tone', new THREE.BufferAttribute(tone, 2));
  if (patch.removed.length) {   // わきの下の橋（腕と胴をつないでいた面）を外す
    const gone = new Set(patch.removed), old = g.index.array, keep = new Uint32Array(old.length - gone.size * 3); let o = 0;
    for (let t = 0; t < old.length; t += 3) if (!gone.has(t / 3)) { keep[o++] = old[t]; keep[o++] = old[t + 1]; keep[o++] = old[t + 2]; }
    g.setIndex(new THREE.BufferAttribute(keep, 1));
  }
  for (const material of [mesh.material].flat()) toneFix(material);
  openHand(mesh, m, J);
  if (!ns) return;
  // 足す面（袖の内側・胴の脇）は、小さな別の部品にして同じ骨につなぐ（元の頂点の入れ物は作り直さない）
  const nor = new Float32Array(ns * 3), uv = new Float32Array(ns * 2), sj = new Uint16Array(ns * 4), swt = new Float32Array(ns * 4), st = new Float32Array(ns * 2);
  const toRaw = new THREE.Matrix3().setFromMatrix4(m.M).invert(), v = V();   // 向きを、頂点の入れ物の中の向きへ戻す
  for (let k = 0; k < ns; k++) {
    const uvFrom = patch.uvSrc[k];
    v.set(patch.normal[k * 3], patch.normal[k * 3 + 1], patch.normal[k * 3 + 2]).applyMatrix3(toRaw).normalize().toArray(nor, k * 3);
    uv[k * 2] = g.attributes.uv.getX(uvFrom); uv[k * 2 + 1] = g.attributes.uv.getY(uvFrom);
    for (let c = 0; c < 4; c++) { sj[k * 4 + c] = patch.joints[(nc + k) * 4 + c]; swt[k * 4 + c] = patch.weights[(nc + k) * 4 + c] / 255; }
    st[k * 2] = 1;
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(Float32Array.from(patch.pos), 3)); sg.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); sg.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  sg.setAttribute('skinIndex', new THREE.BufferAttribute(sj, 4)); sg.setAttribute('skinWeight', new THREE.BufferAttribute(swt, 4)); sg.setAttribute('tone', new THREE.BufferAttribute(st, 2));
  sg.setIndex(new THREE.BufferAttribute(patch.tris, 1));
  sg.boundingSphere = g.boundingSphere; sg.boundingBox = g.boundingBox;
  const sewn = new THREE.SkinnedMesh(sg, mesh.material);
  sewn.name = 'sewn'; sewn.position.copy(mesh.position); sewn.quaternion.copy(mesh.quaternion); sewn.scale.copy(mesh.scale);
  sewn.frustumCulled = false; sewn.castShadow = mesh.castShadow;
  mesh.parent.add(sewn); sewn.bind(mesh.skeleton, mesh.bindMatrix);
}

// 右手を開いた形を、もう1つの形として持たせる（morph。0＝元の丸めた手、1＝指を伸ばした手）。
// この3Dの手は、指が丸まったまま1つの塊になっている（指の骨は無い）。指の塊を、付け根を軸に丸まりをほどいて、まっすぐに伸ばす。
// （2026-10-08 中元さんの見本：開いた手のひらを正面に向けて振る）
const FINGERS = { from: -.070, center: -.020, radius: .074 };   // 手首からの位置：指の付け根の高さ・指の芯の位置（手のひら側が＋）・丸まりの半径
function openHand(mesh, m, J) {
  const { g, n, names, P } = m, iHand = names.indexOf('handR'), W = J.R.W, f = FINGERS, cx = f.center + f.radius;
  const dp = new Float32Array(n * 3), dn = new Float32Array(n * 3), linear = new THREE.Matrix3().setFromMatrix4(m.M), toRaw = linear.clone().invert(), v = V(), q = V();
  for (let i = 0; i < n; i++) {
    let w = 0; for (let k = 0; k < 4; k++) if (m.si[i * 4 + k] === iHand) w += m.sw[i * 4 + k];
    const x = P[i * 3] - W.x, y = P[i * 3 + 1] - W.y;
    if (w < .5 || y >= f.from) continue;
    // 丸まりの中心から見た角度（付け根＝0）と距離。ほどくと、角度のぶんだけ下へ伸びる
    const ex = x - cx, ey = y - f.from, rho = Math.hypot(ex, ey), phi = Math.atan2(-ey, -ex);
    if (phi <= 0 || phi > 2.6) continue;
    v.set((cx - rho) - x, (f.from - f.radius * phi) - y, 0).applyMatrix3(toRaw).toArray(dp, i * 3);
    q.fromBufferAttribute(g.attributes.normal, i); v.copy(q).applyMatrix3(linear).normalize().applyAxisAngle(AXIS.z, -phi).applyMatrix3(toRaw).normalize().sub(q.normalize()).toArray(dn, i * 3);
  }
  const position = new THREE.BufferAttribute(dp, 3), normal = new THREE.BufferAttribute(dn, 3); position.name = normal.name = 'open';
  g.morphAttributes.position = [position]; g.morphAttributes.normal = [normal]; g.morphTargetsRelative = true;
  mesh.updateMorphTargets();
}

// 暗く塗られている所を、肌の色・シャツの色へ持ち上げる（tone の付いた範囲だけ。顔や髪には触らない）
function toneFix(material) {
  if (material.userData.toneFix) return;
  material.userData.toneFix = true;
  material.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 tone;\nvarying vec2 vTone;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTone = tone;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vTone;')
      .replace('#include <map_fragment>', `#include <map_fragment>
      {
        vec3 c = diffuseColor.rgb;
        float amount = min(vTone.x, 1.), sk = clamp(vTone.y / max(amount, .001), 0., 1.);
        sk = mix(sk, step(c.b * 1.1, c.r), smoothstep(.012, .05, max(c.r, c.b)) * .85);   // 色あいがはっきりしていれば、絵に従う
        float inner = clamp(vTone.x - 1., 0., 1.) * sk;                                    // わきに近い肌
        vec3 target = mix(vec3(.027, .078, .102), vec3(.58, .36, .235), sk);
        float lt = dot(target, vec3(.2126, .7152, .0722)), l = dot(c, vec3(.2126, .7152, .0722));
        float top = mix(mix(.92, 1.05, sk), 1.3, inner);                                   // 肌は、明るい所まで寄せる（黒ずみを残さない）
        float k = amount * (1. - smoothstep(lt * mix(mix(.5, .78, sk), 1.1, inner), lt * top, l));
        diffuseColor.rgb = mix(c, target * mix(mix(mix(.66, .82, sk), .93, inner), 1., smoothstep(0., lt * top, l)), k);
      }`);
  };
  material.customProgramCacheKey = () => 'tone-fix-3';
  material.needsUpdate = true;
}

export function makeRig(root) {
  const bones = {}, rest = {}, order = [], pos = {};
  root.updateWorldMatrix(true, true);
  const toAvatar = root.parent ? root.parent.matrixWorld.clone().invert() : new THREE.Matrix4();
  root.traverse(o => { if (o.isBone) { bones[o.name] = o; order.push(o.name); } });
  for (const name of order) {
    const b = bones[name], parent = rest[b.parent?.name];
    const q = b.quaternion.clone(), p = b.position.clone();
    // w＝休みの姿勢での、体の向きから見た骨の向き
    rest[name] = { q, p, w: parent ? parent.w.clone().multiply(q) : q.clone(), parent: parent ? b.parent.name : null };
    pos[name] = b.getWorldPosition(V()).applyMatrix4(toAvatar);
  }
  const scale = root.scale.y;
  const len = (a, b) => pos[a].distanceTo(pos[b]);
  // 体の向きで書いた回し方 d を、その骨の中での回し方に直す
  const local = (name, d) => { const r = rest[name]; return r.q.clone().multiply(r.w.clone().invert().multiply(d).multiply(r.w)); };
  // 逆（骨の中での回し方 → 体の向きで見た回し方）。確かめ用
  const delta = (name, q) => { const r = rest[name]; return r.w.clone().multiply(r.q.clone().invert().multiply(q)).multiply(r.w.clone().invert()); };

  // 姿勢から、関節の位置（P）と、休みからどれだけ回ったか（D）を計算する。骨には触らない
  function fk(pose) {
    const D = {}, P = {};
    for (const name of order) {
      const parent = rest[name].parent, d = pose[name] || ID;
      if (!parent) { D[name] = d.clone(); P[name] = pos[name].clone(); if (pose.hipsPos) P[name].add(V(...pose.hipsPos)); }
      else { D[name] = D[parent].clone().multiply(d); P[name] = P[parent].clone().add(pos[name].clone().sub(pos[parent]).applyQuaternion(D[parent])); }
    }
    return { D, P };
  }

  // 2本の骨で、根もとから先へ届かせるときの、まん中の関節の位置
  function middle(from, to, l1, l2, toward) {
    const d = to.clone().sub(from), dist = clamp(d.length(), Math.abs(l1 - l2) + 1e-3, l1 + l2 - 1e-4), dn = d.normalize();
    const pole = toward.clone().addScaledVector(dn, -toward.dot(dn)).normalize();
    const a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    return { mid: from.clone().addScaledVector(dn, a).addScaledVector(pole, h), end: from.clone().addScaledVector(dn, dist), dn };
  }

  // 脚：足首を ankle に置き、つま先を heading（上から見た向き・ラジアン）へ向ける。pitch＝つま先を下げる角度
  function leg(pose, side, ankle, heading, pitch = 0) {
    const th = 'thigh' + side, sh = 'shin' + side, ft = 'foot' + side, { D, P } = fk(pose);
    const f = V(Math.sin(heading), 0, Math.cos(heading));
    const { mid, end, dn } = middle(P[th], ankle, len(th, sh), len(sh, ft), f);
    const hinge = f.clone().cross(dn).normalize();   // ひざの軸（本人の左向き）
    const basis = y => Q().setFromRotationMatrix(new THREE.Matrix4().makeBasis(hinge, y, hinge.clone().cross(y)));
    const Dt = basis(mid.clone().sub(P[th]).normalize()).multiply(rest[th].w.clone().invert());
    const Ds = basis(end.clone().sub(mid).normalize()).multiply(rest[sh].w.clone().invert());
    const Df = Q().setFromAxisAngle(AXIS.y, heading).multiply(axisQ(AXIS.x, pitch));
    pose[th] = D.hips.clone().invert().multiply(Dt);
    pose[sh] = Dt.clone().invert().multiply(Ds);
    pose[ft] = Ds.clone().invert().multiply(Df);
  }

  // 腕：手首を wrist に置く。ひじは toward の側へ出す。palm＝手のひらを向ける先、fingers＝指先を向ける先
  // ひねりは、二の腕（share）・前腕・手首に分ける（1か所でひねると、そこが絞ったように細くなる）
  function arm(pose, side, wrist, toward, { palm, fingers, share = .3 } = {}) {
    const shd = 'shoulder' + side, up = 'upperarm' + side, fo = 'forearm' + side, ha = 'hand' + side, { D, P } = fk(pose);
    const { mid, end } = middle(P[up], wrist, len(up, fo), len(fo, ha), toward);
    const u0 = pos[fo].clone().sub(pos[up]).normalize(), f0 = pos[ha].clone().sub(pos[fo]).normalize();
    const fW = end.clone().sub(mid).normalize();
    const sign = side === 'R' ? 1 : -1;   // 休みの姿勢で、手の骨の x 軸は 右手＝手のひら側・左手＝甲の側
    const swingUp = Q().setFromUnitVectors(u0, mid.clone().sub(P[up]).normalize().applyQuaternion(D[shd].clone().invert()));
    // 二の腕を twist だけひねったときの、前腕の向け方と、手のひらを合わせるのに残るひねり
    const solve = twist => {
      const dUp = swingUp.clone().multiply(Q().setFromAxisAngle(u0, twist)), Dup = D[shd].clone().multiply(dUp);
      const swing = Q().setFromUnitVectors(f0, fW.clone().applyQuaternion(Dup.clone().invert()));
      let roll = 0;
      if (palm) {
        const p0 = V(sign, 0, 0).applyQuaternion(rest[ha].w).applyQuaternion(Dup.clone().multiply(swing));
        roll = Math.atan2(fW.clone().cross(p0).dot(palm), p0.dot(palm) - fW.dot(p0) * fW.dot(palm));
      }
      return { dUp, Dup, swing, roll };
    };
    let r = solve(0);
    if (share && palm) r = solve(r.roll * share);
    pose[up] = r.dUp;
    if (fingers) {
      // 手は向きを決め打ちにする。前腕は、残りのひねりの8割を受け持つ
      const dFo = r.swing.clone().multiply(Q().setFromAxisAngle(f0, r.roll * .8)), Dfo = r.Dup.clone().multiply(dFo);
      const y = fingers.clone().normalize(), x = palm.clone().multiplyScalar(sign).addScaledVector(y, -sign * palm.dot(y)).normalize();
      const Dh = Q().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, x.clone().cross(y))).multiply(rest[ha].w.clone().invert());
      pose[fo] = dFo;
      pose[ha] = Dfo.invert().multiply(Dh);
    } else {
      pose[fo] = r.swing.multiply(Q().setFromAxisAngle(f0, r.roll * .7));
      pose[ha] = Q().setFromAxisAngle(f0, r.roll * .3);
    }
  }

  // 姿勢を骨に当てる。pose＝{ 骨の名前: 回し方, hipsPos: [x, y, z]（休みの位置からのずれ） }
  const body = root.getObjectByName('geometry_0');
  function apply(pose) {
    const p = finish(pose);
    if (body?.morphTargetInfluences) body.morphTargetInfluences[0] = pose.open || 0;
    for (const name of order) { bones[name].quaternion.copy(local(name, p[name] || ID)); bones[name].position.copy(rest[name].p); }
    if (p.hipsPos) bones.hips.position.add(V(...p.hipsPos).divideScalar(scale));
  }
  // ひじの補助の骨は、前腕の半分だけ回す（ひじの太さを保つ）
  function finish(pose) {
    for (const side of ['L', 'R']) {
      if (pose['forearm' + side]) pose['elbowfix' + side] = Q().slerp(pose['forearm' + side], .5);
      if (bones['armfix' + side]) pose['armfix' + side] = Q().slerp(pose['upperarm' + side] || ID, .5);
    }
    return pose;
  }

  // 時刻 → 姿勢 の関数を、1秒30コマで動きに焼く
  function bake(name, duration, fn, fps = 30) {
    const n = Math.round(duration * fps), times = new Float32Array(n + 1);
    const values = Object.fromEntries(order.map(b => [b, new Float32Array((n + 1) * 4)]));
    const hip = new Float32Array((n + 1) * 3), open = new Float32Array(n + 1), last = {};
    for (let i = 0; i <= n; i++) {
      const t = times[i] = i / fps, pose = finish(fn(t));
      for (const b of order) {
        const q = local(b, pose[b] || ID);
        if (last[b] && last[b].dot(q) < 0) q.set(-q.x, -q.y, -q.z, -q.w);   // 遠回りしない
        last[b] = q; q.toArray(values[b], i * 4);
      }
      rest.hips.p.clone().add(V(...(pose.hipsPos || [0, 0, 0])).divideScalar(scale)).toArray(hip, i * 3);
      open[i] = pose.open || 0;
    }
    const tracks = order.map(b => new THREE.QuaternionKeyframeTrack(bones[b].name + '.quaternion', times, values[b]));
    tracks.push(new THREE.VectorKeyframeTrack('hips.position', times, hip));
    if (body?.morphTargetInfluences) tracks.push(new THREE.NumberKeyframeTrack('geometry_0.morphTargetInfluences[open]', times, open));   // 右手の開き
    return new THREE.AnimationClip(name, duration, tracks);
  }

  return { bones, rest, order, pos, scale, local, delta, fk, leg, arm, apply, finish, bake };
}

// 2つの姿勢のあいだ（w=0 で a、1 で b）
function blend(a, b, w, names) {
  const o = {};
  for (const n of names) o[n] = (a[n] || ID).clone().slerp(b[n] || ID, w);
  const pa = a.hipsPos || [0, 0, 0], pb = b.hipsPos || [0, 0, 0];
  o.hipsPos = pa.map((v, i) => lerp(v, pb[i], w));
  o.open = lerp(a.open || 0, b.open || 0, w);
  return o;
}

// ─────────── 動きの中身 ───────────
// 机に向かって立つ位置（原点より机寄り）。振り向くと、2歩で原点に着く
export const DESK_STAND = -.18;
// キーボードのまん中（足もとの真ん中から。office.js が机をここへ寄せる）
export const KEYBOARD = { y: .789, z: DESK_STAND - .40 };

const HALF = .09;   // 足の左右の開き（体の真ん中から）
const ARMS = ['shoulderL', 'upperarmL', 'forearmL', 'handL', 'shoulderR', 'upperarmR', 'forearmR', 'handR'];

export function buildClips(root) {
  const rig = makeRig(root), { pos } = rig;
  const ankleY = pos.footL.y;
  const TAU = Math.PI * 2;

  // 立ち姿の土台。yaw＝体の向き（0＝正面・180＝机のほう）、cx/cz＝体の真ん中、drop＝腰を落とす量
  function stand({ yaw = 0, cx = 0, cz = 0, drop = .006, sway = 0, roll = 0, lean = 0, feet } = {}) {
    const pose = { hips: R('x', lean * .25, 'z', roll, 'y', yaw), hipsPos: [cx + sway, -drop, cz] };
    const h = yaw * DEG, left = V(Math.cos(h), 0, -Math.sin(h));
    const f = feet || { L: { p: V(cx, ankleY, cz).addScaledVector(left, HALF), h: h + 7 * DEG }, R: { p: V(cx, ankleY, cz).addScaledVector(left, -HALF), h: h - 7 * DEG } };
    pose.feet = f;
    return pose;
  }
  const legs = pose => { for (const s of ['L', 'R']) rig.leg(pose, s, pose.feet[s].p, pose.feet[s].h, pose.feet[s].pitch || 0); delete pose.feet; return pose; };

  // 腕をおろした形（休みの姿勢より、ひじを少しだけ曲げる）
  const armsDown = (pose, { bend = 9, open = 0, back = 0 } = {}) => Object.assign(pose, {
    upperarmL: R('x', back, 'z', open), upperarmR: R('x', back, 'z', -open),
    forearmL: R('x', -bend), forearmR: R('x', -bend), handL: Q(), handR: Q(), shoulderL: Q(), shoulderR: Q()
  });

  // 息づかいと、体重のかけ替え（6秒でひと回り）
  function idleBase(t, amount = 1) {
    const b = Math.sin(TAU * t / 3) * amount, w = Math.sin(TAU * t / 6) * amount, w2 = Math.sin(TAU * t / 6 + 1.1) * amount;
    const pose = stand({ sway: w * .007, roll: -w * .7, drop: .006 + (b * .5 + .5) * .002 });
    Object.assign(pose, { spine: R('x', b * .5, 'z', w * .5), chest: R('x', -b * 1.3, 'z', w * .4), neck: R('x', b * .5), head: R('x', b * .4 + w2 * .8, 'y', w2 * 1.6, 'z', -w * .5) });
    armsDown(pose, { bend: 9 + b * 1.2, open: b * .7 });
    pose.shoulderL = R('z', b * .8); pose.shoulderR = R('z', -b * .8);
    return pose;   // 足はまだ解いていない（上に動きを重ねてから legs で解く）
  }
  const idlePose = t => legs(idleBase(t));
  const BASE = idlePose(0);

  // 机に向かって、立ったままキーボードを打つ
  function typePose(t, lift = 0) {
    const sway = Math.sin(TAU * t / 2.4) * .004, nod = Math.sin(TAU * t / 2.4 * 2 + .6);
    const pose = stand({ yaw: 180, cz: DESK_STAND + .035, drop: .012, sway, lean: 10 });
    Object.assign(pose, { spine: R('x', 9), chest: R('x', 10 + nod * .4), neck: R('x', 4 + nod * .5), head: R('x', 3 + nod * .6, 'y', Math.sin(TAU * t / 2.4) * 3) });
    legs(pose);
    // 手は、キーボードの上に置いたまま。指の代わりに、手首を小さく打ち下ろす（左右を交互に、打っては休む）
    const burst = .55 + .45 * Math.sin(TAU * t / 2.4 * 2 - 1);
    for (const [side, sx, phase] of [['L', -1, 0], ['R', 1, .5]]) {
      const tap = Math.max(0, Math.sin(TAU * (t * 5 + phase))) * burst * (1 - lift), reach = Math.sin(TAU * (t / 2.4 * (side === 'L' ? 2 : 3)) + phase * 4) * (1 - lift);
      const wrist = V(sx * (.105 + reach * .022), KEYBOARD.y + .052 - tap * .007 + lift * .05, KEYBOARD.z + .115 + reach * .012 + lift * .04);
      const tilt = (17 + tap * 9 - lift * 8) * DEG;
      rig.arm(pose, side, wrist, V(sx * .55, -.2, 1), { palm: V(0, -1, -.12).normalize(), fingers: V(-sx * .12, -Math.sin(tilt), -Math.cos(tilt)) });
    }
    return pose;
  }

  // 手を振る（立ち姿から始まり、立ち姿に戻る）。
  // 形は中元さんの見本（2026-10-08）：ひじを肩より少し上・外へ出し、ひじから先を立てて、開いた手のひらを正面へ。
  // ひじから先を左右に大きく振る。まん中で1回、大きく振り抜く
  const WAVE = 3.7, REST_A = 12, TOP_A = 130;   // 二の腕の角度（真下＝0・真上＝180）
  const UPPER = pos.forearmR.distanceTo(pos.upperarmR), FORE = pos.handR.distanceTo(pos.forearmR);
  function wavePose(t) {
    const up = ss(seg(t, .08, .78)), down = ss(seg(t, 2.86, 3.54)), k = up * (1 - down);            // k＝腕が上がっている度合い
    const pose = idleBase(t, 1 - k * .6);
    // 振り：4往復。まん中の1往復だけ大きい。手首は少し遅れてついてくる
    const s = seg(t, .72, 2.9), fade = ss(seg(t, .7, .95)) * (1 - ss(seg(t, 2.6, 2.9))), big = 1 + .75 * bump(s, .3, .7) ** 2;
    const swing = Math.sin(TAU * 4 * s) * fade * big, late = Math.sin(TAU * 4 * s - 1.1) * fade * big;
    // 体も一緒に：ひと息ためてから、上げるほうの肩が上がり、体は少しだけ反対へ。体重は左足へ
    const dip = bump(t, 0, .34) * (1 - up);
    pose.hipsPos[0] += k * .014 + swing * .004; pose.hipsPos[1] += -dip * .007 + k * .004;
    pose.hips.premultiply(R('z', k * 1.4));
    pose.spine.premultiply(R('x', dip * 1.6 - k * .6, 'z', -k * 2.2 + swing * .5));
    pose.chest.premultiply(R('x', dip * 2 - k * 1.2, 'z', -k * 3 + swing * .7, 'y', -k * 3));
    pose.neck.premultiply(R('z', k * 2.4));
    pose.head.premultiply(R('z', k * 3 - swing * .5, 'x', -k * 1 + bump(t, .55, 1.05) * 2.5));
    pose.upperarmL = R('x', k * 3, 'z', k * 4 - swing * .7); pose.forearmL = R('x', -9 - k * 6);
    // 腕：体の斜め前から上げて、上で外へ開く。途中はひじを曲げて、手が体の近くを通る
    const a = lerp(REST_A, TOP_A - swing * 5 + bump(t, .68, 1.02) * 4, k) * DEG, plane = lerp(64, 20, ss(seg(k, .35, 1))) * DEG;
    const side = V(-Math.cos(plane), 0, Math.sin(plane)), U = side.multiplyScalar(Math.sin(a)).add(V(0, -Math.cos(a), 0)).normalize();
    pose.shoulderR = R('z', -20 * ss(seg(a / DEG, 45, 130)), 'y', -4 * k);
    const S = rig.fk(pose).P.upperarmR;
    // ひじ：上げきったところで50度ほど曲げると、ひじから先がまっすぐ立つ。そこから左右に振る（内へは大きく、外へは小さく）
    const bend = (lerp(9, 50, k) + Math.sin(Math.PI * Math.pow(k, .8)) * 28 + (swing > 0 ? swing * 26 : swing * 17) * k) * DEG;
    const fwd = V(0, 0, 1).addScaledVector(U, -U.z).normalize(), upw = V(0, 1, 0).addScaledVector(U, -U.y).normalize();
    const toward = fwd.lerp(upw, ss(seg(k, .08, .92))).normalize();                                // ひじを曲げる向き（下では前へ、上では頭のほうへ）
    const F = U.clone().multiplyScalar(Math.cos(bend)).addScaledVector(toward, Math.sin(bend)).normalize();
    const wrist = S.clone().addScaledVector(U, UPPER).addScaledVector(F, FORE);
    const palm = V(1, 0, 0).lerp(V(.2, 0, 1), ss(seg(k, .15, .75))).normalize();
    rig.arm(pose, 'R', wrist, F.clone().multiplyScalar(-1).add(U), { palm, share: .34 });
    pose.handR.multiply(R('x', late * 16 * k, 'z', -6 * k));                                       // 手首：振りに遅れて横へ。少し反らす
    pose.open = ss(seg(k, .25, .8));                                                               // 上げながら、手を開く
    // おろした腕は、行きすぎてから戻る
    pose.upperarmR.premultiply(R('x', Math.sin(seg(t, 3.34, WAVE) * Math.PI) * 3.5));
    return legs(pose);
  }

  // 会釈（紺の場面）。2.4秒
  const NOD = 2.4;
  function nodPose(t) {
    const k = bump(t, .15, 1.75) ** 1.4, k2 = bump(t, .3, 1.9);
    const pose = idleBase(t, 1 - k * .5);
    pose.hipsPos[2] -= k * .012;
    pose.spine.premultiply(R('x', k * 4)); pose.chest.premultiply(R('x', k * 6)); pose.neck.premultiply(R('x', k2 * 5)); pose.head.premultiply(R('x', k2 * 9));
    pose.upperarmL.premultiply(R('x', -k * 4)); pose.upperarmR.premultiply(R('x', -k * 4));
    return legs(pose);
  }

  // 振り向く：打つ手を止め、顔が先に向き、右足を引いて半分、左足を回して残り半分。そのまま手を振る
  const NOTICE = .34, TURN = 1.16, SETTLE = .34, T1 = NOTICE + TURN, GREET0 = T1 + SETTLE - .06;
  const typeEnd = typePose(0, 1);
  function turnPose(t) {
    const e = io(seg(t, NOTICE - .06, T1)), yaw = 180 * (1 - e), h = yaw * DEG, left = V(Math.cos(h), 0, -Math.sin(h));
    const first = yaw > 90, lift = bump(t, .02, NOTICE + .1);
    // 軸足：前半は左足（机の前に置いたまま）、後半は右足。体の真ん中は、軸足のまわりを回る
    const footL0 = V(-HALF, ankleY, DESK_STAND), footR1 = V(-HALF, ankleY, 0), footL1 = V(HALF, ankleY, 0), footR0 = V(HALF, ankleY, DESK_STAND);
    const pivot = first ? footL0 : footR1, c = pivot.clone().addScaledVector(left, first ? -HALF : HALF);
    const lean = lerp(10, 0, ss(seg(t, .1, NOTICE + .5)));
    const step = first ? bump(yaw, 180, 90) : bump(yaw, 90, 0);                        // 浮かせる足の高さ（0→1→0）
    const shift = (first ? 1 : -1) * step * .022;                                      // 体重を軸足へ
    const back = lerp(.035, 0, ss(seg(t, 0, NOTICE + .3)));
    const pose = stand({ yaw, cx: c.x + left.x * shift, cz: c.z + left.z * shift + back * (1 - e), drop: .012 + step * .02, lean, roll: (first ? -1 : 1) * step * 2.2,
      feet: {
        L: first ? { p: footL0.clone().setY(ankleY + step * .012), h: Math.PI + 7 * DEG + (h - Math.PI) * .82, pitch: step * 6 }
          : { p: c.clone().addScaledVector(left, HALF).setY(ankleY + step * .045), h: h + 7 * DEG * (1 - step), pitch: step * 12 },
        R: first ? { p: c.clone().addScaledVector(left, -HALF).setY(ankleY + step * .04), h: h - 7 * DEG * (1 - step) - step * .25, pitch: step * 12 }
          : { p: footR1.clone().setY(ankleY + step * .012), h: Math.PI / 2 - 7 * DEG + (h - Math.PI / 2) * .86 + (1 - e) * 0, pitch: step * 6 }
      } });
    // 上半身：顔 → 胸 → 腰の順に回りはじめ、着いたあと少しだけ行きすぎて戻る
    const lead = ss(seg(t, .04, NOTICE + .12)) * (1 - ss(seg(t, NOTICE + .35, T1 - .05)));
    const over = Math.sin(seg(t, T1 - .12, T1 + SETTLE) * Math.PI) * (1 - seg(t, T1 - .12, T1 + SETTLE));
    const k = 1 - e;   // 打つ姿勢の名残り
    Object.assign(pose, { spine: R('x', 9 * ss(k) * (1 - lift * .3), 'y', -lead * 9 + over * 2), chest: R('x', 10 * ss(k) * (1 - lift * .4), 'y', -lead * 14 + over * 4),
      neck: R('x', 4 * k, 'y', -lead * 20 + over * 3), head: R('x', 3 * k - lead * 6, 'y', -lead * 38 + over * 4, 'z', lead * 3) });
    legs(pose);
    // 腕：キーボードから手を離し、回りながら体の横へ。回っているあいだは少し外へ振られる
    const w = io(seg(t, .12, NOTICE + .62)), fling = bump(t, NOTICE, T1 + .1);
    const down = armsDown({}, { bend: 9 + fling * 22, open: fling * 5, back: -fling * 3 + over * 4 });
    Object.assign(pose, blend(typeEnd, down, w, ARMS), { hipsPos: pose.hipsPos });
    return pose;
  }
  // 手を上げて止める前の形 → 振り向きに混ぜる
  function typeStop(t) { const a = typePose(t, ss(seg(t, 0, .3))); return a; }

  const GREET = GREET0 + WAVE;
  function greetPose(t) {
    if (t < .3) {   // 打つ手が止まるところは、打つ姿勢から振り向く姿勢へなめらかに
      const a = typeStop(t), b = turnPose(t);
      return blend(a, b, ss(seg(t, .04, .3)), rig.order);
    }
    // 振り向きの終わりを、手を振る動きの頭（まだ腕が動いていないところ）へ重ねる
    if (t < GREET0 - .2) return turnPose(t);
    const b = wavePose(Math.max(0, t - GREET0));
    return t < GREET0 + .06 ? blend(turnPose(t), b, ss(seg(t, GREET0 - .2, GREET0 + .06)), rig.order) : b;
  }

  const clips = {
    Idle: rig.bake('Idle', 6, t => idlePose(t)),
    Type: rig.bake('Type', 2.4, t => typePose(t)),
    Greet: rig.bake('Greet', GREET, greetPose),
    Wave: rig.bake('Wave', WAVE, wavePose),
    Nod: rig.bake('Nod', NOD, nodPose)
  };
  rig.apply(BASE);
  return { clips, rig, poses: { idlePose, typePose, turnPose, wavePose, nodPose, greetPose }, times: { NOTICE, T1, SETTLE, GREET0, GREET, WAVE } };
}
