import { Router } from 'express';
import * as accountController from '../controllers/accountController';

const router = Router();

router.get('/', accountController.list);
router.post('/', accountController.create);
router.put('/:id', accountController.update);
router.delete('/:id', accountController.remove);

export default router;
