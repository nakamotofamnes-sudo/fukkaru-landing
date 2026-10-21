declare module 'virtual:blog-teaser' {
  const list: {
    slug: string;
    title: string;
    metaDescription?: string;
    category?: string;
    publishDate?: string;
  }[];
  export default list;
}
