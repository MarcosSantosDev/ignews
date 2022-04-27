
import faunadb from "faunadb"
import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { faunaClient } from "../../../services/fauna"

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID_KEY,
      clientSecret: process.env.GITHUB_SECRET_KEY,
      authorization: {
        params: {
          scope: 'read:user'
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const { email } = user;

      try {
        await faunaClient.query(
          faunadb.query.If(
            faunadb.query.Not(
              faunadb.query.Exists(
                faunadb.query.Match(
                  faunadb.query.Index('user_by_email'),
                  faunadb.query.Casefold(user.email)
                )
              )
            ),
            faunadb.query.Create( 
              faunadb.query.Collection('users'),
              { data: { email } }
            ),
            faunadb.query.Get(
              faunadb.query.Match(
                faunadb.query.Index('user_by_email'),
                faunadb.query.Casefold(user.email)
              )
            )
          )
        )

        return true
      } catch {
        return false;
      }
    },
  }
})