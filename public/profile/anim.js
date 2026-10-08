// 人物の動きを、ページの側で組み立てる（2026-10-08）。
// avatar.glb に入っている Idle / Nod / Wave は使わず、ここで作った動きに差し替える。
// 確かめ方：~/.fukkaru/satsuei/3d/seq.py（時刻を指定してコマに並べ、手足の速さを数える）
//
// 書き方の約束
// ・姿勢は「休みの姿勢から、体の向き（x=本人の左・y=上・z=正面）で何度回すか」で書く。親が回れば、子の軸も一緒に回る。
// ・位置はメートル。原点は足もとの真ん中（scene.js の avatar の中）。
// ・腕は、読み込んだ直後に fixArms で関節を置き直してから動かす（骨が、腕より6〜8cm前に置いてあるため）。
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
// 袖口・わきの形と、肩の重み（胴 → 鎖骨 → 補助の骨 armfix → 二の腕）は、3Dのファイルの側で作り直してある
// （2026-10-08。作り方は ~/.fukkaru/satsuei/3d/sode/tsukuru.py。張り直した面は sode という別の部品）。
// ここでやるのは、関節の置き直し・暗い色の直し・右手の開いた形の3つ。
const JOINT = { C: [.195, 1.335, -.062], E: [.248, 1.080, -.081], W: [.252, .792, .027] };   // 肩・ひじ・手首（左。右は x を返す）。tsukuru.py にも同じ数字がある
const ARM_BONES = ['upperarm', 'elbowfix', 'forearm', 'hand'];
const HEM = .172;   // 袖口の線（肩のまん中から腕に沿った距離）
export function fixArms(root) {
  if (root.userData.armsFixed) return;
  root.userData.armsFixed = true;
  root.updateWorldMatrix(true, true);
  const av = root.parent.matrixWorld, toAv = av.clone().invert(), bone = {}, meshes = [];
  root.traverse(o => { if (o.isBone) bone[o.name] = o; if (o.isSkinnedMesh) meshes.push(o); });
  const before = new Map(Object.values(bone).map(b => [b, b.matrixWorld.clone()]));
  const place = (b, p) => { b.position.copy(b.parent.worldToLocal(p.clone().applyMatrix4(av))); b.updateWorldMatrix(false, true); };
  const J = {};
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    const j = J[s] = Object.fromEntries(Object.entries(JOINT).map(([k, p]) => [k, V(p[0] * sx, p[1], p[2])]));
    place(bone['upperarm' + s], j.C); place(bone['armfix' + s], j.C); place(bone['forearm' + s], j.E); place(bone['elbowfix' + s], j.E); place(bone['hand' + s], j.W);
  }
  // 骨を動かしても、休みの姿勢の形は変えない（逆行列を、動かしたぶんだけ直す）
  const done = new Set();
  for (const mesh of meshes) {
    const sk = mesh.skeleton; if (done.has(sk)) continue; done.add(sk);
    sk.bones.forEach((b, i) => { sk.boneInverses[i] = b.matrixWorld.clone().invert().multiply(before.get(b)).multiply(sk.boneInverses[i]); });
  }
  for (const mesh of meshes) {
    if (mesh.name === 'sode') continue;   // 張り直した面は、色も形もファイルの側で決めてある
    const m = readMesh(mesh, toAv);
    tonePatch(mesh, m, J);
    openHand(mesh, m, J);
  }
}

// 頂点ごとの「どの骨について動くか」と、休みの姿勢での位置（足もとの真ん中から・メートル）を読む
function readMesh(mesh, toAv) {
  const g = mesh.geometry, sk = mesh.skeleton, n = g.attributes.position.count, names = sk.bones.map(b => b.name);
  const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4), P = new Float32Array(n * 3), v = V();
  const M = toAv.clone().multiply(sk.bones[0].matrixWorld).multiply(sk.boneInverses[0]);
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < 4; k++) { si[i * 4 + k] = g.attributes.skinIndex.getComponent(i, k); sw[i * 4 + k] = g.attributes.skinWeight.getComponent(i, k); }
    v.fromBufferAttribute(g.attributes.position, i).applyMatrix4(M); P[i * 3] = v.x; P[i * 3 + 1] = v.y; P[i * 3 + 2] = v.z;
  }
  return { g, n, names, si, sw, P, M };
}

// 色の直しをかける範囲を、頂点に印（tone）として持たせる（x＝どれだけ直すか、y＝そのうち肌の割合）。
// 腕の内側・手のひら・わきの下は、3Dを作るときに体の陰になっていて、絵が焦げ茶〜黒で塗られている。
// （同じ計算が tsukuru.py にもある。張り直した面の色を、となりの面とそろえるため。ここを変えたら、あちらも）
function tonePatch(mesh, m, J) {
  const { g, n, names, P } = m, tone = new Float32Array(n * 2), smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  for (const [s, sx] of [['L', 1], ['R', -1]]) {
    const C = J[s].C, axis = J[s].E.clone().sub(C).normalize(), arm = new Set([...ARM_BONES, 'armfix'].map(b => names.indexOf(b + s)));
    for (let i = 0; i < n; i++) {
      if (P[i * 3] * sx < .04) continue;
      const x = P[i * 3] - C.x, y = P[i * 3 + 1] - C.y, z = P[i * 3 + 2] - C.z, d = Math.hypot(x, y, z), al = x * axis.x + y * axis.y + z * axis.z;
      let a = 0; for (let k = 0; k < 4; k++) if (arm.has(m.si[i * 4 + k])) a += m.sw[i * 4 + k];
      const near = 1 - smooth(.17, .25, d), skin = a * smooth(HEM - .008, HEM + .008, al), shirt = y < .06 ? near : 0;
      // x が1を超えるぶん＝わきに近い肌（二の腕の内側）。ここは筋のような黒ずみが残りやすいので、いちばん強く均す
      tone[i * 2] = Math.max(skin, shirt) + skin * near; tone[i * 2 + 1] = skin;
    }
  }
  g.setAttribute('tone', new THREE.BufferAttribute(tone, 2));
  for (const material of [mesh.material].flat()) toneFix(material);
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
  material.customProgramCacheKey = () => 'tone-fix-5';
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
  // 腕を斜め上へ伸ばし、ひじは軽く曲げるだけ。開いた手のひらを正面へ向けて、手首から先で小さく3往復。
  // ★ひじを大きく曲げ伸ばしして振らない。2026-10-08、見本の絵に合わせて「ひじを外へ出して前腕を大きく振る」形にしたら、
  //   中元さんに「腕の動きがキモい」と言われて戻した（ひじの曲がりが 50±26度 だった。いまは 24±9度）
  const WAVE = 3.4, REST_A = 12, TOP_A = 142;   // 二の腕の角度（真下＝0・真上＝180）
  const UPPER = pos.forearmR.distanceTo(pos.upperarmR), FORE = pos.handR.distanceTo(pos.forearmR);
  function wavePose(t) {
    const up = ss(seg(t, .08, .8)), down = ss(seg(t, 2.5, 3.2)), k = up * (1 - down);              // k＝腕が上がっている度合い
    const pose = idleBase(t, 1 - k * .6);
    const s = seg(t, .74, 2.5), fade = ss(seg(t, .72, 1.0)) * (1 - ss(seg(t, 2.15, 2.5)));
    const swing = Math.sin(TAU * 3 * s) * fade, late = Math.sin(TAU * 3 * s - 1.1) * fade;         // 振り（3往復）と、遅れてついてくる手首
    // 体も一緒に：ひと息ためてから、上げるほうの肩が上がり、体は少しだけ反対へ。体重は左足へ
    const dip = bump(t, 0, .34) * (1 - up);
    pose.hipsPos[0] += k * .014 + swing * .003; pose.hipsPos[1] += -dip * .007 + k * .004;
    pose.hips.premultiply(R('z', k * 1.4));
    pose.spine.premultiply(R('x', dip * 1.6 - k * .6, 'z', -k * 2.2 + swing * .4));
    pose.chest.premultiply(R('x', dip * 2 - k * 1.2, 'z', -k * 3 + swing * .5, 'y', -k * 3));
    pose.neck.premultiply(R('z', k * 2.4));
    pose.head.premultiply(R('z', k * 3 - swing * .5, 'x', -k * 1 + bump(t, .55, 1.05) * 2.5));
    pose.upperarmL = R('x', k * 3, 'z', k * 4 - swing * .7); pose.forearmL = R('x', -9 - k * 6);
    // 腕：体の斜め前から上げて、上で外へ開く。途中はひじを曲げて、手が体の近くを通る
    const a = lerp(REST_A, TOP_A - swing * 4 + bump(t, .68, 1.02) * 4, k) * DEG, plane = lerp(64, 22, ss(seg(k, .35, 1))) * DEG;
    const side = V(-Math.cos(plane), 0, Math.sin(plane)), U = side.multiplyScalar(Math.sin(a)).add(V(0, -Math.cos(a), 0)).normalize();
    pose.shoulderR = R('z', -22 * ss(seg(a / DEG, 45, 140)), 'y', -4 * k);
    const S = rig.fk(pose).P.upperarmR;
    const bend = (lerp(9, 24, k) + Math.sin(Math.PI * Math.pow(k, .8)) * 42 + swing * 9 * k) * DEG;
    const fwd = V(0, 0, 1).addScaledVector(U, -U.z).normalize(), upw = V(0, 1, 0).addScaledVector(U, -U.y).normalize();
    const toward = fwd.lerp(upw, ss(seg(k, .08, .92))).normalize();                                // ひじを曲げる向き（下では前へ、上では頭のほうへ）
    const F = U.clone().multiplyScalar(Math.cos(bend)).addScaledVector(toward, Math.sin(bend)).normalize();
    const wrist = S.clone().addScaledVector(U, UPPER).addScaledVector(F, FORE);
    const palm = V(1, 0, 0).lerp(V(.2, 0, 1), ss(seg(k, .15, .75))).normalize();
    rig.arm(pose, 'R', wrist, F.clone().multiplyScalar(-1).add(U), { palm, share: .34 });
    pose.handR.multiply(R('x', late * 20 * k, 'z', -8 * k));                                       // 手首：振りに遅れて横へ。少し反らす
    pose.open = ss(seg(k, .25, .8));                                                               // 上げながら、手を開く
    // おろした腕は、行きすぎてから戻る
    pose.upperarmR.premultiply(R('x', Math.sin(seg(t, 3.0, WAVE) * Math.PI) * 3.5));
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
