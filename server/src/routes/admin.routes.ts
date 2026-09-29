import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { getDashboardStats, getAllUsers, getAllCompanies, verifyCompany, updateUserStatus, getRevenue } from '../controllers/admin.controller';

const router = Router();

router.use(protect);
router.use(authorize('admin'));
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/companies', getAllCompanies);
router.put('/companies/:id/verify', verifyCompany);
router.put('/users/:id/status', updateUserStatus);
router.get('/revenue', getRevenue);

export default router;
