import { Router } from 'express';
import { analyzeDocument, getCustomsChecklist } from '../controllers/compliance.controller';

const router = Router();

router.post('/document/analyze', analyzeDocument);
router.get('/checklist', getCustomsChecklist);

export default router;
