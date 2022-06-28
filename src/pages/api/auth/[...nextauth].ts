
import faunadb from "faunadb"
import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { faunaClient } from "../../../services/fauna"

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID_KEY,
      clientSecret: process.env.GITHUB_CLIENT_SECRET_KEY,
      authorization: {
        params: {
          scope: 'read:user'
        }
      }
    }),
  ],
  callbacks: {
    async session({ session }) {
      try {
        const activeSubscription = await faunaClient.query(
          faunadb.query.Get(
            faunadb.query.Intersection([
              faunadb.query.Match(
                faunadb.query.Index('subscription_by_user_ref'),
                faunadb.query.Select(
                  'ref',
                  faunadb.query.Get(
                    faunadb.query.Match(
                      faunadb.query.Index('user_by_email'),
                      faunadb.query.Casefold(session.user.email)
                    )
                  )
                )
              ),
              faunadb.query.Match(
                faunadb.query.Index('subscription_by_status'),
                'active'
              )
            ])
          )
        )
        
        return {
          ...session,
          activeSubscription
        };        
      } catch {
        return {
          ...session,
          activeSubscription: null,
        }
      }
    },
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