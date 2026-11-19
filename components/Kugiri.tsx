import React from 'react';

// 見出しの改行を、ことばのかたまりで決める（2026-11-19）。
// 日本語はどの字の間でも改行できるので、画面の幅によっては「除」「に。」のように
// 1〜2字だけが次の行に落ちる。Chrome は word-break: auto-phrase で文節を探すが、
// iPhone の Safari は効かない（/nihongo-kumihan）。
// 「、」「・」のあとで区切り、かたまりを inline-block にする。1行に入りきらないときは、
// かたまりごと次の行へ送る（かたまりより狭い画面では、かたまりの中で折り返す）。
// 文字は1字も変えない（読み上げ・検索に出る文はそのまま）。
const Kugiri: React.FC<{ text: string; ato?: string }> = ({ text, ato = '、・' }) => {
  const parts: string[] = [];
  let cur = '';
  for (const ch of text) {
    cur += ch;
    if (ato.includes(ch)) {
      parts.push(cur);
      cur = '';
    }
  }
  if (cur) parts.push(cur);
  return (
    <>
      {parts.map((p, i) => (
        <span key={i} className="inline-block">
          {p}
        </span>
      ))}
    </>
  );
};

export default Kugiri;
