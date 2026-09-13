import { Play } from 'lucide-react';
import instaData from '../content/insta.json';

/**
 * インスタの最新投稿（自前）
 *
 * **他社の埋め込み（Elfsight）をやめて置き換えたものです。**
 * 画像は `~/.fukkaru/insta.py` がこちらに落として、`public/insta/` に置いています。
 * インスタの画像URLは期限切れになるので、直リンクにはしません。
 *
 * **投稿の文面は載せません。**過去の投稿に「処分」などが入っており、
 * 許認可の線を越えるためです（写真・日付・リンクだけ）。
 */

type Toukou = {
  id: string;
  hi: string;
  kata: string;
  ga: string;
  haba?: number;
  takasa?: number;
  url: string;
};

const data = instaData as { torikomi: string; username: string; toukou: Toukou[] };

const hizukeHyouji = (hi: string) => {
  const [y, m, d] = hi.split('-');
  return `${y}年${Number(m)}月${Number(d)}日`;
};

const InstagramFeed = () => {
  const toukou = data.toukou ?? [];
  if (toukou.length === 0) return null;

  return (
    <div>
      <ul className="grid grid-cols-3 gap-2 sm:gap-4">
        {toukou.map((t) => (
          <li key={t.id}>
            <a
              href={t.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${hizukeHyouji(t.hi)}のInstagramの投稿を見る`}
              className="relative block aspect-[4/5] overflow-hidden rounded border border-hairline bg-ink-100"
            >
              <img
                src={t.ga}
                alt={`${hizukeHyouji(t.hi)}のInstagramの投稿`}
                width={t.haba || 576}
                height={t.takasa || 720}
                loading="lazy"
                decoding="async"
                /* **切らない。**投稿カードは上と下に文字が乗っているので、
                   object-cover にすると見出しと帯が消えます（2026-09-13、実物で確認） */
                className="h-full w-full object-contain"
              />
              {t.kata !== 'IMAGE' && (
                <span
                  aria-hidden="true"
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink-900/70 text-white"
                >
                  <Play size={12} fill="currentColor" />
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[13px] text-ink-500">
        Instagramの最新{toukou.length}件です（{hizukeHyouji(data.torikomi.slice(0, 10))}時点）。
        写真を押すとInstagramが開きます。
      </p>
    </div>
  );
};

export default InstagramFeed;
