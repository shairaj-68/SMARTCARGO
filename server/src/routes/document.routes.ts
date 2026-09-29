import { Router } from 'express';
import { protect } from '../middleware/auth';
import { uploadDocument, getMyDocuments, verifyDocument, replaceDocument } from '../controllers/document.controller';
import { upload } from '../middleware/upload';

const router = Router();

router.use(protect);
router.post('/upload', upload.single('file'), uploadDocument);
router.get('/my', getMyDocuments);
router.put('/:id/verify', verifyDocument);
router.put('/:id/replace', upload.single('file'), replaceDocument);

export default router;
