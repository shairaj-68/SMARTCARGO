import { Response } from 'express';
import Booking from '../models/booking.model';
import Payment from '../models/payment.model';
import Container from '../models/container.model';
import { AuthRequest } from '../middleware/auth';

export const getAdminAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const [bookingTrends, monthlyRevenue, popularRoutes, containerUtilization, topCompanies] = await Promise.all([
      Booking.aggregate([
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
        { $limit: 30 },
      ]),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, commission: { $sum: '$commission' } } },
        { $sort: { _id: 1 } },
      ]),
      Container.aggregate([
        { $group: { _id: { origin: '$originPort', destination: '$destinationPort' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Container.aggregate([
        { $group: { _id: '$type', totalCapacity: { $sum: '$capacity' }, totalBooked: { $sum: '$bookedSpace' } } },
      ]),
      Booking.aggregate([
        { $group: { _id: '$companyId', bookings: { $sum: 1 }, revenue: { $sum: '$requiredCBM' } } },
        { $sort: { bookings: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'company' } },
      ]),
    ]);

    res.json({
      success: true,
      analytics: { bookingTrends, monthlyRevenue, popularRoutes, containerUtilization, topCompanies },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCompanyAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { companyId } = req.params;

    const [containerStats, bookingStats, revenueStats] = await Promise.all([
      Container.aggregate([
        { $match: { companyId: companyId as any } },
        { $group: { _id: '$status', count: { $sum: 1 }, totalCapacity: { $sum: '$capacity' }, totalBooked: { $sum: '$bookedSpace' } } },
      ]),
      Booking.aggregate([
        { $match: { companyId: companyId as any } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: { companyId: companyId as any, status: 'completed' } },
        { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({ success: true, analytics: { containerStats, bookingStats, revenueStats } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
