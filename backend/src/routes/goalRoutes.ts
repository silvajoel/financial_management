import { Router } from 'express';
import * as goalController from '../controllers/goalController';

const router = Router();

router.get('/', goalController.list);
router.post('/', goalController.create);
router.put('/:id', goalController.update);
router.delete('/:id', goalController.remove);

export default router;
