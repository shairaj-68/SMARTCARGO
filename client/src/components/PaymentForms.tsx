import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentAPI } from '../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

const StripeFormContent = ({ bookingId, onSuccess, onError }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (result.error) {
      onError(result.error.message);
      setLoading(false);
    } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      try {
        await paymentAPI.verifyPayment({
          bookingId,
          method: 'stripe',
          transactionId: result.paymentIntent.id
        });
        onSuccess();
      } catch (err: any) {
        onError(err.response?.data?.message || 'Verification failed');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PaymentElement />
      <button disabled={!stripe || loading} className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export const StripePaymentForm = ({ clientSecret, bookingId, onSuccess, onError }: any) => {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeFormContent bookingId={bookingId} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
};
