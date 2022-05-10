import faunadb from 'faunadb';
import { stripe } from '../../../services/stripe';
import { faunaClient } from '../../../services/fauna';

type User = {
  ref: {
    id: string;
  },
  data: {
    stripe_custome_id: string
  }
}

export async function saveSubscription (
  subscriptionId: string,
  customerId: string
) {
  const useRef = await faunaClient.query(
    faunadb.query.Get(
      faunadb.query.Match(
        faunadb.query.Index('user_by_stripe_customer_id'),
        customerId
      )
    )
  )

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  const subscriptionData = {
    id: subscription.id,
    userId: useRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
  }

   await faunaClient.query(
     faunadb.query.Create(
       faunadb.query.Collection('subscriptions'),
       { data: subscriptionData }
     )
   )
}