import { Response } from 'express';
import Container from '../models/container.model';
import Booking from '../models/booking.model';
import Company from '../models/company.model';
import Payment from '../models/payment.model';
import Review from '../models/review.model';
import { AuthRequest } from '../middleware/auth';
import { updateContainerSpace, releaseContainerSpace, calculateBookingAmount } from '../services/booking.service';
import Notification from '../models/notification.model';

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const [upcomingShipments, pastShipments, pendingPayments, totalBookedSpace, recentBookings] = await Promise.all([
      Booking.countDocuments({ customerId: req.user?._id, status: { $in: ['confirmed', 'pickup_scheduled', 'in_transit'] } }),
      Booking.countDocuments({ customerId: req.user?._id, status: { $in: ['delivered', 'completed'] } }),
      Payment.countDocuments({ customerId: req.user?._id, status: 'pending' }),
      Booking.aggregate([
        { $match: { customerId: req.user?._id, status: { $nin: ['cancelled'] } } },
        { $group: { _id: null, total: { $sum: '$requiredCBM' } } },
      ]),
      Booking.find({ customerId: req.user?._id }).populate('companyId').populate('containerId').sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({
      success: true,
      stats: {
        upcomingShipments,
        pastShipments,
        pendingPayments,
        totalBookedSpace: totalBookedSpace[0]?.total || 0,
        recentBookings,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchContainers = async (req: AuthRequest, res: Response) => {
  try {
    // Accept both param name styles: origin / originPort (frontend sends originPort)
    const originVal = (req.query.origin || req.query.originPort) as string | undefined;
    const destinationVal = (req.query.destination || req.query.destinationPort) as string | undefined;
    const { containerType, minCBM, maxCBM, minPrice, maxPrice, departureDate, cargoType, requiredSpace } = req.query;

    const query: any = { status: 'active', availableSpace: { $gt: 0 } };

    if (originVal) query.originPort = { $regex: originVal, $options: 'i' };
    if (destinationVal) query.destinationPort = { $regex: destinationVal, $options: 'i' };
    if (containerType) query.type = containerType;

    // Minimum space filter (also handle requiredSpace alias from frontend)
    const minSpaceVal = minCBM || requiredSpace;
    if (minSpaceVal) query.availableSpace = { ...query.availableSpace, $gte: Number(minSpaceVal) };
    if (maxCBM) query.availableSpace = { ...query.availableSpace, $lte: Number(maxCBM) };
    if (minPrice) query.pricePerCBM = { $gte: Number(minPrice) };
    if (maxPrice) query.pricePerCBM = { ...query.pricePerCBM, $lte: Number(maxPrice) };
    if (departureDate) query.departureDate = { $gte: new Date(departureDate as string) };
    if (cargoType) query.cargoTypes = cargoType;

    // CRITICAL: Limit results to prevent full collection scan on large datasets
    const containers = await Container.find(query)
      .populate({ path: 'companyId', select: 'companyName rating userId', populate: { path: 'userId', select: 'name' } })
      .sort({ departureDate: 1 })
      .limit(50)
      .lean();

    res.json({ success: true, containers, total: containers.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getContainerDetails = async (req: AuthRequest, res: Response) => {
  try {
    const container = await Container.findById(req.params.id)
      .populate({ path: 'companyId', populate: { path: 'userId', select: 'name email avatar' } });
    if (!container) return res.status(404).json({ success: false, message: 'Container not found' });

    const reviews = await Review.find({ companyId: container.companyId })
      .populate('customerId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, container, reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { containerId, requiredCBM, cargoWeight, cargoType, pickupAddress, deliveryAddress, specialInstructions } = req.body;

    const container = await Container.findById(containerId);
    if (!container) return res.status(404).json({ success: false, message: 'Container not found' });
    if (container.availableSpace < requiredCBM) {
      return res.status(400).json({ success: false, message: 'Not enough space available' });
    }

    const company = await Company.findById(container.companyId);

    const booking = await Booking.create({
      customerId: req.user?._id,
      containerId,
      companyId: container.companyId,
      requiredCBM,
      cargoWeight,
      cargoType,
      pickupAddress,
      deliveryAddress,
      specialInstructions,
      status: 'pending',
    });

    if (company) {
      await Notification.create({
        userId: company.userId,
        title: 'New Booking Request',
        message: `You have a new booking request for ${requiredCBM} CBM space.`,
        type: 'booking',
        link: `/logistics/bookings`,
      });
    }
    
    // Send email notification to customer
    try {
      const { sendBookingConfirmationEmail } = require('../services/email.service');
      const User = require('../models/user.model').default;
      const customer = await User.findById(req.user?._id);
      if (customer?.email) {
        await sendBookingConfirmationEmail(customer.email, { bookingNumber: booking.bookingNumber, requiredCBM });
      }
    } catch (err) {
      console.error('Email error:', err);
    }

    res.status(201).json({ success: true, booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.find({ customerId: req.user?._id })
      .populate('companyId')
      .populate('containerId')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptQuotation = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'payment_pending' },
      { new: true }
    );
    res.json({ success: true, booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, method, transactionId } = req.body;
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
      transactionId,
      status: 'completed',
    });

    await updateContainerSpace(String(booking.containerId), booking.requiredCBM);

    booking.status = 'confirmed';
    booking.paymentId = payment._id as any;
    await booking.save();

    const Conversation = require('../models/conversation.model').default;
    const { v4: uuidv4 } = require('uuid');
    
    const Company = require('../models/company.model').default;
    const company = await Company.findById(booking.companyId);
    
    if (company) {
      // Create the STRICT 1-to-1 Exporter-Carrier chat room for this specific booking
      await Conversation.create({
        conversationId: uuidv4(),
        bookingId: booking._id,
        exporterId: req.user?._id,
        carrierId: company.userId,
        participants: [req.user?._id, company.userId],
      });
    }

    res.json({ success: true, payment, booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    const { companyId, bookingId, rating, comment } = req.body;
    const review = await Review.create({
      customerId: req.user?._id,
      companyId,
      bookingId,
      rating,
      comment,
    });

    const avgRating = await Review.aggregate([
      { $match: { companyId } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (avgRating[0]) {
      await Company.findByIdAndUpdate(companyId, {
        rating: Math.round(avgRating[0].avg * 10) / 10,
        totalReviews: avgRating[0].count,
      });
    }

    res.status(201).json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
