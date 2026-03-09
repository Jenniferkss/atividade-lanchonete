import express from 'express';
import * as controller from '../controllers/itemController.js';

const router = express.Router();

router.post('/item', controller.criar);
router.get('/item', controller.buscarTodos);
router.get('/item/:id', controller.buscarPorId);
router.put('/item/:id', controller.atualizar);
router.delete('/item/:id', controller.deletar);

export default router;
