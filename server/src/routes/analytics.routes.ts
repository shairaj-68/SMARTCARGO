import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getAdminAnalytics, getCompanyAnalytics } from '../controllers/analytics.controller';

const router = Router();

router.use(protect);
router.get('/admin', getAdminAnalytics);
router.get('/company/:companyId', getCompanyAnalytics);

export default router;
