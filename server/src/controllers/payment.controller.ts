import { Response } from 'express';
import Payment from '../models/payment.model';
import Booking from '../models/booking.model';
import { AuthRequest } from '../middleware/auth';
import { createRazorpayOrder, createStripePaymentIntent, verifyRazorpayPayment } from '../services/payment.service';
import { calculateBookingAmount } from '../services/booking.service';
import Container from '../models/container.model';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, method } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const container = await Container.findById(booking.containerId);
    if (!container) return res.status(404).json({ success: false, message: 'Container not found' });

    const { amount, totalAmount } = calculateBookingAmount(booking.requiredCBM, container.pricePerCBM);

    if (method === 'razorpay') {
      const order = await createRazorpayOrder(totalAmount, bookingId);
      return res.json({ success: true, order, amount: totalAmount });
    }

    if (method === 'stripe') {
      const paymentIntent = await createStripePaymentIntent(totalAmount);
      return res.json({ success: true, clientSecret: paymentIntent.client_secret, amount: totalAmount });
    }

    res.status(400).json({ success: false, message: 'Invalid payment method' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, method, razorpayOrderId, razorpayPaymentId, razorpaySignature, transactionId } = req.body;

    if (method === 'razorpay') {
      const isValid = verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
      if (!isValid) return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const container = await Container.findById(booking.containerId);
    if (!container) return res.status(404).json({ success: false, message: 'Container not found' });

    const { amount, commission, gst, totalAmount } = calculateBookingAmount(booking.requiredCBM, container.pricePerCBM);

    const payment = await Payment.create({
      bookingId,
      customerId: req.user?._id,
      companyId: booking.companyId,
      amount,
      commission,
      gst,
      totalAmount,
      method,
      transactionId: transactionId || razorpayPaymentId || '',
      status: 'completed',
    });

    booking.status = 'confirmed';
    booking.paymentId = payment._id as any;
    await booking.save();

    container.bookedSpace += booking.requiredCBM;
    container.availableSpace -= booking.requiredCBM;
    if (container.availableSpace <= 0) container.status = 'full';
    await container.save();
    
    // Send payment receipt email to customer
    try {
      const { sendPaymentSuccessEmail } = require('../services/email.service');
      const User = require('../models/user.model').default;
      const customer = await User.findById(req.user?._id);
      if (customer?.email) {
        await sendPaymentSuccessEmail(customer.email, { bookingNumber: booking.bookingNumber, amount });
      }
    } catch (err) {
      console.error('Email error:', err);
    }

    res.json({ success: true, payment, booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyPayments = async (req: AuthRequest, res: Response) => {
  try {
    const payments = await Payment.find({ customerId: req.user?._id })
      .populate({ path: 'bookingId', populate: { path: 'containerId' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
