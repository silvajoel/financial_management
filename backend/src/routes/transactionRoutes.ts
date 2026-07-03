import { Router } from 'express';
import * as transactionController from '../controllers/transactionController';

const router = Router();

router.get('/summary', transactionController.summary);
router.get('/', transactionController.list);
router.post('/', transactionController.create);
router.post('/transfer', transactionController.transfer);
router.post('/generate-month', transactionController.generateMonth);
// POST em vez de PUT/DELETE: o proxy do Plesk (Apache/Passenger) responde o
// preflight CORS (OPTIONS) sozinho e só libera GET/POST/OPTIONS, bloqueando
// PUT/DELETE no navegador antes de chegar no Node.
router.post('/:id/update', transactionController.update);
router.post('/:id/delete', transactionController.remove);

export default router;
