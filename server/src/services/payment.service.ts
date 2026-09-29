import razorpay from '../config/razorpay';
import stripe from '../config/stripe';
import crypto from 'crypto';

export const createRazorpayOrder = async (amount: number, receipt: string) => {
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt,
  });
  return order;
};

export const verifyRazorpayPayment = (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): boolean => {
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body.toString())
    .digest('hex');
  return expectedSignature === razorpaySignature;
};

export const createStripePaymentIntent = async (amount: number, currency: string = 'usd') => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
  });
  return paymentIntent;
};

export const createStripeRefund = async (paymentIntentId: string, amount?: number) => {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amount && { amount: Math.round(amount * 100) }),
  });
  return refund;
};
