import { Router } from 'express';
import { protect } from '../middleware/auth';
import { createOrder, verifyPayment, getMyPayments } from '../controllers/payment.controller';

const router = Router();

router.use(protect);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/my', getMyPayments);

export default router;
