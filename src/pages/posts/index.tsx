import { GetStaticProps } from "next";
import Head from "next/head";
import * as prismic from '@prismicio/client';
import { RichText } from 'prismic-dom'
import { getPrismicClient } from '../../services/prismic'
import styles from "./styles.module.scss";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
}

type PostsProps = {
  posts: Post[]
}

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {
            posts.map((post) => (
              <a href="#" key={post.slug}>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>              
            ))
          }
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismicClient = getPrismicClient();
  const response = await prismicClient.getAllByType('posts', {
    predicates: [
      prismic.predicate.at('document.type', 'posts')
    ],
    fetch: ['posts.title', 'posts.content'],
    pageSize: 100
  });

  const posts = response.map(post => {
    return {
      slug: post.id,
      title: RichText.asText(post.data.title),
      excerpt: post.data.content.find(content => {
        return content.type === 'paragraph'
      })?.text ?? '',
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    }
  })

  return {
    props: {
      posts
    }
  }
}