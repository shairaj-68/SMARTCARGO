import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { getDashboard } from '../controllers/customer.controller';
import { seedCustomerData } from '../controllers/seed.controller';

const router = Router();

router.use(protect);
router.get('/dashboard', authorize('customer'), getDashboard);
router.post('/seed', authorize('customer'), seedCustomerData);

export default router;
