import { Router } from 'express';
import multer from 'multer';
import * as invoiceController from '../controllers/invoiceController';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.get('/', invoiceController.list);
router.post('/preview', upload.single('arquivo'), invoiceController.preview);
router.post('/confirm', invoiceController.confirm);
// POST (não PUT): o proxy do Plesk só libera GET/POST/OPTIONS no preflight CORS.
router.post('/items/:id/update', invoiceController.updateItem);

export default router;
