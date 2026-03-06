import { Router } from 'express';
// Importando todas as funções do controller
import * as itemController from '../controllers/itemController.js';
import { authMiddleware } from '../utils/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', itemController.criar);
router.get('/', itemController.buscarTodos);
router.get('/:id', itemController.buscarPorId);
router.put('/:id', itemController.atualizar);
router.delete('/:id', itemController.deletar);

export default router;
