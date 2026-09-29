import { Response } from 'express';
import Review from '../models/review.model';
import { AuthRequest } from '../middleware/auth';
import Booking from '../models/booking.model';

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { companyId, bookingId, direction, overallRating, categories, comment } = req.body;
    
    // Check if booking is completed (mocking a simple check)
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'completed') return res.status(400).json({ success: false, message: 'Can only review completed bookings' });

    const review = await Review.create({
      customerId: req.user?._id,
      companyId,
      bookingId,
      direction: direction || 'customer_to_company',
      overallRating,
      categories,
      comment,
    });

    res.status(201).json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReviews = async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await Review.find({ companyId: req.params.companyId })
      .populate('customerId', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const replyToReview = async (req: AuthRequest, res: Response) => {
  try {
    const { reply } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { reply, repliedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markHelpful = async (req: AuthRequest, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (!review.helpfulUsers.includes(req.user?._id)) {
      review.helpfulUsers.push(req.user?._id);
      review.helpfulCount += 1;
      await review.save();
    }

    res.json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reportReview = async (req: AuthRequest, res: Response) => {
  try {
    const { reportReason } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isReported: true, reportReason },
      { new: true }
    );
    res.json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReviewAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.params.companyId;
    const reviews = await Review.find({ companyId, direction: 'customer_to_company' });
    
    if (reviews.length === 0) {
      return res.json({ success: true, analytics: null });
    }

    let totalRating = 0;
    const categoriesSum: any = {};
    const categoriesCount: any = {};

    reviews.forEach(review => {
      totalRating += review.overallRating;
      if (review.categories) {
        Object.entries(review.categories).forEach(([key, value]) => {
          if (value) {
            categoriesSum[key] = (categoriesSum[key] || 0) + value;
            categoriesCount[key] = (categoriesCount[key] || 0) + 1;
          }
        });
      }
    });

    const analytics = {
      averageRating: (totalRating / reviews.length).toFixed(1),
      totalReviews: reviews.length,
      categoryAverages: {} as any
    };

    Object.keys(categoriesSum).forEach(key => {
      analytics.categoryAverages[key] = (categoriesSum[key] / categoriesCount[key]).toFixed(1);
    });

    res.json({ success: true, analytics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
