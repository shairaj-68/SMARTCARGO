import { Router } from 'express';
import { recommendContainers } from '../controllers/recommendation.controller';
import { validateBooking, getPriceEstimate, predictDelay, getUtilizationPrediction, getDemandForecast, getMLBenchmarkReport } from '../controllers/prediction.controller';

const router = Router();

router.post('/recommend/containers', recommendContainers);
router.post('/validate/booking', validateBooking);
router.get('/price/estimate', getPriceEstimate);
router.post('/predict/delay', predictDelay);
router.get('/predict/utilization/:containerId', getUtilizationPrediction);
router.get('/demand/forecast', getDemandForecast);
router.get('/benchmark', getMLBenchmarkReport);

export default router;
