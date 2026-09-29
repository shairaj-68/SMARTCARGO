import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { searchContainers, getContainerDetails } from '../controllers/customer.controller';
import { addContainer, getContainers, updateContainer, deleteContainer, updateContainerStatus } from '../controllers/logistics.controller';
import { containerValidation } from '../middleware/validate';

const router = Router();

router.get('/search', searchContainers);
router.get('/:id', getContainerDetails);

router.use(protect);
router.post('/', authorize('logistics'), containerValidation, addContainer);
router.get('/my/containers', authorize('logistics'), getContainers);
router.put('/:id', authorize('logistics'), updateContainer);
router.delete('/:id', authorize('logistics'), deleteContainer);
router.put('/:id/status', authorize('logistics'), updateContainerStatus);

export default router;
