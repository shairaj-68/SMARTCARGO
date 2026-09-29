import { Router } from 'express';
import { getPriceEstimate, getDemandForecast } from '../controllers/prediction.controller';
import { getControlTowerExceptions, resolveException } from '../controllers/controlTower.controller';
import { getRecommenderEvaluationMetrics } from '../controllers/eval.controller';

const router = Router();

router.get('/price/lane', getPriceEstimate);
router.get('/demand/forecast', getDemandForecast);
router.get('/control-tower/exceptions', getControlTowerExceptions);
router.patch('/control-tower/exceptions/:exceptionId', resolveException);
router.get('/eval/recommender', getRecommenderEvaluationMetrics);

export default router;
