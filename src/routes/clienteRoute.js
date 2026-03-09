import express from 'express';
import * as ClienteController from '../controllers/clienteController.js';
import autenticarApiKey from '../utils/apiKey.js'

const router = Router();

router.use(autenticarA);

router.post('/cliente', ClienteController.criarCliente);
router.get('/cliente',autenticarApiKey, ClienteController.listarClientes);
router.get('/cliente/:id', ClienteController.buscarPorId);
router.get('/cliente/:id/clima', ClienteController.getClimaCliente);
router.put('/cliente/:id', ClienteController.atualizarCliente);
router.delete('/cliente/:id', ClienteController.deletarCliente);

export default router;
