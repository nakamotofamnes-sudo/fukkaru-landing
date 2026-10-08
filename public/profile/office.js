// 仕事場（room.glb）を、いまの仕事の形に並べ直す（2026-10-08）。
// 形を作り替えるものは無い。位置・向き・色と、画面に映す絵だけをページの側で決める。
// 向きの約束：scene.js が部屋を180度回して置くので、ここでは「見る人から見た向き」で書き、置くときに符号を返す。
import * as THREE from 'three';

export function setupOffice(roomModel) {
  // 名前の頭が合う部品をひとまとめにする（まとめて動かす・回すため）
  const gather = (pattern, pivot = [0, 0, 0]) => {
    const g = new THREE.Group();
    g.position.set(-pivot[0], pivot[1], -pivot[2]);
    roomModel.add(g);
    g.updateMatrixWorld(true);
    for (const o of [...roomModel.children]) if (o !== g && pattern.test(o.name)) g.attach(o);
    return g;
  };
  // 見る人から見て 右へ dx・手前へ dz 動かす
  const move = (g, dx, dz) => { g.position.x -= dx; g.position.z -= dz; };
  roomModel.updateMatrixWorld(true);

  const desk = gather(/^(desk_|keyboard|mouse|laptop_|mon|code\d|lamp_|mug|notebook|pen)/);
  const chair = gather(/^chair/, [-1, 0, -.55]);
  // 机を、立っている人の真後ろへ寄せる（キーボードに手が届く。振り向くと机を背にして立つ形になる）
  move(desk, 1.0, .47);
  // 椅子は、立ち上がって横へ押しやった位置に
  move(chair, -.2, .5);
  chair.rotation.y = .9;

  return { desk, chair };
}
