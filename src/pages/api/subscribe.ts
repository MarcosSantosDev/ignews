import type { NextApiRequest, NextApiResponse } from 'next'
import faunadb from "faunadb"
import { getSession } from 'next-auth/react';
import { faunaClient } from "../../services/fauna"
import { stripe } from '../../services/stripe';

type User = {
  ref: {
    id: string;
  },
  data: {
    stripe_customer_id: string
  }
}

const handlerSubscribe = async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'POST') {
    const session = await getSession({ req: request });

    const user = await faunaClient.query<User>(
      faunadb.query.Get(
        faunadb.query.Match(
          faunadb.query.Index('user_by_email'),
          faunadb.query.Casefold(session.user.email)
        )
      )
    )

    let customerId = user.data.stripe_customer_id;

    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
      });
  
      await faunaClient.query(
        faunadb.query.Update(
          faunadb.query.Ref(
            faunadb.query.Collection('users'),
            user.ref.id
          ),
          {
            data: {
              stripe_custome_id: stripeCustomer.id
            }
          }
        )
      );

      customerId = stripeCustomer.id;
    }
    

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        { price: 'price_1KoUQPKphwYeGqrl5a0UHBko', quantity: 1 }
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL
    });

    return response.status(200).json({ sessionId: stripeCheckoutSession.id });
  } else {
    response.setHeader('Allow', 'POST');
    response.status(405).end('Method not allowed');
  }
}

export default handlerSubscribe;