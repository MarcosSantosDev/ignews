import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { RichText } from "prismic-dom";
import { getPrismicClient } from "../../services/prismic";
import Head from "next/head";
import styles from "./post.module.scss";

type PostProps = {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

export default function Post({ post }: PostProps) {
  return (
    <>
    <Head>
      <title>{post.title} | Ignews</title>
    </Head>

    <main className={styles.container}>
      <article className={styles.post}>
        <h1>{post.title}</h1>
        <time>{post.updatedAt}</time>
        <div
          className={styles.postContent}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  // const session = await getSession();
  const { slug } = params;
  const prismicClient = getPrismicClient();

  const response = await prismicClient.getByUID('posts', String(slug));

  return {
    props: {
      post: {
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asText(response.data.content),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      },
    }
  }
}