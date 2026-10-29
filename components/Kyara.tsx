import React from 'react';
import size from '../content/kyara.json';

// 中元さんのキャラ（2026-10-29）。中元さん「シンプルすぎて味気ない」→ ブログと同じく、仕事ごとの姿を置く。
// 絵は public/kyara/（scripts/make-kyara.mjs で作る）。大きさは content/kyara.json。
// 縦横を書いて、読み込みで画面がガタッと動かないようにする。高さの倍率は className で --k を渡す
// （例：className="[--k:.22] sm:[--k:.26]"）。飾りなので alt は空。
type Size = Record<string, { l: [number, number]; s: [number, number] }>;

type Props = {
  name: string;
  small?: boolean;
  eager?: boolean;
  className?: string;
};

const Kyara: React.FC<Props> = ({ name, small = false, eager = false, className = '' }) => {
  const s = (size as Size)[name];
  if (!s) return null;
  const [w, h] = small ? s.s : s.l;
  return (
    <img
      src={`/kyara/${small ? 's/' : ''}${name}.webp`}
      alt=""
      width={w}
      height={h}
      loading={eager ? undefined : 'lazy'}
      decoding="async"
      className={`kyara ${className}`}
      style={{ ['--kh' as string]: h } as React.CSSProperties}
    />
  );
};

export default Kyara;
