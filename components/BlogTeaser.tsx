import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';

// content/articles/*.json をビルド時に読み込む。
// ブログ本体は scripts/build-blog.mjs が静的HTMLとして別に生成しているが、
// トップページからの入口が無いと誰にも見つけてもらえないので、ここで最新3本を見せる。
const modules = import.meta.glob('../content/articles/*.json', { eager: true }) as Record<
  string,
  { default?: Article } & Article
>;

type Article = {
  slug: string;
  title: string;
  metaDescription?: string;
  category?: string;
  publishDate?: string;
};

const articles: Article[] = Object.values(modules)
  .map((m) => (m.default ?? m) as Article)
  .filter((a) => a && a.slug && a.title)
  .sort((a, b) => String(b.publishDate ?? '').localeCompare(String(a.publishDate ?? '')))
  .slice(0, 3);

const BlogTeaser: React.FC = () => {
  if (articles.length === 0) return null;

  return (
    <section id="blog" className="py-16 md:py-20 bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-brand-orange font-bold mb-2">
            <BookOpen size={20} />
            <span>お役立ちブログ</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            作業のコツと、業者の選び方
          </h2>
          <p className="mt-3 text-gray-600 text-sm md:text-base">
            家具の組立や物置の設置、草刈りなど、頼む前に知っておくと得をする話をまとめています。
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {articles.map((a) => (
            <a
              key={a.slug}
              href={`/blog/${a.slug}/`}
              className="group block bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-orange hover:shadow-md transition-all"
            >
              {a.category && (
                <span className="inline-block text-xs font-bold text-brand-orange bg-orange-50 rounded px-2 py-1 mb-3">
                  {a.category}
                </span>
              )}
              <h3 className="font-bold text-gray-800 leading-snug mb-2 group-hover:text-brand-orange transition-colors">
                {a.title}
              </h3>
              {a.metaDescription && (
                <p className="text-sm text-gray-600 line-clamp-3">{a.metaDescription}</p>
              )}
            </a>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="/blog/"
            className="inline-flex items-center gap-2 font-bold text-gray-800 hover:text-brand-orange transition-colors"
          >
            記事の一覧を見る
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default BlogTeaser;
