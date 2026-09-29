import { Router } from 'express';
import { protect } from '../middleware/auth';
import { createDispute, getDisputes, addDisputeMessage, resolveDispute, getAllDisputes } from '../controllers/dispute.controller';

const router = Router();

router.use(protect);
router.post('/', createDispute);
router.get('/', getDisputes);
router.put('/:id/messages', addDisputeMessage);
router.put('/:id/resolve', resolveDispute);
router.get('/all', getAllDisputes);

export default router;
