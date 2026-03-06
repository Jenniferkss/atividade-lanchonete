import express from 'express';
import 'dotenv/config';

import produtosRoutes from './routes/produtoRoute.js';
import pedidosRoutes from './routes/pedidoRoute.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🚀 API funcionando');
});

app.use(produtosRoutes);
app.use(pedidosRoutes);

app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
