import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { updateProfile, changePassword } from '../controllers/auth.controller';

const router = Router();

router.use(protect);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

export default router;
