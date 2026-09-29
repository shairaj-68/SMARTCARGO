import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getReviews, replyToReview, createReview, markHelpful, reportReview, getReviewAnalytics } from '../controllers/review.controller';

const router = Router();

router.get('/:companyId/analytics', getReviewAnalytics);
router.get('/:companyId', getReviews);

router.use(protect);
router.post('/', createReview);
router.put('/:id/reply', replyToReview);
router.put('/:id/helpful', markHelpful);
router.put('/:id/report', reportReview);

export default router;
