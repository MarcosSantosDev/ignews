import * as prismic from '@prismicio/client';

export const getPrismicClient = () => {
  const repositoryName = 'app-ignews22';

  const prismicClient = prismic.createClient(
    repositoryName,
    {
      accessToken: process.env.PRISMIC_ACCESS_TOKEN_KEY,
    }
  )

  return prismicClient
}