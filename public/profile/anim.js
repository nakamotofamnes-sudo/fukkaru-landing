// 人物の動きを、ページの側で組み立てる（2026-10-08）。
// avatar.glb に入っている Idle / Nod / Wave は使わず、ここで作った動きに差し替える。
//
// 書き方の約束
// ・姿勢は「休みの姿勢から、体の向き（x=本人の左・y=上・z=正面）で何度回すか」で書く。親が回れば、子の軸も一緒に回る。
// ・位置はメートル。原点は足もとの真ん中（scene.js の avatar の中）。
// ・この3Dは袖の下に胴の面が無い。二の腕は休みの向きから20度あまりまで。手は、ひじから先で上げる。
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
const out = n => 1 - Math.pow(1 - clamp(n), 3);                                                  // すっと出て、ゆっくり止まる
const bump = (t, a, b) => Math.sin(Math.PI * seg(t, a, b));                                      // 0 → 1 → 0
const axisQ = (v, deg) => Q().setFromAxisAngle(v, deg * DEG);

// R('x', -40, 'z', 10)＝体の向きの x 軸で -40度 回し、そのあと z 軸で 10度 回す
export function R(...parts) {
  const q = Q();
  for (let i = 0; i < parts.length; i += 2) q.premultiply(Q().setFromAxisAngle(AXIS[parts[i]], parts[i + 1] * DEG));
  return q;
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
  // 二の腕はひねらない（肩に折り目が出る）。ひねりは前腕と手首に分ける
  function arm(pose, side, wrist, toward, { palm, fingers } = {}) {
    const shd = 'shoulder' + side, up = 'upperarm' + side, fo = 'forearm' + side, ha = 'hand' + side, { D, P } = fk(pose);
    const { mid, end } = middle(P[up], wrist, len(up, fo), len(fo, ha), toward);
    const u0 = pos[fo].clone().sub(pos[up]).normalize(), f0 = pos[ha].clone().sub(pos[fo]).normalize();
    const fW = end.clone().sub(mid).normalize();
    const dUp = Q().setFromUnitVectors(u0, mid.clone().sub(P[up]).normalize().applyQuaternion(D[shd].clone().invert()));
    const Dup = D[shd].clone().multiply(dUp);
    const swing = Q().setFromUnitVectors(f0, fW.clone().applyQuaternion(Dup.clone().invert()));
    const sign = side === 'R' ? 1 : -1;   // 休みの姿勢で、手の骨の x 軸は 右手＝手のひら側・左手＝甲の側
    let roll = 0;
    if (palm) {
      const p0 = V(sign, 0, 0).applyQuaternion(rest[ha].w).applyQuaternion(Dup.clone().multiply(swing));
      roll = Math.atan2(fW.clone().cross(p0).dot(palm), p0.dot(palm) - fW.dot(p0) * fW.dot(palm));
    }
    pose[up] = dUp;
    if (fingers) {
      // 手は向きを決め打ちにする。前腕は、そのひねりの8割を受け持つ
      const dFo = swing.clone().multiply(Q().setFromAxisAngle(f0, roll * .8)), Dfo = Dup.clone().multiply(dFo);
      const y = fingers.clone().normalize(), x = palm.clone().multiplyScalar(sign).addScaledVector(y, -sign * palm.dot(y)).normalize();
      const Dh = Q().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, x.clone().cross(y))).multiply(rest[ha].w.clone().invert());
      pose[fo] = dFo;
      pose[ha] = Dfo.invert().multiply(Dh);
    } else {
      pose[fo] = swing.multiply(Q().setFromAxisAngle(f0, roll * .78));
      pose[ha] = Q().setFromAxisAngle(f0, roll * .22);
    }
  }

  // 姿勢を骨に当てる。pose＝{ 骨の名前: 回し方, hipsPos: [x, y, z]（休みの位置からのずれ） }
  function apply(pose) {
    const p = finish(pose);
    for (const name of order) { bones[name].quaternion.copy(local(name, p[name] || ID)); bones[name].position.copy(rest[name].p); }
    if (p.hipsPos) bones.hips.position.add(V(...p.hipsPos).divideScalar(scale));
  }
  // ひじの補助の骨は、前腕の半分だけ回す（ひじの太さを保つ）
  function finish(pose) {
    for (const side of ['L', 'R']) if (pose['forearm' + side]) pose['elbowfix' + side] = Q().slerp(pose['forearm' + side], .5);
    return pose;
  }

  // 時刻 → 姿勢 の関数を、1秒30コマで動きに焼く
  function bake(name, duration, fn, fps = 30) {
    const n = Math.round(duration * fps), times = new Float32Array(n + 1);
    const values = Object.fromEntries(order.map(b => [b, new Float32Array((n + 1) * 4)]));
    const hip = new Float32Array((n + 1) * 3), last = {};
    for (let i = 0; i <= n; i++) {
      const t = times[i] = i / fps, pose = finish(fn(t));
      for (const b of order) {
        const q = local(b, pose[b] || ID);
        if (last[b] && last[b].dot(q) < 0) q.set(-q.x, -q.y, -q.z, -q.w);   // 遠回りしない
        last[b] = q; q.toArray(values[b], i * 4);
      }
      rest.hips.p.clone().add(V(...(pose.hipsPos || [0, 0, 0])).divideScalar(scale)).toArray(hip, i * 3);
    }
    const tracks = order.map(b => new THREE.QuaternionKeyframeTrack(bones[b].name + '.quaternion', times, values[b]));
    tracks.push(new THREE.VectorKeyframeTrack('hips.position', times, hip));
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
  function idlePose(t, amount = 1) {
    const b = Math.sin(TAU * t / 3) * amount, w = Math.sin(TAU * t / 6) * amount, w2 = Math.sin(TAU * t / 6 + 1.1) * amount;
    const pose = stand({ sway: w * .007, roll: -w * .7, drop: .006 + (b * .5 + .5) * .002 });
    Object.assign(pose, { spine: R('x', b * .5, 'z', w * .5), chest: R('x', -b * 1.3, 'z', w * .4), neck: R('x', b * .5), head: R('x', b * .4 + w2 * .8, 'y', w2 * 1.6, 'z', -w * .5) });
    armsDown(pose, { bend: 9 + b * 1.2, open: b * .7 });
    pose.shoulderL = R('z', b * .8); pose.shoulderR = R('z', -b * .8);
    return legs(pose);
  }
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

  // 手を振る腕の形。p＝{ flex, abd＝二の腕, dir＝ひじを曲げる向き, bend＝ひじ, twist＝前腕のひねり, wrist＝手首を横へ, back＝手首を反らす }
  const foreAxis = pos.handR.clone().sub(pos.forearmR).normalize();
  function waveArm(pose, p) {
    pose.shoulderR = R('z', -p.lift);
    pose.upperarmR = R('x', -p.flex, 'z', -p.abd);
    const bendAxis = V(-Math.cos(p.dir * DEG), 0, -Math.sin(p.dir * DEG));
    pose.forearmR = axisQ(bendAxis, p.bend).multiply(axisQ(foreAxis, p.twist * .78));
    pose.handR = R('z', p.wrist, 'x', p.back).multiply(axisQ(foreAxis, p.twist * .22));
    return pose;
  }
  const DOWN = { lift: 0, flex: 0, abd: 0, dir: 0, bend: 9, twist: 0, wrist: 0, back: 0 };
  const VIA = { lift: 3, flex: 16, abd: 6, dir: 30, bend: 95, twist: 30, wrist: 0, back: 0 };
  const UP = { lift: 7, flex: 22, abd: 17, dir: 76, bend: 140, twist: 78, wrist: 0, back: -8 };
  const mixP = (a, b, w) => Object.fromEntries(Object.keys(a).map(k => [k, lerp(a[k], b[k], w)]));

  // 手を振る（立ち姿から始まり、立ち姿に戻る）。3秒
  const WAVE = 3.0;
  function wavePose(t) {
    const up = out(seg(t, .08, .62)), down = io(seg(t, 2.18, 2.86)), k = up * (1 - down);           // k＝腕が上がっている度合い
    const pose = idlePose(t, 1 - k * .6);
    // 体も一緒に：ひと息ためてから、振るほうの肩を上げ、頭を少しかしげる。体重は反対の足へ
    const dip = bump(t, 0, .3) * (1 - up);
    const sway = Math.sin(TAU * 1.85 * (t - .62)) * k * ss(seg(t, .5, .8));
    pose.hipsPos[0] += k * .012; pose.hipsPos[1] -= dip * .006;
    pose.hips.premultiply(R('z', k * 1.2));
    pose.spine.premultiply(R('x', dip * 1.5, 'z', -k * 1.6 + sway * .5));
    pose.chest.premultiply(R('x', dip * 2 - k * 1.5, 'z', -k * 2.2 + sway * .7, 'y', -k * 3));
    pose.neck.premultiply(R('z', -k * 2));
    pose.head.premultiply(R('z', -k * 4 - sway * 1.2, 'x', -k * 2 + bump(t, .5, .95) * 5));
    pose.upperarmL = R('x', k * 4, 'z', k * 2 - sway * .6);
    // 腕：前から持ち上げて、外へ開く（途中で横に張らない）
    let p = up < 1 || down > 0 ? (k < .5 ? mixP(DOWN, VIA, ss(k * 2)) : mixP(VIA, UP, ss(k * 2 - 1))) : { ...UP };
    // 振る：ひじから先を左右に。手首は少し遅れてついてくる。最後のひと振りは小さく
    const s = seg(t, .6, 2.3), cycles = 3, fade = ss(seg(t, .56, .78)) * (1 - ss(seg(t, 1.9, 2.3)));
    const swing = Math.sin(TAU * cycles * s) * fade, late = Math.sin(TAU * cycles * s - 1.15) * fade;
    p.bend += swing * 15 * k; p.dir += swing * 5 * k; p.twist += swing * 6 * k; p.wrist = -late * 17 * k; p.flex += swing * 1.5 * k;
    waveArm(pose, p);
    // おろした腕は、行きすぎてから戻る
    const settle = Math.sin(seg(t, 2.6, 3.0) * Math.PI) * 3;
    pose.upperarmR.premultiply(R('x', settle));
    return legs(pose);
  }

  // 会釈（紺の場面）。2.4秒
  const NOD = 2.4;
  function nodPose(t) {
    const k = bump(t, .15, 1.75) ** 1.4, k2 = bump(t, .3, 1.9);
    const pose = idlePose(t, 1 - k * .5);
    pose.hipsPos[2] -= k * .012;
    pose.spine.premultiply(R('x', k * 4)); pose.chest.premultiply(R('x', k * 6)); pose.neck.premultiply(R('x', k2 * 5)); pose.head.premultiply(R('x', k2 * 9));
    pose.upperarmL.premultiply(R('x', -k * 4)); pose.upperarmR.premultiply(R('x', -k * 4));
    return legs(pose);
  }

  // 振り向く：打つ手を止め、顔が先に向き、右足を引いて半分、左足を回して残り半分。そのまま手を振る
  const NOTICE = .34, TURN = 1.16, SETTLE = .34, T1 = NOTICE + TURN, GREET0 = T1 + SETTLE - .2;
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
    if (t < GREET0) return turnPose(t);
    const a = turnPose(Math.min(t, T1 + SETTLE)), b = wavePose(t - GREET0);
    return t < T1 + SETTLE ? blend(a, b, ss(seg(t, GREET0, T1 + SETTLE)), rig.order) : b;
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
