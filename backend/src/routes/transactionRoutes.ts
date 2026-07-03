import { Router } from 'express';
import * as transactionController from '../controllers/transactionController';

const router = Router();

router.get('/summary', transactionController.summary);
router.get('/', transactionController.list);
router.post('/', transactionController.create);
router.put('/:id', transactionController.update);
router.delete('/:id', transactionController.remove);

export default router;
