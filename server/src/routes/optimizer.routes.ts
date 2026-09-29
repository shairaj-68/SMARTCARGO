import { Router } from 'express';
import { optimizePackingV2 } from '../controllers/optimizer.controller';

const router = Router();

router.post('/packing/v2', optimizePackingV2);

export default router;
