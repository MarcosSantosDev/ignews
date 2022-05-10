import faunadb from 'faunadb';
import { stripe } from '../../../services/stripe';
import { faunaClient } from '../../../services/fauna';

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false
) {
  const useRef = await faunaClient.query(
    faunadb.query.Select(
      'ref',
      faunadb.query.Get(
        faunadb.query.Match(
          faunadb.query.Index('user_by_stripe_customer_id'),
          customerId
        )
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

  if (createAction) {
    await faunaClient.query(
      faunadb.query.Create(
        faunadb.query.Collection('subscriptions'),
        { data: subscriptionData }
      )
    )
  } else {
    await faunaClient.query(
      faunadb.query.Replace(
        faunadb.query.Select(
          'ref',
          faunadb.query.Get(
            faunadb.query.Match(
              faunadb.query.Index('subscription_by_id'),
              subscriptionId
            )
          )
        ),
        { data: subscriptionData }
      )
    )
  }
}