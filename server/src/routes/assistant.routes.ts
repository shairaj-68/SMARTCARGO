import { Router } from 'express';
import { parseNaturalLanguageQuery, askShipmentQA } from '../controllers/assistant.controller';

const router = Router();

router.post('/parse', parseNaturalLanguageQuery);
router.post('/shipment/:bookingId/ask', askShipmentQA);

export default router;
