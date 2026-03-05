import { Router } from 'express';
// Importando todas as funções do controller
import * as ClienteController from '../controllers/clienteController.js';
import { authMiddleware } from '../utils/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', ClienteController.criarCliente);
router.get('/', ClienteController.listarClientes);
router.get('/:id', ClienteController.buscarPorId);
router.get('/:id/clima', ClienteController.getClimaCliente);
router.put('/:id', ClienteController.atualizarCliente);
router.delete('/:id', ClienteController.deletarCliente);

export default router;