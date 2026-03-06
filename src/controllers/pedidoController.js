import PedidoModel from '../models/PedidoModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ erro: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { clienteId } = req.body;

        if (!clienteId) {
            return res.status(400).json({ erro: 'O campo "clienteId" é obrigatório!' });
        }

        if (isNaN(clienteId)) {
            return res.status(400).json({ erro: 'O clienteId deve ser um número válido.' });
        }

        const cliente = await PedidoModel.buscarCliente(parseInt(clienteId));

        if (!cliente) {
            return res.status(404).json({ erro: 'Cliente não encontrado.' });
        }

        if (cliente.ativo === false) {
            return res
                .status(400)
                .json({ erro: 'Não é possível criar pedido para cliente inativo.' });
        }

        const data = await PedidoModel.criar(parseInt(clienteId));

        res.status(201).json({ mensagem: 'Pedido criado com sucesso!', data });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ erro: error.message });
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({ erro: 'Erro interno ao salvar o pedido.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const pedidos = await PedidoModel.buscarTodos();

        if (!pedidos || pedidos.length === 0) {
            return res.status(200).json({ mensagem: 'Nenhum pedido encontrado.' });
        }

        res.json(pedidos);
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        res.status(500).json({ erro: 'Erro ao buscar pedidos.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });
        }

        const pedido = await PedidoModel.buscarPorId(parseInt(id));

        if (!pedido) {
            return res.status(404).json({ erro: 'Pedido não encontrado.' });
        }

        res.json({ data: pedido });
    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        res.status(500).json({ erro: 'Erro ao buscar pedido.' });
    }
};

export const cancelar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id))
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });

        const pedido = await PedidoModel.buscarPorId(parseInt(id));

        if (!pedido) {
            return res.status(404).json({ erro: 'Pedido não encontrado.' });
        }

        if (pedido.status !== 'ABERTO') {
            return res
                .status(400)
                .json({ erro: 'Só é possível cancelar pedidos com status ABERTO.' });
        }

        const data = await PedidoModel.cancelar(parseInt(id));

        res.json({ mensagem: `O pedido #${data.id} foi cancelado com sucesso!`, data });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ erro: error.message });
        console.error('Erro ao cancelar pedido:', error);
        res.status(500).json({ erro: 'Erro ao cancelar pedido.' });
    }
};

export const adicionarItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { produtoId, quantidade } = req.body;

        if (isNaN(id))
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });
        if (!produtoId || !quantidade) {
            return res
                .status(400)
                .json({ erro: 'Os campos "produtoId" e "quantidade" são obrigatórios!' });
        }
        if (quantidade <= 0 || quantidade > 99) {
            return res
                .status(400)
                .json({ erro: 'A quantidade deve ser maior que 0 e no máximo 99.' });
        }

        const pedido = await PedidoModel.buscarPorId(parseInt(id));
        if (!pedido) {
            return res.status(404).json({ erro: 'Pedido não encontrado.' });
        }
        if (pedido.status !== 'ABERTO') {
            return res
                .status(400)
                .json({ erro: 'Não é possível adicionar itens a um pedido PAGO ou CANCELADO.' });
        }

        const produto = await PedidoModel.buscarProduto(parseInt(produtoId));
        if (!produto) {
            return res.status(404).json({ erro: 'Produto não encontrado.' });
        }
        if (produto.disponivel === false) {
            return res
                .status(400)
                .json({ erro: 'Não é possível adicionar um produto indisponível ao pedido.' });
        }

        const data = await PedidoModel.adicionarItem({
            pedidoId: parseInt(id),
            produtoId: parseInt(produtoId),
            quantidade: parseInt(quantidade),
            precoUnitario: produto.preco,
        });

        res.status(201).json({ mensagem: 'Item adicionado com sucesso!', data });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ erro: error.message });
        console.error('Erro ao adicionar item:', error);
        res.status(500).json({ erro: 'Erro interno ao adicionar item ao pedido.' });
    }
};

export const removerItem = async (req, res) => {
    try {
        const { id, itemId } = req.params;

        if (isNaN(id) || isNaN(itemId)) {
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });
        }

        const pedido = await PedidoModel.buscarPorId(parseInt(id));
        if (!pedido) {
            return res.status(404).json({ erro: 'Pedido não encontrado.' });
        }
        if (pedido.status !== 'ABERTO') {
            return res
                .status(400)
                .json({ erro: 'Não é possível remover item de um pedido PAGO ou CANCELADO.' });
        }

        const item = await PedidoModel.buscarItem(parseInt(itemId));
        if (!item || item.pedidoId !== parseInt(id)) {
            return res.status(404).json({ erro: 'Item não encontrado neste pedido.' });
        }

        await PedidoModel.removerItem(parseInt(id), parseInt(itemId));

        res.json({ mensagem: 'Item removido com sucesso!' });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ erro: error.message });
        console.error('Erro ao remover item:', error);
        res.status(500).json({ erro: 'Erro interno ao remover item do pedido.' });
    }
};
