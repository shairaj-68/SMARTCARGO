import { Response } from 'express';
import User from '../models/user.model';
import Company from '../models/company.model';
import Container from '../models/container.model';
import Booking from '../models/booking.model';
import Payment from '../models/payment.model';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalCompanies, activeContainers, bookedContainers, pendingBookings, revenueResult, completedShipments, cancelledOrders] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Company.countDocuments(),
      Container.countDocuments({ status: 'active' }),
      Container.countDocuments({ status: 'full' }),
      Booking.countDocuments({ status: 'pending' }),
      Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' }, commission: { $sum: '$commission' } } }]),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
    ]);

    const revenue = revenueResult[0] || { total: 0, commission: 0 };

    const monthlyGrowth = await Booking.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCompanies,
        activeContainers,
        bookedContainers,
        pendingBookings,
        revenue: revenue.total,
        commissionEarned: revenue.commission,
        monthlyGrowth: monthlyGrowth[0]?.count || 0,
        completedShipments,
        cancelledOrders,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const query: any = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) query.role = role;

    const users = await User.find(query).select('-password').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });
    const total = await User.countDocuments(query);

    res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllCompanies = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const companies = await Company.find().populate('userId', 'name email').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });
    const total = await Company.countDocuments();

    res.json({ success: true, companies, total, page, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyCompany = async (req: AuthRequest, res: Response) => {
  try {
    const { verificationStatus } = req.body;
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { verificationStatus },
      { new: true }
    );
    res.json({ success: true, company });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRevenue = async (req: AuthRequest, res: Response) => {
  try {
    const revenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$totalAmount' }, commission: { $sum: '$commission' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, revenue });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
