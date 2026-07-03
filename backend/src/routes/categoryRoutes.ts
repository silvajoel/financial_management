import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';

const router = Router();

router.get('/', categoryController.list);
router.post('/', categoryController.create);
// POST em vez de PUT/DELETE: o proxy do Plesk só libera GET/POST/OPTIONS no
// preflight CORS, bloqueando PUT/DELETE no navegador.
router.post('/:id/update', categoryController.update);
router.post('/:id/delete', categoryController.remove);

export default router;
