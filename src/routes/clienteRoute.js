import { Router } from 'express';
// Importando todas as funções do controller
import * as ClienteController from '../controllers/clienteController.js';
import { authMiddleware } from '../utils/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/cliente', ClienteController.criarCliente);
router.get('/cliente', ClienteController.listarClientes);
router.get('/cliente/:id', ClienteController.buscarPorId);
router.get('/cliente/:id/clima', ClienteController.getClimaCliente);
router.put('/cliente/:id', ClienteController.atualizarCliente);
router.delete('/cliente/:id', ClienteController.deletarCliente);

export default router;