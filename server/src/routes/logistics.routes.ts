import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { getDashboard, getContainers, addContainer } from '../controllers/logistics.controller';
import { seedLogisticsData } from '../controllers/seed.controller';

const router = Router();

router.use(protect);
router.use(authorize('logistics'));

router.get('/dashboard', getDashboard);
router.post('/seed', seedLogisticsData);

router.route('/containers')
  .get(getContainers)
  .post(addContainer);

export default router;
