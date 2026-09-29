import { Router } from 'express';
import { protect } from '../middleware/auth';
import { askAi } from '../controllers/ai.controller';

const router = Router();

router.use(protect);
router.post('/ask', askAi);

export default router;
