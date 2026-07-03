import { Router } from 'express';
import * as goalController from '../controllers/goalController';

const router = Router();

router.get('/', goalController.list);
router.post('/', goalController.create);
// POST em vez de PUT/DELETE: o proxy do Plesk só libera GET/POST/OPTIONS no
// preflight CORS, bloqueando PUT/DELETE no navegador.
router.post('/:id/update', goalController.update);
router.post('/:id/delete', goalController.remove);

export default router;
