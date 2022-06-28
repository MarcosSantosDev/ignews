import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import api from '../../services/api'
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss'

type SubscribeButtonProps = {
  priceId: string;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();

 async function handleSubscribe() {
    if (!session) {
      signIn('github');
      return;
    }
  
    if (session.userActiveSubscription) {
      router.push('/posts');
      return;
    }

    try {
      const response = await api.post('/subscribe')

      const { sessionId } = response.data

      const stripe = await getStripeJs();

      stripe.redirectToCheckout({ sessionId })
    } catch(error) {
      alert(error.message)
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  )
}