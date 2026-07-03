import { Router } from 'express';
import * as accountController from '../controllers/accountController';

const router = Router();

router.get('/', accountController.list);
router.post('/', accountController.create);
// POST em vez de PUT/DELETE: o proxy do Plesk só libera GET/POST/OPTIONS no
// preflight CORS, bloqueando PUT/DELETE no navegador.
router.post('/:id/update', accountController.update);
router.post('/:id/delete', accountController.remove);

export default router;
