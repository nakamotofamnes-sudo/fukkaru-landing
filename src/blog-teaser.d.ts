declare module 'virtual:blog-teaser' {
  const list: {
    slug: string;
    title: string;
    metaDescription?: string;
    category?: string;
    publishDate?: string;
    heroImage?: string;
  }[];
  export default list;
}
