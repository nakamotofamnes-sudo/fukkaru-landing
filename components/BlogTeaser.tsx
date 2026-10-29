import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

// 最新3本は vite.config.ts の blogTeaser() がビルド時に選んで渡す。
// ブログ本体は scripts/build-blog.mjs が静的HTMLとして別に生成しているが、
// トップページからの入口が無いと誰にも見つけてもらえないので、ここで最新3本を見せる。
import latest from 'virtual:blog-teaser';

type Article = {
  slug: string;
  title: string;
  metaDescription?: string;
  category?: string;
  publishDate?: string;
  heroImage?: string;
};

const articles: Article[] = latest;

const BlogTeaser: React.FC = () => {
  if (articles.length === 0) return null;

  return (
    <section id="blog" className="section border-t border-hairline bg-canvas">
      <div className="shell">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <span className="eyebrow">Blog</span>
            <h2 className="h-section">作業のコツと、業者の選び方</h2>
            <p className="lede">
              家具の組立や物置の設置、草刈りなど、頼む前に知っておくと得をする話をまとめています。
            </p>
          </div>
          <a href="/blog/" className="btn btn-outline shrink-0">
            記事の一覧を見る
            <ArrowRight size={16} />
          </a>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {articles.map((a) => (
            // 2026-10-29：ブログ一覧と同じく、写真つきの札にして分類は琥珀の印に
            <a key={a.slug} href={`/blog/${a.slug}/`} className="card card-hover group flex flex-col overflow-hidden">
              {a.heroImage && (
                <img
                  src={a.heroImage}
                  alt=""
                  width={1200}
                  height={630}
                  loading="lazy"
                  decoding="async"
                  className="block aspect-[1200/630] w-full object-cover"
                />
              )}
              <div className="flex flex-1 flex-col p-6">
              {/* 分類の印は灰色のまま（トップでは琥珀の印＝「人気」「キャンペーン」なので、意味を混ぜない） */}
              {a.category && <span className="chip w-fit">{a.category}</span>}
              <h3 className="mt-3 flex items-start justify-between gap-2 text-[16px] font-semibold leading-[1.6] text-ink-900">
                <span>{a.title}</span>
                <ArrowUpRight size={16} className="mt-1 shrink-0 text-ink-500 transition-colors group-hover:text-ink-900" />
              </h3>
              {a.metaDescription && (
                <p className="mt-2.5 text-[13px] leading-[1.8] text-ink-500">{a.metaDescription}</p>
              )}
              {a.publishDate && (
                <time className="mt-4 text-[12px] tabular-nums text-ink-500">{a.publishDate}</time>
              )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogTeaser;
