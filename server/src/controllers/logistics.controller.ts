import { Response } from 'express';
import Container from '../models/container.model';
import Booking from '../models/booking.model';
import Company from '../models/company.model';
import Payment from '../models/payment.model';
import { AuthRequest } from '../middleware/auth';

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const company = await Company.findOne({ userId: req.user?._id });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    const [totalContainers, activeContainers, totalRevenue, currentBookings, upcomingShipments, avgUtilization] = await Promise.all([
      Container.countDocuments({ companyId: company._id }),
      Container.countDocuments({ companyId: company._id, status: 'active' }),
      Payment.aggregate([
        { $match: { companyId: company._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Booking.countDocuments({ companyId: company._id, status: { $in: ['pending', 'confirmed', 'in_transit'] } }),
      Booking.countDocuments({ companyId: company._id, status: 'confirmed' }),
      Container.aggregate([
        { $match: { companyId: company._id } },
        { $group: { _id: null, avg: { $avg: { $divide: ['$bookedSpace', '$capacity'] } } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalContainers,
        activeContainers,
        totalRevenue: totalRevenue[0]?.total || 0,
        currentBookings,
        upcomingShipments,
        averageUtilization: Math.round((avgUtilization[0]?.avg || 0) * 100),
        customerRating: company.rating,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addContainer = async (req: AuthRequest, res: Response) => {
  try {
    const company = await Company.findOne({ userId: req.user?._id });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    const container = await Container.create({
      ...req.body,
      companyId: company._id,
      availableSpace: req.body.capacity,
    });

    res.status(201).json({ success: true, container });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getContainers = async (req: AuthRequest, res: Response) => {
  try {
    const company = await Company.findOne({ userId: req.user?._id });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    const containers = await Container.find({ companyId: company._id }).sort({ createdAt: -1 });
    res.json({ success: true, containers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateContainer = async (req: AuthRequest, res: Response) => {
  try {
    const company = await Company.findOne({ userId: req.user?._id });
    const container = await Container.findOneAndUpdate(
      { _id: req.params.id, companyId: company?._id },
      req.body,
      { new: true }
    );
    if (!container) return res.status(404).json({ success: false, message: 'Container not found' });
    res.json({ success: true, container });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteContainer = async (req: AuthRequest, res: Response) => {
  try {
    const company = await Company.findOne({ userId: req.user?._id });
    await Container.findOneAndDelete({ _id: req.params.id, companyId: company?._id });
    res.json({ success: true, message: 'Container deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateContainerStatus = async (req: AuthRequest, res: Response) => {
  try {
    const company = await Company.findOne({ userId: req.user?._id });
    const container = await Container.findOneAndUpdate(
      { _id: req.params.id, companyId: company?._id },
      { status: req.body.status },
      { new: true }
    );
    res.json({ success: true, container });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingRequests = async (req: AuthRequest, res: Response) => {
  try {
    const company = await Company.findOne({ userId: req.user?._id });
    const bookings = await Booking.find({ companyId: company?._id })
      .populate('customerId', 'name email phone')
      .populate('containerId')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'accepted' },
      { new: true }
    );
    
    if (booking) {
      const { injectSystemMessage } = require('./message.controller');
      const Conversation = require('../models/conversation.model').default;
      const conversation = await Conversation.findOne({ bookingId: booking._id });
      if (conversation) {
        await injectSystemMessage(conversation._id.toString(), 'Carrier accepted your booking.', { event: 'booking_accepted', status: 'accepted' });
      }
    }

    res.json({ success: true, booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (booking) {
      const { injectSystemMessage } = require('./message.controller');
      const Conversation = require('../models/conversation.model').default;
      const conversation = await Conversation.findOne({ bookingId: booking._id });
      if (conversation) {
        await injectSystemMessage(conversation._id.toString(), 'Carrier rejected your request.', { event: 'booking_rejected', status: 'cancelled' });
      }
    }

    res.json({ success: true, booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const counterOffer = async (req: AuthRequest, res: Response) => {
  try {
    const { pricePerCBM, totalAmount, pickupDate, availableSpace, conditions } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: 'counter_offer',
        quotation: { pricePerCBM, totalAmount, pickupDate, availableSpace, conditions },
      },
      { new: true }
    );

    if (booking) {
      const { injectSystemMessage } = require('./message.controller');
      const Conversation = require('../models/conversation.model').default;
      const conversation = await Conversation.findOne({ bookingId: booking._id });
      if (conversation) {
        await injectSystemMessage(conversation._id.toString(), 'Carrier sent a counter offer.', { event: 'counter_offer', quotation: booking.quotation });
      }
    }

    res.json({ success: true, booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
